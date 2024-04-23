FROM node:latest

# WORKDIR /testing

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

RUN npm run build
