FROM nginx:stable-alpine@sha256:0985e772fb9f729e6fa0980da05fca5d9c468e870eed43071545afa9d2e27d94
COPY nginx.template start.sh /opt/
RUN apk upgrade --no-cache && chmod 755 /opt/start.sh
USER 101:101
EXPOSE 8080
ENTRYPOINT ["/opt/start.sh"]
