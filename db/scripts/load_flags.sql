CREATE TABLE ftyp_hidden.text_mining_flag
(
    epicycle  text,
    fbrf      varchar(25) NOT NULL,
    data_type text,
    flag_type text
);

COPY ftyp_hidden.text_mining_flag FROM '/ftyp/data/text_mining/textmining_positive_SVM.txt';
