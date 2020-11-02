-- export interface ILN_Absence {
--     absence_id: string,
--     people_id: string,
--     matricule: string,
--     tgi: string,
--     code: string,
--     group: string,
--     debut: Date,
--     fin: Date,
--     abs_month: number,
--     abs_year: number,
--     createdDate: Date
-- }

DROP TABLE IF EXISTS "ln_absences";
DROP SEQUENCE IF EXISTS ln_absences_absence_id_seq;
CREATE SEQUENCE ln_absences_absence_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;
ALTER SEQUENCE ln_absences_absence_id_seq RESTART WITH 1;

CREATE TABLE "ananas"."ln_absences" (
    "absence_id" integer DEFAULT nextval('ln_absences_absence_id_seq') NOT NULL,
    "people_id" integer,
    "matricule" varchar,
    "tgi" varchar,
    "code" varchar,
    "regroupement" varchar,
    "debut" date,
    "fin" date,
    "hasanomalie" boolean,
    "createddate" date,
    CONSTRAINT "ln_absences_pkey" PRIMARY KEY ("absence_id")
) WITH (oids = false);

