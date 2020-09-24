CREATE TABLE ftyp_hidden.text_mining_flag
(
    epicycle  text,
    fbrf      varchar(25),
    pmid      varchar(25),
    data_type text,
    flag_type text
);

COPY ftyp_hidden.text_mining_flag FROM '/ftyp/data/text_mining/data_flags.tsv';

