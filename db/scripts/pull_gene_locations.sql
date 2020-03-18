COPY (SELECT f.feature_id, fl.feature_id IS NOT NULL
      FROM feature f
               JOIN cvterm cvt ON f.type_id = cvt.cvterm_id
               LEFT JOIN featureloc fl ON f.feature_id = fl.feature_id
      WHERE f.uniquename ~ '^FBgn[0-9]+$'
        and f.is_obsolete = false
        and f.is_analysis = false
        and cvt.name = 'gene'
    ) TO STDOUT;
