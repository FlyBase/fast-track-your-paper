COPY (SELECT * FROM feature
               WHERE feature.uniquename ~ '^FBgn[0-9]+$'
                 and is_obsolete = false
                 and is_analysis = false
) TO STDOUT;
