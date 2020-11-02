FROM node:10-slim as prod
ENV NODE_ENV=production
EXPOSE 5000
WORKDIR /app
COPY package*.json ./
RUN apt-get update || : && apt-get install make g++ python -y
RUN npm install --only=production
RUN npm cache verify
COPY . .
COPY /server/api/models/SQL ./dist/api/models/SQL
CMD [ "node", "dist/index.js" ]

FROM prod as dev
ENV NODE_ENV=development
RUN npm install --only=development
CMD [ "npm", "run", "dev:secure" ]



