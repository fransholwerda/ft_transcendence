FROM node:latest

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html

CMD [ "nginx", "-g", "daemon off;"]