FROM nginx:1.25-bookworm as dist
COPY /build/file-storage/file-storage-nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80