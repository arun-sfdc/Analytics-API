FROM	dockerhubtrial/base
RUN sudo apt-get update && sudo apt-get -y upgrade && sudo apt-get -y install nginx
RUN mkdir -p /opt/app && cd /opt/app && git init && git pull https://github.com/arun-sfdc/Analytics-API.git
RUN sudo nginx -c /opt/app/MassEmail/nginx.conf && service nginx start
WORKDIR /opt/app/MassEmail
RUN cd src/ && npm install
EXPOSE	443 
CMD ["nodejs", "./src/index.js"]
