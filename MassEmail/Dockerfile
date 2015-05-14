FROM	dockerhubtrial/base5
RUN mkdir -p /opt/app && cd /opt/app && git init && git pull https://github.com/arun-sfdc/Analytics-API.git
WORKDIR /opt/app/MassEmail
RUN cd src/ && npm install
EXPOSE	443 
CMD service nginx start && nodejs ./src/index.js
