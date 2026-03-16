FROM node:20.13.1
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install
COPY . .
EXPOSE 3000
CMD ["sh", "-c", "sleep 15 && npx prisma db push --accept-data-loss && npm run dev"]