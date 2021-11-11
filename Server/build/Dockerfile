FROM node:12.16.2

ENV NODE_ENV=development

WORKDIR /app

EXPOSE 5432

COPY package.json package-lock.json* ./

RUN npm install && npm cache clean --force

COPY . .

CMD ["npm", "run", "start"]
