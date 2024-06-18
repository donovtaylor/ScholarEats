FROM node:14

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "app.js" ]
