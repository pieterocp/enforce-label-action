FROM node:24.16.0-slim

WORKDIR /app
COPY . .

ENTRYPOINT ["node", "/app/dist/main.js"]
