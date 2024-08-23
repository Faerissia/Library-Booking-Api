FROM node:18-bullseye

WORKDIR /app

COPY . .

RUN npm install

RUN npm run pulldb
RUN npm run prisma-generate

EXPOSE 8081

CMD ["npm", "start"]