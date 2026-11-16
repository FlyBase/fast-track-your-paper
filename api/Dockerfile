# Install the locked application dependencies; npm is not copied into runtime.
FROM node:24-trixie-slim@sha256:173f125896c3b47ddf056734c7ea789d04595a6a08769a8f78e0df642781fb66 AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund

# Keep the accepted, vendor-maintained Node 24.22.1 runtime pinned.
FROM dhi.io/node@sha256:ed3fabe4078bb9d72244e1befc441ed5e827e92cb64932a014337786d635d3f8
WORKDIR /app
COPY --from=dependencies /app/ /app/
COPY server.cjs submission-validation.cjs ./
USER 1000:1000
EXPOSE 5000
ENTRYPOINT ["node", "/app/server.cjs"]
CMD []
