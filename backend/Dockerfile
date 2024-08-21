FROM node:latest

# WORKDIR /testing

COPY package*.json ./

RUN npm install
RUN npm install speakeasy qrcode

COPY . .

EXPOSE 3000

RUN npm run build
