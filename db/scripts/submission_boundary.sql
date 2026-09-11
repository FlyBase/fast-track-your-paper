-- Preparation candidate, not a complete deployment migration.
-- Apply as the dedicated FTYP database schema owner with API access closed.
BEGIN;
CREATE ROLE ftyp_public NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
CREATE ROLE ftyp_admin_api NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
CREATE ROLE ftyp_submission_writer NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
CREATE ROLE ftyp_submission_reader NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA ftyp, ftyp_hidden, ftyp_admin FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA ftyp_hidden FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA ftyp_hidden FROM PUBLIC;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA ftyp, ftyp_hidden, ftyp_admin FROM PUBLIC;
-- Applies to future functions created by THIS migration/schema owner.
ALTER DEFAULT PRIVILEGES IN SCHEMA ftyp, ftyp_hidden, ftyp_admin REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
GRANT USAGE ON SCHEMA ftyp TO ftyp_public;
GRANT USAGE ON SCHEMA ftyp_admin, ftyp_hidden TO ftyp_admin_api;
GRANT USAGE ON SCHEMA ftyp_hidden TO ftyp_submission_writer, ftyp_submission_reader;
GRANT INSERT(user_data), SELECT(submitted_to_flybase) ON ftyp_hidden.submissions TO ftyp_submission_writer;
GRANT USAGE ON SEQUENCE ftyp_hidden.submissions_submission_id TO ftyp_submission_writer;
GRANT SELECT(fbrf) ON ftyp_hidden.submissions TO ftyp_submission_reader;
GRANT SELECT ON ftyp_hidden.submissions TO ftyp_admin_api;
ALTER FUNCTION ftyp.list_submissions() SET SCHEMA ftyp_admin;
ALTER FUNCTION ftyp.get_submission(text) SET SCHEMA ftyp_admin;
GRANT EXECUTE ON FUNCTION ftyp_admin.list_submissions(), ftyp_admin.get_submission(text) TO ftyp_admin_api;
CREATE OR REPLACE FUNCTION ftyp.submit_paper(submission jsonb) RETURNS timestamptz AS $$
DECLARE result timestamptz; gene jsonb;
BEGIN
  IF jsonb_typeof(submission) IS DISTINCT FROM 'object'
     OR jsonb_typeof(submission->'contact') IS DISTINCT FROM 'object'
     OR jsonb_typeof(submission#>'{contact,name}') IS DISTINCT FROM 'string'
     OR btrim(submission#>>'{contact,name}') = ''
     OR jsonb_typeof(submission#>'{contact,email}') IS DISTINCT FROM 'string'
     OR btrim(submission#>>'{contact,email}') = ''
     OR jsonb_typeof(submission#>'{contact,isAuthor}') IS DISTINCT FROM 'boolean'
     OR jsonb_typeof(submission->'flags') IS DISTINCT FROM 'object'
     OR jsonb_typeof(submission->'genes') IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Invalid submission fields' USING ERRCODE='22023';
  END IF;
  IF submission->'publication' IS NOT NULL AND submission->'publication' <> 'null'::jsonb THEN
    IF jsonb_typeof(submission->'publication') <> 'object'
       OR jsonb_typeof(submission#>'{publication,uniquename}') IS DISTINCT FROM 'string'
       OR (submission#>>'{publication,uniquename}') !~ '^FBrf[0-9]+$' THEN
      RAISE EXCEPTION 'Invalid publication' USING ERRCODE='22023';
    END IF;
  ELSIF jsonb_typeof(submission->'citation') IS DISTINCT FROM 'string'
        OR btrim(submission->>'citation') = '' THEN
    RAISE EXCEPTION 'Publication or citation required' USING ERRCODE='22023';
  END IF;
  FOR gene IN SELECT value FROM jsonb_array_elements(submission->'genes') LOOP
    IF jsonb_typeof(gene) <> 'object'
       OR jsonb_typeof(gene->'id') IS DISTINCT FROM 'string'
       OR btrim(gene->>'id') = ''
       OR jsonb_typeof(gene->'symbol') IS DISTINCT FROM 'string' THEN
      RAISE EXCEPTION 'Invalid gene fields' USING ERRCODE='22023';
    END IF;
  END LOOP;
  INSERT INTO ftyp_hidden.submissions(user_data) VALUES(submission)
  RETURNING submitted_to_flybase INTO result;
  RETURN result;
END
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = pg_catalog, pg_temp;
ALTER FUNCTION ftyp.submit_paper(jsonb) OWNER TO ftyp_submission_writer;
REVOKE ALL ON FUNCTION ftyp.submit_paper(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ftyp.submit_paper(jsonb) TO ftyp_public;
-- Preserve the existing native boolean semantics, without granting contact reads.
CREATE OR REPLACE FUNCTION public.pub_has_submission(pub public.pub) RETURNS bool AS $$
SELECT count(*) = 1 FROM ftyp_hidden.submissions WHERE ftyp_hidden.submissions.fbrf = $1.uniquename;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp;
ALTER FUNCTION public.pub_has_submission(public.pub) OWNER TO ftyp_submission_reader;
REVOKE ALL ON FUNCTION public.pub_has_submission(public.pub) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pub_has_submission(public.pub) TO ftyp_public;
COMMIT;
