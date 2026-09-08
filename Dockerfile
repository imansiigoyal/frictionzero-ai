FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 8085

ENV PORT=8085
ENV NODE_ENV=production

CMD ["npm", "start"]
