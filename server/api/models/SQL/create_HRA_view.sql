
DROP VIEW IF EXISTS "hraview";
CREATE TABLE "hraview" ("code" character varying, "libelle" character varying, "debut" date, "fin" date, periode character varying, centre_cout character varying, source integer, "fullname" character varying, "tgi" character varying, "matricule" integer);


DROP TABLE IF EXISTS "hraview";
CREATE VIEW "hraview" AS SELECT hra_absences.code,
    hra_absences.libelle,
    hra_absences.debut,
    hra_absences.fin,
    hra_absences.periode_paie,
    hra_absences.centre_cout,
    hra_absences.hasanomalie,
    people.source,
    people.fullname,
    people.tgi,
    people.matricule
   FROM (hra_absences
     JOIN people USING (people_id));
     