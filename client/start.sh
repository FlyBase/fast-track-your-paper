#!/bin/sh
set -eu
: "${FTYP_LISTEN:=5000}"
export FTYP_LISTEN
envsubst '${FTYP_LISTEN}' < /opt/nginx.template > /tmp/nginx.conf
exec nginx -c /tmp/nginx.conf -g 'daemon off;'
