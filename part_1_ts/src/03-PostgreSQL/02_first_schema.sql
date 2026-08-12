-- schema
CREATE SCHEMA IF NOT EXISTS basics;

-- extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- query
SELECT schema_name
FROM information_schema.schemata
ORDER BY schema_name;

