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

# environment variables
ENV DB_HOST=csc648database.cfgu0ky6ydzi.us-east-2.rds.amazonaws.com
ENV DB_USER=backend_lead
ENV DB_PASS=password
ENV DB_NAME=ScholarEats

CMD [ "node", "app.js" ]
