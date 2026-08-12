FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ENV REACT_APP_API_URL=http://localhost:8080/api
RUN npm run build

FROM nginx:1.30.4
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
