FROM node:latest

WORKDIR /frontend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

RUN npm run build

#RUN chmod +x ./entrypoint.sh

#ENTRYPOINT [ "/usr/local/bin/npm", "run", "dev" ]

#FROM nginx

# COPY --from=build /app/build /usr/share/nginx/html

#CMD [ "nginx", "-g", "daemon off;"]