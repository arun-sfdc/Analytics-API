# DOCKER-VERSION 0.3.4
FROM	ubuntu

# Enable EPEL for Node.js
RUN		apt-get update && apt-get -y upgrade && apt-get -y install nodejs npm git

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
RUN mkdir -p /opt/app
WORKDIR /opt/app
RUN git init
RUN git pull https://github.com/arun-sfdc/Analytics-API.git
RUN cd PublicDashboard/src
RUN npm install

EXPOSE	9000 
CMD ["nodejs", "/opt/app/src/index.js"]
