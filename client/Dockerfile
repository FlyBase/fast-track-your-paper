FROM node:24-trixie-slim@sha256:173f125896c3b47ddf056734c7ea789d04595a6a08769a8f78e0df642781fb66 AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-scripts --non-interactive --registry https://registry.npmjs.org
COPY . .
ARG PUBLIC_URL=/submission/publication
ENV PUBLIC_URL=$PUBLIC_URL
ARG FTYP_RELEASE
RUN test -n "$FTYP_RELEASE" || (echo "Set --build-arg FTYP_RELEASE=FBYYYY_NN after refreshing the header/footer" >&2; exit 1)
RUN FTYP_RELEASE="$FTYP_RELEASE" yarn run build

FROM nginx:stable-alpine@sha256:0985e772fb9f729e6fa0980da05fca5d9c468e870eed43071545afa9d2e27d94
COPY --from=build /app/build/ /usr/share/nginx/html/submission/publication/
COPY nginx.template start.sh /opt/
RUN apk upgrade --no-cache && chmod 755 /opt/start.sh
USER 101:101
ENV FTYP_LISTEN=5000
EXPOSE 5000
ENTRYPOINT ["/opt/start.sh"]
