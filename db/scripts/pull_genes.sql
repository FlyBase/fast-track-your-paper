COPY (SELECT f.*
      FROM feature f
               JOIN cvterm cvt ON f.type_id = cvt.cvterm_id
      WHERE f.uniquename ~ '^FBgn[0-9]+$'
        and f.is_obsolete = false
        and f.is_analysis = false
        and cvt.name = 'gene'
    ) TO STDOUT;
