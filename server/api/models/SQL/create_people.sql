-- export interface IPeople {
--     people_id: string,
--     matricule: string,
--     tgi: string,
--     fullname: string,
--     firstname: string,
--     lastname: string,
--     HRA_absences: [string]
--     LN_absences: [string]
--     posact: string,
--     entree: Date,
--     sortie: Date,
--     createdDate: Date
-- }



DROP TABLE IF EXISTS people;
DROP SEQUENCE IF EXISTS people_people_id_seq;
CREATE SEQUENCE people_people_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;
ALTER SEQUENCE people_people_id_seq RESTART WITH 1;

CREATE TABLE ananas.people (
    people_id integer DEFAULT nextval('people_people_id_seq') NOT NULL,
    source integer NOT NULL,
    matricule integer NOT NULL,
    tgi varchar NOT NULL,
    fullname varchar,
    firstname varchar,
    lastname varchar,
    posact varchar,
    entree varchar,
    sortie varchar,
    createddate date,
--    CONSTRAINT people_matricule_key UNIQUE (matricule),
    CONSTRAINT people_pkey PRIMARY KEY (people_id),
    CONSTRAINT people_tgi_key UNIQUE (tgi)
) WITH (oids = false);
