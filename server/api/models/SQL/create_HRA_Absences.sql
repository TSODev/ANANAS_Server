-- "Matricule gestion",
-- "Code absence",
-- "Code langue",
-- "Date début absence",
-- "Date fin absence",
-- "Horodatage chrgmt",
-- "Identifiant",
-- "Ident situation",
-- "Id élém rémun",
-- "Libellé absence",
-- "Matricule gestion_1",
-- "Modèle rép absence",
-- "Numéro de bulletin",
-- "Numéro traitement",
-- "Partition Réglem.",
-- "Position sur le bu",
-- "Période de paie",
-- "Réglementation",
-- "Répertoire absence",
-- "Source absence",
-- "Usage de paie",
-- "Centre de coût",
-- "Matricule GP",
-- "Nom usuel GP",
-- "Prénom GP"

-- "Matricule gestion","Code absence","Code langue","Date début absence","Date fin absence","Horodatage chrgmt","Identifiant","Ident situation","Id élém rémun","Libellé absence","Matricule gestion_1","Modèle rép absence","Numéro de bulletin","Numéro traitement","Partition Réglem.","Position sur le bu","Période de paie","Réglementation","Répertoire absence","Source absence","Usage de paie","Centre de coût","Matricule GP","Nom usuel GP","Prénom GP"

----    absence_id: string,
--    people_id: string,
--    code: string,
--    libelle: string,
--    debut: Date,
--    fin: Date,
--    identifiant: string,
--  modele_rep_absence: string,
--    num_bulletin: string,
--    num_traitement: string,
--    partition_reglem: string,
--   position_bu: string,
--    periode_paie: string,
--    reglementation: string,
--    repertoire_absence: string,
--    source_absence: string,
--    usage_paie: string,
--    centre_cout: string,
--    matricule_GP: string,
--    abs_month: number,
--    abs_year: number,
--    createdDate: Date

DROP TABLE IF EXISTS "hra_absences";
DROP SEQUENCE IF EXISTS hra_absences_absence_id_seq;
CREATE SEQUENCE hra_absences_absence_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;
ALTER SEQUENCE hra_absences_absence_id_seq RESTART WITH 1;

CREATE TABLE "ananas"."hra_absences" (
    absence_id integer DEFAULT nextval('hra_absences_absence_id_seq') NOT NULL,
    people_id integer,
    load_id integer,
    code varchar,
    libelle varchar,
    debut date,
    fin date,
    identifiant varchar,
    modele_rep_absence varchar,
    num_bulletin varchar,
    num_traitement varchar,
    partition_reglem varchar,
    position_bu varchar,
    periode_paie varchar,
    reglementation varchar,
    repertoire_absence varchar,
    source_absence varchar,
    usage_paie varchar,
    centre_cout varchar,
    matricule_gp varchar,
    hasanomalie boolean,
    createddate date,
    CONSTRAINT hra_absences_pkey PRIMARY KEY (absence_id)
) WITH (oids = false);

CREATE INDEX people_idx ON hra_absences (people_id);
CREATE INDEX load_idx ON hra_absences (load_id);
