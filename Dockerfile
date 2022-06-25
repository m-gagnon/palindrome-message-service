FROM node:16.15.1-alpine

WORKDIR /usr/src/app

COPY package* .
RUN npm ci --omit=dev
RUN npm install -g pm2@5.2.0

COPY ./dist .
ENV REST_API_PORT=8080

EXPOSE 8080
CMD ["pm2-runtime", "start", "MessageServiceApp.js"]