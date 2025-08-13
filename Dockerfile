FROM node:20.19.4-slim

COPY . .

ENTRYPOINT ["node", "/lib/main.js"]
