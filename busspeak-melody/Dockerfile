FROM node:latest

LABEL org.opencontainers.image.source https://github.com/dylankjy/BusSpeak

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 5000

CMD [ "npm", "start" ]