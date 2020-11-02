FROM nginx:stable
WORKDIR /etc/nginx/
COPY ./default.conf ./conf.d/
COPY ./timeout.conf ./conf.d/
COPY ./tsodev* ./keys.d/
# WORKDIR /usr/share/nginx/
# COPY ./data/ /html/
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
