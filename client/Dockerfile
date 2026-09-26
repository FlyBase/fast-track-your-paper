FROM node@sha256:83f487e0a63425e5b4d146fb5e5be574bcbe1b7b843d3ebafdd95eaf7767a7e5 AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-scripts --non-interactive --registry https://registry.npmjs.org
COPY . .
ARG PUBLIC_URL=/submission/publication
ENV PUBLIC_URL=$PUBLIC_URL
ARG FTYP_RELEASE
RUN test -n "$FTYP_RELEASE" || (echo "Set --build-arg FTYP_RELEASE=FBYYYY_NN after refreshing the header/footer" >&2; exit 1)
RUN FTYP_RELEASE="$FTYP_RELEASE" yarn run build

FROM nginx@sha256:dc5069ad14f19660b141b21236140b91656bf89bbc3e2417c70ae650cd66104c
COPY --from=build /app/build/ /usr/share/nginx/html/submission/publication/
COPY nginx.template start.sh /opt/
RUN chmod 755 /opt/start.sh
USER 101:101
ENV FTYP_LISTEN=5000
EXPOSE 5000
ENTRYPOINT ["/opt/start.sh"]
