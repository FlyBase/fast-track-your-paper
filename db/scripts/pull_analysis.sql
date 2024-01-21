-- This pulls the analysis records required for the flyBERT
COPY (SELECT a.*
      FROM analysis a
        JOIN pub_analysis_feature paf ON paf.analysis_id = a.analysis_id
        JOIN feature f ON paf.feature_id = f.feature_id
        JOIN pub p ON paf.pub_id = p.pub_id
      WHERE f.uniquename ~ '^FBgn[0-9]+$'
        AND f.is_obsolete = false
        AND f.is_analysis = false
     ) TO STDOUT;
