FROM node:20-alpine
WORKDIR /app
COPY package*.json tsconfig.json tailwind.config.js postcss.config.js ./
RUN npm install
COPY src ./src
COPY public ./public
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
