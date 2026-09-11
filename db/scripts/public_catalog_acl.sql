-- Apply after submission_boundary.sql against the retained trusted FTYP catalog.
-- Core native tables/signatures are required; wider Chado catalogs are optional.
-- Execute as schema owner before exposing either API. No submitted data reads.
BEGIN;
REVOKE CREATE ON SCHEMA flybase FROM PUBLIC;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA flybase FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA flybase REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
GRANT USAGE ON SCHEMA public, flybase, ftyp_hidden TO ftyp_public;
GRANT SELECT ON public.pub, public.cvterm, public.pubprop,
 public.feature, public.feature_pub, public.feature_dbxref,
 public.dbxref, public.db, public.pub_dbxref,
 public.feature_synonym, public.synonym,
 ftyp_hidden.pub_search, ftyp_hidden.gene_search,
 ftyp_hidden.text_mining_flag TO ftyp_public;
-- Preserve support for these native identifier classes when the deployment
-- includes the corresponding Chado catalogs. Do not manufacture missing tables.
DO $$
DECLARE catalog_name text;
BEGIN
  FOREACH catalog_name IN ARRAY ARRAY[
    'stock', 'stock_genotype', 'genotype', 'grp', 'grp_synonym',
    'strain', 'strain_synonym', 'cell_line', 'cell_line_synonym',
    'humanhealth', 'humanhealth_synonym', 'library', 'library_synonym'
  ] LOOP
    IF pg_catalog.to_regclass(pg_catalog.format('public.%I', catalog_name)) IS NOT NULL THEN
      EXECUTE pg_catalog.format('GRANT SELECT ON TABLE public.%I TO ftyp_public', catalog_name);
    END IF;
  END LOOP;
END
$$;
GRANT EXECUTE ON FUNCTION
 ftyp.search_pubs(text), ftyp.search_gene_identifiers(text,text),
 ftyp.validate_ids(text[]), ftyp.get_text_mining_flags(text),
 public.pub_curation_status(public.pub), public.status_from_curatedby(text),
 flybase.get_pubprop(text,text), flybase.data_class(text),
 flybase.update_ids(text[]), flybase.update_ids(text),
 flybase.current_symbol(text), flybase.current_synonym(text,text)
 TO ftyp_public;
-- Existing functions remain SECURITY INVOKER: no elevated catalog reader.
-- Public and flybase schemas must have trusted owners and no writable grants.
-- Their legacy unqualified table references resolve with pg_temp explicitly last.
ALTER ROLE ftyp_public SET search_path = pg_catalog, public, flybase, pg_temp;
COMMIT;
