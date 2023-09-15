FROM nginx:1.25-bookworm as dist
COPY /build/local-nginx/local-nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80