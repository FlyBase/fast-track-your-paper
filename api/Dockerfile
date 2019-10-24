FROM node:12-alpine

RUN mkdir -p /home/node/app
COPY . /home/node/app
WORKDIR /home/node/app
RUN yarn install
EXPOSE 5000
