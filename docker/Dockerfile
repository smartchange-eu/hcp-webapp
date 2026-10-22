############
### prod ###
############

# base image
FROM nginx:mainline-alpine

# clean the nginx static files folder and create symbolic link
RUN rm -rf /usr/share/nginx/html; ln -s /usr/share/nginx/html /app

# add site template for nginx
COPY ./docker/nginx_site.template.conf /tmp/nginx_site.template.conf

# copy artifact build from the 'build environment'
COPY ./dist/* /usr/share/nginx/html/

# add permissions for nginx user
RUN chown -R nginx:root /usr/share/nginx/html && chmod -R 710 /usr/share/nginx/html

# expose port 4200
EXPOSE 4200
ENV NGINX_PORT=${NGINX_PORT:-4200} \
    NGINX_SERVER_NAME=${NGINX_SERVER_NAME:-localhost}

# run nginx
CMD envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && \
    envsubst \${NGINX_PORT},\${NGINX_SERVER_NAME} < /tmp/nginx_site.template.conf > /etc/nginx/conf.d/default.conf && \
    exec nginx -g 'daemon off;'