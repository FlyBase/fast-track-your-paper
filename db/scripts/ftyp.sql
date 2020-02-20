/**
  This materialized view powers the FTYP publication search.
  It is in the ftyp_hidden schema so that it is not directly exposed
  to the GraphQL API and instead access through the ftyp.search_pubs() function.
 */
DROP MATERIALIZED VIEW IF EXISTS ftyp_hidden.pub_search;
CREATE MATERIALIZED VIEW
    ftyp_hidden.pub_search AS
/**
  Create a 3 column view of pub_id, uniquename, and the full text vector type for indexing.
  When new fields are added be sure to add the field name to the concat_ws function here.
 */
SELECT p.pub_id,
       p.uniquename,
       (
           -- Weights can be A-D in Postgres v10
           concat_ws(' ',
                     setweight(to_tsvector('simple', p.uniquename), 'A'),
                     setweight(to_tsvector('simple', p.miniref), 'B'),
                     setweight(to_tsvector('simple', p.title), 'B'),
               -- PubMed, PMC ID, DOI, ISBN, secondary FBrf
                     setweight(to_tsvector('simple', pdbx.txt), 'C'),
               -- Authors
                     setweight(to_tsvector('simple', pa.txt), 'A'),
                     setweight(to_tsvector('simple', p.pyear), 'C'),
                     setweight(to_tsvector('simple', p.pages), 'D'),
                     setweight(to_tsvector('simple', p.volume), 'D'),
                     setweight(to_tsvector('simple', p.volumetitle), 'D'),
                     setweight(to_tsvector('simple', p.issue), 'D'),
                     setweight(to_tsvector('simple', p.series_name), 'D'),
                     setweight(to_tsvector('simple', p.publisher), 'D'),
                     setweight(to_tsvector('simple', p.pubplace), 'D')
               )
           )::tsvector AS pub_tsvector
FROM pub p
         -- Pull in all pub authors.
         LEFT JOIN (
    SELECT pa.pub_id,
           -- Since pub->author is a one to many relationship we concatenate the
           -- pubauthor fields into a single value.
           concat_ws(' ',
               /**
                 string_agg is used here to combine multiple rows of results into a
                 single text value.
                 e.g. Instead of a result with 3 rows
                 W. Gelbart
                 T. Kaufman
                 B. Calvi

                 we produce a result with 1 row delimited by spaces.
                 W. Gelbart T. Kaufman B. Calvi
                */
                     string_agg(concat_ws(' ', pa.givennames, pa.surname, pa.suffix), ' ')
               ) AS txt
    FROM pubauthor pa
         -- The 1 here refers to the pa.pub_id column.
    GROUP BY 1
) pa USING (pub_id)
    -- Pull in various pub dbxref values
         LEFT JOIN (
    SELECT pdbx.pub_id, string_agg(dbx.accession, ' ') AS txt
    FROM pub_dbxref pdbx
             JOIN dbxref dbx USING (dbxref_id)
             JOIN db USING (db_id)
    WHERE upper(db.name) in ('PUBMED', 'PMCID', 'FLYBASE', 'ISBN', 'DOI')
      AND pdbx.is_current = true
      -- The 1 here refers to pbdb.pub_id
    GROUP BY 1
) pdbx USING (pub_id)
WHERE flybase.data_class(p.uniquename) = 'FBrf'
  AND p.is_obsolete = false;

-- Full text index on the materialize view.
CREATE INDEX pub_text_idx ON ftyp_hidden.pub_search USING GIN (pub_tsvector);

/**
  ftyp.search_pubs will perform a text search on a pre-defined set of
  publication fields.  The fields searched are defined by the
  ftyp_hidden.pub_search.pub_tsvector materialized view column.

  This function takes a query term(s) and performs a full text search
  on this view.  It then orders them by a descending rank and returns
  the corresponding Chado pub table entry for the result.
 */
CREATE OR REPLACE FUNCTION ftyp.search_pubs(terms text) RETURNS SETOF pub AS
$$
SELECT p.*
FROM pub p
         JOIN cvterm cvt on (p.type_id = cvt.cvterm_id)
WHERE cvt.name IN ('paper', 'review', 'note')
  AND p.pub_id IN (
    SELECT pub_id
    FROM ftyp_hidden.pub_search
    WHERE pub_tsvector @@ plainto_tsquery('simple', terms)
    ORDER BY ts_rank_cd(pub_tsvector, plainto_tsquery('simple', terms)) DESC
);
$$ LANGUAGE SQL STABLE;

/*
 * This function returns the curation status from a 'curated_by' pubprop in Chado.
 * Cambridge curators have requested three curation status types.
 * 1. user
 * 2. skim
 * 3. uncurated
 */
CREATE OR REPLACE FUNCTION public.status_from_curatedby(curated_by text) RETURNS text AS
$$
DECLARE
    proforma text;
BEGIN
    SELECT (regexp_match(curated_by, 'Proforma: (.*?);'))[1] INTO proforma;

    IF proforma ~ '(skim|\.thin$)' THEN
        RETURN 'skim';
    ELSIF proforma ~ '\.user$' THEN
        RETURN 'user';
    ELSE
        RETURN NULL;
    END IF;
END
$$ LANGUAGE plpgsql STABLE;

/*
 * Postgraphile computed field: pub.curation_status or pub.curationStatus in GraphQL
 *
 * This function is use by Postgraphile to autogenerate a computed field for the pub table.
 * The GraphQL API exposes this function as a field along with all the
 * other fields of the pub table.
 *
 * The logic for this field comes from Cambridge Curators (Aoife and Gillian, 11/26/2019).
 */
CREATE OR REPLACE FUNCTION public.pub_curation_status(pub pub) RETURNS text AS
$$
DECLARE
    curated_by   text[];
    has_nocur    boolean = false;
    has_features boolean = false;
BEGIN

    -- Select all 'curated_by' derived statuses for an FBrf into an array of values.
    SELECT array_agg(status_from_curatedby(value))
    FROM flybase.get_pubprop(pub.uniquename, 'curated_by')
    INTO curated_by;

    -- If any curated_by props for this FBrf have 'user', return 'user'.
    IF array_position(curated_by, 'user') IS NOT NULL THEN
        RETURN 'user';
        -- If any curated_by props for this FBrf have 'skim', return 'skim'.
    ELSIF array_position(curated_by, 'skim') IS NOT NULL THEN
        RETURN 'skim';
        -- Check cam_flag and gene counts.
    ELSE
        -- Check for presence of 'cam_flag' with 'nocur'
        SELECT count(*) > 0
        FROM flybase.get_pubprop(pub.uniquename, 'cam_flag')
        WHERE value = 'nocur'
        INTO has_nocur;

        -- See if pub has any genes attached.
        SELECT count(*) > 0
        FROM pub p
                 JOIN feature_pub fp on (p.pub_id = fp.pub_id)
                 JOIN feature f on (fp.feature_id = f.feature_id)
             -- Join query to the pub table entry that was passed to this function.
        WHERE p.pub_id = pub.pub_id
          AND flybase.data_class(f.uniquename) IN ('FBgn', 'FBal', 'FBab', 'FBba', 'FBtp', 'FBti', 'FBte')
          AND f.is_obsolete = false
          AND f.is_analysis = false
        INTO has_features;

        -- If any cam_flag props for this FBrf have 'nocur', return 'skim'.
        -- If the FBrf has genes attached, return 'skim'.
        IF has_nocur OR has_features THEN
            RETURN 'skim';
        END IF;
    END IF;

    -- Return null if all else fails.
    RETURN NULL;
END
$$ LANGUAGE plpgsql STABLE;


/**
  This materialized view powers the gene search of FTYP.
  The columns are FBgn ID, current symbol, and
 */
DROP MATERIALIZED VIEW IF EXISTS ftyp_hidden.gene_search;
CREATE MATERIALIZED VIEW
    ftyp_hidden.gene_search AS
SELECT f.feature_id,
       f.uniquename                            fbgn,
       flybase.current_symbol(f.uniquename) AS symbol,
       json_build_object(
               'FBgn', f.uniquename,
               'Symbol', flybase.current_symbol(f.uniquename),
               'Annotation ID', CG.accession,
               'Name', flybase.current_fullname(f.uniquename),
               'Plain Symbol', f.name,
               'Synonyms', s.synonyms
           )                                AS identifiers,
    /**
      This field builds a tsvector that is used for fast full text searching.
      Each field that we want to search is first parsed into a ts_vector using
      the 'simple' config.  Using 'english' or other configs will not work
      with gene symbols.  The tsvector is then weighted according to
      importance using a scale of A-D in PostgreSQL v10.
      Finally, the weighted tsvector is concatenated together into a single value.
     */
       (
           concat_ws(' ',
                     setweight(to_tsvector('simple', f.uniquename), 'A'), -- FlyBase ID
                     setweight(to_tsvector('simple', flybase.current_symbol(f.uniquename)), 'A'), -- Current symbol
                     setweight(to_tsvector('simple', CG.accession), 'A'), -- CG Number
                     setweight(to_tsvector('simple', flybase.current_fullname(f.uniquename)), 'B'),-- Current fullname
                     setweight(to_tsvector('simple', f.name), 'C'), -- Plain symbol
                     setweight(to_tsvector('simple', concat_ws(' ', s.synonyms, CG_synonym.accession)), 'D') -- Synonyms
               )
           )::tsvector                      AS identifiers_tsvector
FROM feature f
         JOIN cvterm ON f.type_id = cvterm.cvterm_id
         JOIN organism o ON f.organism_id = o.organism_id
    /**
      Get Symbol and name synonyms.
     */
         LEFT JOIN LATERAL (
    SELECT fs.feature_id,
           string_agg(
                   DISTINCT
                   (
                       CASE
                           WHEN synonym.name = synonym.synonym_sgml THEN synonym.synonym_sgml
                           ELSE concat_ws(' ', synonym.synonym_sgml, synonym.name)
                           END
                       ),
                   ' '
               ) AS synonyms
    FROM feature_synonym fs
             JOIN synonym ON fs.synonym_id = synonym.synonym_id
             JOIN cvterm stype ON synonym.type_id = stype.cvterm_id
    WHERE (stype.name = 'symbol' OR stype.name = 'fullname')
      AND fs.is_current = false
      AND f.feature_id = fs.feature_id
    GROUP BY fs.feature_id
    ) AS s ON TRUE
    /**
     Get Annotation IDs
     */
         LEFT JOIN LATERAL (
    SELECT dbx.accession
    FROM feature_dbxref fdbx
             JOIN dbxref dbx ON fdbx.dbxref_id = dbx.dbxref_id
             JOIN db ON dbx.db_id = db.db_id
    WHERE upper(db.name) = 'FLYBASE ANNOTATION IDS'
      AND fdbx.is_current = true
      AND f.feature_id = fdbx.feature_id
    LIMIT 1
    ) AS CG ON TRUE
    /**
      Get Secondary Annotation IDs
     */
         LEFT JOIN LATERAL (
    SELECT string_agg(DISTINCT dbx.accession, ' ') AS accession
    FROM feature_dbxref fdbx
             JOIN dbxref dbx ON fdbx.dbxref_id = dbx.dbxref_id
             JOIN db ON dbx.db_id = db.db_id
    WHERE upper(db.name) = 'FLYBASE ANNOTATION IDS'
      AND fdbx.is_current = false
      AND f.feature_id = fdbx.feature_id
    ) AS CG_synonym ON TRUE
WHERE f.uniquename ~ '^FBgn\d+$'
  AND f.is_obsolete = false
  AND (o.genus = 'Drosophila' AND o.species = 'melanogaster')
;

-- Activate postgres trigram extension.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- Create a full text index on the tsvector column for identifiers.
CREATE INDEX ON ftyp_hidden.gene_search USING gin (identifiers_tsvector);
-- Create a trigram GIN index
CREATE INDEX symbol_trgm_idx ON ftyp_hidden.gene_search USING GIN (symbol gin_trgm_ops);

CREATE OR REPLACE FUNCTION ftyp.search_gene_identifiers(terms text, OUT FBgn text, OUT symbol text, OUT match_highlight json) RETURNS SETOF record AS
$$
SELECT gs.fbgn                                                                    as FBgn,
       gs.symbol,
       ts_headline('simple', gs.identifiers, to_tsquery('simple', terms || ':*')) AS match_highlight
FROM ftyp_hidden.gene_search AS gs
WHERE gs.symbol ILIKE terms || '%'
   OR identifiers_tsvector @@ to_tsquery('simple', terms || ':*')
ORDER BY
    -- First sort by distance between query and the symbol (ascending).
    terms <-> symbol,
    --  Then sort by score of query and a full text score against all IDs (ID, symbol, name, etc.)
    ts_rank(identifiers_tsvector, plainto_tsquery('simple', terms)) DESC,
    -- Then sort by a score of a wildcard query and a full text score against all IDs.
    ts_rank(identifiers_tsvector, to_tsquery('simple', terms || ':*')) DESC
LIMIT 30
    ;
$$ LANGUAGE SQL STABLE;

