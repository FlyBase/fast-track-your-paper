SELECT json_agg(
               row_to_json(row)
           )
FROM (
         SELECT *
         FROM ftyp_hidden.submissions
         WHERE date_processed IS NULL
     ) AS row
;
