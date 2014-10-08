FROM	dockerhubtrial/base
RUN mkdir -p /opt/app && cd /opt/app && git init && git pull https://github.com/arun-sfdc/Analytics-API.git
WORKDIR /opt/app/PublicDashboard
RUN cd src/ && npm install
EXPOSE	9000 
CMD ["nodejs", "./src/index.js"]
