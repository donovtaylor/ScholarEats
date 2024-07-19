FROM node:14

# Working directory
WORKDIR /home/node/app
COPY package*.json ./

# Install app dependencies
RUN npm install
RUN npm install -g pm2
RUN npm install bcryptjs
RUN npm install mysql

# Copy into working directory
COPY . .

EXPOSE 3000

CMD [ "node", "app.js" ]
