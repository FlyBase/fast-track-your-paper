-- Install the dedicated curator-export role; provision its password separately.
-- Do not grant this role to either API login. No submission data is modified.
BEGIN;
DO $role$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='ftyp_export_login') THEN
  CREATE ROLE ftyp_export_login LOGIN NOINHERIT NOSUPERUSER NOCREATEDB
   NOCREATEROLE NOREPLICATION NOBYPASSRLS;
 END IF;
 IF EXISTS (
  SELECT 1 FROM pg_catalog.pg_roles AS r
  WHERE r.rolname='ftyp_export_login' AND (
   r.rolsuper OR r.rolcreatedb OR r.rolcreaterole OR r.rolreplication OR r.rolbypassrls
   OR r.oid=(SELECT datdba FROM pg_catalog.pg_database WHERE datname=current_database())
   OR r.oid=(SELECT relowner FROM pg_catalog.pg_class WHERE oid='ftyp_hidden.submissions'::regclass)
   OR EXISTS (SELECT 1 FROM pg_catalog.pg_auth_members WHERE member=r.oid OR roleid=r.oid)
  )
 ) THEN
  RAISE EXCEPTION 'Existing export role has unexpected ownership or memberships';
 END IF;
END
$role$;
GRANT CONNECT ON DATABASE ftyp TO ftyp_export_login;
GRANT USAGE ON SCHEMA ftyp_hidden TO ftyp_export_login;
GRANT SELECT, UPDATE(date_processed) ON ftyp_hidden.submissions TO ftyp_export_login;
COMMIT;
