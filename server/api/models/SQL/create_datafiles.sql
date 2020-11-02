DROP TABLE IF EXISTS "datafiles";
DROP SEQUENCE IF EXISTS datafile_id_seq;
CREATE SEQUENCE datafile_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;
ALTER SEQUENCE datafile_id_seq RESTART WITH 1;

CREATE TABLE "ananas"."datafiles" (
    "datafile_id" integer DEFAULT nextval('datafile_id_seq') NOT NULL,
    "datafilename" character varying,
    "datafileloaddate" timestamptz,
    "nbrecords" integer,
    "createddate" timestamp,
    CONSTRAINT "datafile_key" PRIMARY KEY ("datafile_id"),
    CONSTRAINT "datafilename_unique" UNIQUE ("datafilename")
) WITH (oids = false);
