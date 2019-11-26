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
           )::tsvector as text_index_col
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
CREATE INDEX pub_text_idx ON ftyp_hidden.pub_search USING GIN (text_index_col);

/**
  ftyp.search_pubs will perform a text search on a pre-defined set of
  publication fields.  The fields searched are defined by the
  ftyp_hidden.pub_search.text_index_col materialized view column.

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
    WHERE text_index_col @@ plainto_tsquery('simple', terms)
    ORDER BY ts_rank_cd(text_index_col, plainto_tsquery('simple', terms)) DESC
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
    curated_by text[];
    cam_flag text[];
    gene_count integer = 0;
BEGIN

    -- Select all 'curated_by' derived statuses for an FBrf into an array of values.
    SELECT array_agg(status_from_curatedby(value)) FROM flybase.get_pubprop(pub.uniquename, 'curated_by') INTO curated_by;

    -- If any curated_by props for this FBrf have 'user', return 'user'.
    IF array_position(curated_by,'user') IS NOT NULL THEN
      RETURN 'user';
    -- If any curated_by props for this FBrf have 'skim', return 'skim'.
    ELSIF array_position(curated_by,'skim') IS NOT NULL THEN
      RETURN 'skim';
    -- Check cam_flag and gene counts.
    ELSE
      -- Select all 'cam_flag' derived statuses for an FBrf into an array of values.
      SELECT array_agg(value) FROM flybase.get_pubprop(pub.uniquename, 'cam_flag') INTO cam_flag;

      -- Calculate the number of genes attached to this FBrf.
      SELECT count(*)
      FROM pub p JOIN feature_pub fp on (p.pub_id=fp.pub_id)
                 JOIN feature f on (fp.feature_id=f.feature_id)
      -- Join query to the pub table entry that was passed to this function.
      WHERE p.pub_id = pub.pub_id
        AND flybase.data_class(f.uniquename) = 'FBgn'
        AND f.is_obsolete = false
        AND f.is_analysis = false
      INTO gene_count;

      -- If any cam_flag props for this FBrf have 'nocur', return 'skim'.
      IF array_position(cam_flag,'nocur') IS NOT NULL THEN
        RETURN 'skim';
      -- If the FBrf has genes attached, return 'skim'.
      ELSIF gene_count > 0 THEN
          RETURN 'skim';
      ELSE
        RETURN NULL;
      END IF;
    END IF;
END
$$ LANGUAGE plpgsql STABLE;

