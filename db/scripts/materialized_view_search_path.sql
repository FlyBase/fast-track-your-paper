-- Helpers use unqualified catalog table names; PG17+ refresh restricts search_path.
ALTER FUNCTION flybase.current_synonym(text,text) SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION flybase.pub_count(text) SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION flybase.get_pubprop(text,text) SET search_path = pg_catalog, public, pg_temp;
