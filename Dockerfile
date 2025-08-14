FROM node:20.19.4-slim

WORKDIR /app
COPY . .

ENTRYPOINT ["node", "/app/dist/main.js"]
