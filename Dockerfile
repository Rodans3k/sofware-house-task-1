FROM node:18.17.1-alpine3.18

WORKDIR /usr/src/app

COPY app/ ./

COPY task/db.json ./database.json

RUN npm install && npm run build

CMD [ "npm", "start" ]
