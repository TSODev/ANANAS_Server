
    -- anomalie_id: Number,
    -- people_id: Number,
    -- code: String,
    -- subcode: String,
    -- libelle: String,
    -- debut: Date,
    -- fin: Date,
    -- createdDate: Date



DROP TABLE IF EXISTS anomalies;
DROP SEQUENCE IF EXISTS anomalies_anomalie_id_seq;
CREATE SEQUENCE anomalies_anomalie_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;
ALTER SEQUENCE anomalies_anomalie_id_seq RESTART WITH 1;


CREATE TABLE ananas.anomalies (
    anomalie_id integer DEFAULT nextval('anomalies_anomalie_id_seq') NOT NULL,
    people_id integer NOT NULL,
    anomalie_from varchar,
    etat integer NOT NULL,
    hracode varchar NOT NULL,
    lncode varchar,
    libelle varchar,
    debut date,
    commentaire varchar,
    createddate date,
    CONSTRAINT anomalie_pkey PRIMARY KEY (anomalie_id)
) WITH (oids = false);

CREATE INDEX anomalies_people_idx ON anomalies (people_id);
CREATE INDEX anomalie_etat_idx ON anomalies (etat);