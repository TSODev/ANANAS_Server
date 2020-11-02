DROP TABLE IF EXISTS "ananas"."users";
DROP SEQUENCE IF EXISTS "ananas".users_user_id_seq;
CREATE SEQUENCE "ananas".users_user_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;

CREATE TABLE "ananas"."users" (
    "user_id" integer DEFAULT nextval('users_user_id_seq') NOT NULL,
    "email" character varying(100),
    "domain" character varying(100),
    "company" character varying(100),
    "passworddigest" character varying(255),
    "firstname" character varying(100),
    "lastname" character varying(100),
    "roles" text[],
    "license" character varying(100),
    "lastlogin" date,
    "createddate" date,
    CONSTRAINT "email_unique" UNIQUE ("email"),
    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
) WITH (oids = false);

-- INSERT INTO "users" ("user_id", "email", "domain", "company", "passworddigest", "firstname", "lastname", "roles", "license", "lastlogin", "createddate") VALUES
-- (38,	'thierry.soulie@tsodev.fr',	NULL,	NULL,	'$argon2i$v=19$m=4096,t=3,p=1$20M2nbwkTe7H5+joumZ+Gw$XUwL6KW7DUY/TaGuYphbKpP6/t2CrnOFbA9s8qLMKUA',	'Thierry',	'Soulie',	'{ADMIN,LOCALADMIN}',	NULL,	NULL,	'2020-10-09'),
-- (39,	'rutad@example.com',	NULL,	NULL,	'$argon2i$v=19$m=4096,t=3,p=1$m1Y22YywuYDHuoNJe7SyKw$oSaZslGvWkb7FCJzRX00lpW5vRxmzuftmwCCflvmp40',	'Gabriel',	'Colon',	'{USER}',	NULL,	NULL,	'2020-10-09'),
-- (40,	'mehuvewo@example.com',	NULL,	NULL,	'$argon2i$v=19$m=4096,t=3,p=1$k6PhYPXS9hlbrlEOqSZy+A$CJ2TrPVKvd5hLwEpJ6c2TmfiWp5BaPwk7R7GcMqsdXU',	'Louisa',	'Norris',	'{USER}',	NULL,	NULL,	'2020-10-09'),
-- (41,	'uchuzcan@example.com',	NULL,	NULL,	'$argon2i$v=19$m=4096,t=3,p=1$UjMqShAX+fV9daVd+yDwJQ$PLUrWPyXFhfubbt/YQ1niZRd++kqJ1JIzdzjHNI09Xk',	'Amelia',	'Norton',	'{USER}',	NULL,	NULL,	'2020-10-09'),
-- (42,	'hahiino@example.com',	NULL,	NULL,	'$argon2i$v=19$m=4096,t=3,p=1$ZczVAN5HwRsk7CRXkx6a7w$1RNUg2ad4S1XapHOQb4y8kHH58hM+iNVCza0TFFZpwA',	'Willie',	'Cain',	'{USER}',	NULL,	NULL,	'2020-10-09'),
-- (43,	'hujfusmag@example.com',	NULL,	NULL,	'$argon2i$v=19$m=4096,t=3,p=1$/o3jv1kru3vWpBd0DfBlAA$Ajzn8BLGVlpICeU/Lzqx2F0IiN4Sl3+mBtPVMV7JiH8',	'Lola',	'Garza',	'{USER}',	NULL,	NULL,	'2020-10-09'),
-- (44,	'rugawlen@example.com',	NULL,	NULL,	'$argon2i$v=19$m=4096,t=3,p=1$b3GOJXbQW3RfkrNAC+jEjw$hjxOyAKan1Tn8K+xNC07yrKlLaKwUbYwAx1XDZEn8Tw',	'Leonard',	'Rodriquez',	'{USER}',	NULL,	NULL,	'2020-10-09');