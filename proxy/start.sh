#!/bin/sh
set -eu
: "${FTYP_LISTEN:=8080}" "${FTYP_CLIENT_UPSTREAM:=client:5000}" "${FTYP_PUBLIC_UPSTREAM:=api:5000}" "${FTYP_ADMIN_UPSTREAM:=api-admin:5000}"
export FTYP_LISTEN FTYP_CLIENT_UPSTREAM FTYP_PUBLIC_UPSTREAM FTYP_ADMIN_UPSTREAM
envsubst '${FTYP_LISTEN} ${FTYP_CLIENT_UPSTREAM} ${FTYP_PUBLIC_UPSTREAM} ${FTYP_ADMIN_UPSTREAM}' < /opt/nginx.template > /tmp/nginx.conf
exec nginx -c /tmp/nginx.conf -g 'daemon off;'
