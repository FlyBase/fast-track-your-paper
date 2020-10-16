COPY (SELECT f.*
      FROM feature f
               JOIN cvterm cvt ON f.type_id = cvt.cvterm_id
               JOIN organism o ON f.organism_id = o.organism_id
      WHERE f.uniquename ~ '^FBgn[0-9]+$'
        AND f.is_obsolete = false
        AND f.is_analysis = false
        AND cvt.name = 'gene'
        AND (
            (o.genus = 'Drosophila' AND o.species = 'melanogaster')
            OR
            (o.genus = 'Homo' AND o.species = 'sapiens')
        )
    ) TO STDOUT;
