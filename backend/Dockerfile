FROM node:latest

# WORKDIR /testing

COPY package*.json ./

RUN npm install
RUN npm install speakeasy qrcode @nestjs/jwt @nestjs/passport passport passport-jwt passport-local

COPY . .

EXPOSE 3000

RUN npm run build
