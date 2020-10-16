COPY (SELECT f.feature_id, summary.feature_id IS NOT NULL
      FROM feature f
               JOIN cvterm cvt ON f.type_id = cvt.cvterm_id
               LEFT JOIN (
                   SELECT fp.* FROM featureprop fp JOIN cvterm fpt ON fp.type_id = fpt.cvterm_id
                               WHERE fpt.name = 'gene_summary_text'
               ) AS summary ON f.feature_id = summary.feature_id
      WHERE f.uniquename ~ '^FBgn[0-9]+$'
        and f.is_obsolete = false
        and f.is_analysis = false
        and cvt.name = 'gene'
    ) TO STDOUT;
