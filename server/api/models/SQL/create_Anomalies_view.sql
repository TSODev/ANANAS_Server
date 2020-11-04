

DROP VIEW IF EXISTS "anoview";
CREATE TABLE "anoview" ("anomalie_id" integer,"people_id" integer, "from" character varying, "etat" integer, "hra_id" integer, "hracode" character varying,"ln_id" integer, "lncode" character varying, "message" character varying, "debut" date, "commentaire" character varying,source integer,  "fullname" character varying, "tgi" character varying, "matricule" integer);


DROP TABLE IF EXISTS "anoview";
CREATE VIEW "anoview" AS SELECT 
anomalies.anomalie_id,
anomalies.people_id,
anomalie_from,
anomalies.etat,
anomalies.hra_id,
anomalies.hracode,
anomalies.ln_id,
anomalies.lncode,
anomalies.libelle,
    anomalies.debut,
    anomalies.commentaire,
    people.source,
    people.fullname,
    people.tgi,
    people.matricule
   FROM (anomalies
     JOIN people USING (people_id));
     