# Use an official Node runtime as a parent image
FROM node:20

WORKDIR /code

COPY package*.json .

RUN npm ci

COPY ./ /code/

EXPOSE 3000

CMD [ "npm", "run", "dev" ]