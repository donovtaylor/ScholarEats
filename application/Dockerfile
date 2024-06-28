FROM node:14

# Working directory
WORKDIR /home/node/app
COPY package*.json ./

# Dependencies
RUN npm install

# Copy into working directory
COPY . .

# Port
EXPOSE 3000

CMD [ "node", "app.js" ]
