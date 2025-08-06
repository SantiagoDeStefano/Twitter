FROM node:20.18.3-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY .env.development .
COPY ./src ./src
COPY twitter-swagger.yaml .

RUN apk update && apk add bash
RUN apk add --no-cache ffmpeg
RUN apk add python3
RUN npm install pm2 -g
RUN npm install
RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start"]