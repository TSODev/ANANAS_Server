

DROP VIEW IF EXISTS "lnview";
CREATE TABLE "lnview" ("code" character varying, "debut" date, "fin" date, source integer, "fullname" character varying, "tgi" character varying, "matricule" integer);


DROP TABLE IF EXISTS "lnview";
CREATE VIEW "lnview" AS SELECT ln_absences.code,
    ln_absences.debut,
    ln_absences.fin,
    people.source,
    people.fullname,
    people.tgi,
    people.matricule
   FROM (ln_absences
     JOIN people USING (people_id));
     