FROM nginx@sha256:dc5069ad14f19660b141b21236140b91656bf89bbc3e2417c70ae650cd66104c
COPY nginx.template start.sh /opt/
RUN chmod 755 /opt/start.sh
USER 101:101
EXPOSE 8080
ENTRYPOINT ["/opt/start.sh"]
