CREATE TABLE ftyp_hidden.text_mining_flag
(
    epicycle  text,
    fbrf      varchar(25) NOT NULL,
    data_type text,
    flag_type text
);

COPY ftyp_hidden.text_mining_flag FROM '/ftyp/data/text_mining/data_flags.tsv';

CREATE INDEX tf_epicycle_idx ON ftyp_hidden.text_mining_flag (epicycle);
CREATE INDEX tf_fbrf_idx ON ftyp_hidden.text_mining_flag (fbrf);
CREATE INDEX tf_data_type_idx ON ftyp_hidden.text_mining_flag (data_type);
CREATE INDEX tf_flag_type_idx ON ftyp_hidden.text_mining_flag (flag_type);
