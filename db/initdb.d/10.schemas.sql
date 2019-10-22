-- Schema for holding FTYP submissions.
CREATE SCHEMA IF NOT EXISTS ftyp;

/**
  The following code is required because the default schema used by Chado
  is 'public'.   In order to dump Chado from one schema to another we have
  to perform the following steps.

  1. Save the current public schema in the destination DB by moving it out of the way.
  2. Create an empty public schema in the destination DB.
  3. Load the production chado schema from the source DB into the empty public schema of the destination DB.
  4. Move this public schema to the desired final schema name.
  5. Restore the saved public schema.

  Chado DB (public schema) --- pg_dump --> FTYP DB (chado schema)
 */
-- Move public schema out of the way prior to loading the production chado schema.
--ALTER SCHEMA public RENAME TO public_save;

-- Load/restore the production chado schema here.
