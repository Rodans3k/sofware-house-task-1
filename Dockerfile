FROM node:18.17.1-alpine3.18

WORKDIR /usr/src/app

COPY app/ ./

RUN npm i

CMD [ "npm", "start" ]
