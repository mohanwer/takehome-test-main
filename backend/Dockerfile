FROM node:22.14.0

RUN mkdir -p /app
WORKDIR /app

ADD package.json package-lock.json ./
RUN npm install

ADD . .

CMD ["npm", "start"]
