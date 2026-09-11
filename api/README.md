# FTYP API boundary

Build the API with the checked-in Dockerfile/package-lock.json. The Compose api service builds ./api; api-admin uses that same image. Both start server.cjs, which registers submission-validation.cjs. Old PostGraphile CLI arguments are rejected rather than silently bypassing validation.

Before exposing either endpoint, apply reviewed db/scripts/submission_boundary.sql and public_catalog_acl.sql to the chosen FTYP database. Provision separate nonsuperuser LOGIN roles ftyp_public_login and ftyp_admin_login, granting membership only in ftyp_public and ftyp_admin_api respectively. Set passwords through the deployment's protected credential mechanism, not SQL/source literals. API logins must not own the database/tables, have administrative attributes, or belong to the writer/other API role. Startup verifies these properties. These one-time migration scripts deliberately fail on preexisting roles rather than adopting unknown privileges.

Required Compose inputs: FTYP_PGDATABASE, FTYP_PUBLIC_PASSWORD, FTYP_ADMIN_PASSWORD, and FTYP_PGPASSWORD (database owner only). Public/admin services never use the owner password. Public API exposes ftyp/public; admin API exposes ftyp_admin/ftyp_hidden, protected on the actual /admin/graphql proxy endpoint. React routes its two existing admin documents there. The new API keeps native operation names and timestamp-only submitPaper result. Debug stack, explain, GraphiQL and batching are disabled.

The resolver uses pinned native Yup0.32.9 author/flag semantics. Confirmation-only email_verify is not transmitted; isAuthor is normalized boolean. Do not add different email rules or gene-count caps independently of the native contract. SQL envelope and restricted writer privileges remain in place.

FTYP_LISTEN_SOCKET is optional for a local Unix-socket proxy/isolated testing. Otherwise PORT defaults5000. Database PGHOST/PGDATABASE/PGPASSWORD must be set; PGUSER cannot select a different role. The pool explicitly establishes its trusted search_path with pg_temp last.

This source was validated using synthetic records over a schema-only copy of the clean recovered Chado schema. It does not establish the separate historical FTYP server's deployed version/data state. Review migration provenance and operational credentials before deployment; no source defaults authorize production access.
