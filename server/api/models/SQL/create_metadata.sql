DROP TABLE IF EXISTS "metadata";
DROP SEQUENCE IF EXISTS metadata_id_seq;
CREATE SEQUENCE metadata_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;
ALTER SEQUENCE metadata_id_seq RESTART WITH 1;

CREATE TABLE "ananas"."metadata" (
    "_id" integer DEFAULT nextval('metadata_id_seq') NOT NULL,
    metadata_group character varying,
    metadata_key character varying,
    metadata_value character varying,
    createddate date,
    CONSTRAINT "key_unique" UNIQUE ("metadata_group","metadata_key")
) WITH (oids = false);


