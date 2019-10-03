FROM postgres:10

RUN set -x \
      && apt-get update && apt-get install -y git
# Fetch the FlyBase Chado utility functions
RUN git clone --depth 1 https://github.com/FlyBase/chado.git

EXPOSE 5432
