-- UNEXECUTED integration candidate. Requires complete trusted Chado DDL,
-- pinned helper signatures and the native FTYP schema to exist first.
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
 public.stock, public.stock_genotype, public.genotype,
 public.grp, public.grp_synonym, public.strain, public.strain_synonym,
 public.cell_line, public.cell_line_synonym, public.humanhealth,
 public.humanhealth_synonym, public.library, public.library_synonym,
 ftyp_hidden.pub_search, ftyp_hidden.gene_search,
 ftyp_hidden.text_mining_flag TO ftyp_public;
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
