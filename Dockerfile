# build stage
FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_MODE=staging
ARG VITE_STAGING_API_URL
ARG VITE_PRODUCTION_API_URL

ENV VITE_MODE=$VITE_MODE
ENV VITE_STAGING_API_URL=$VITE_STAGING_API_URL
ENV VITE_PRODUCTION_API_URL=$VITE_PRODUCTION_API_URL

# RUN echo "MODE=$VITE_MODE" \
#  && echo "STAGING=$VITE_STAGING_API_URL" \
#  && echo "PROD=$VITE_PRODUCTION_API_URL"

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --mode $VITE_MODE
# production stage
FROM nginx:alpine

# ❗ Xoá config mặc định (tránh conflict)
RUN rm /etc/nginx/conf.d/default.conf

# ✅ Copy config SPA của bạn
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# ✅ Copy build React
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80