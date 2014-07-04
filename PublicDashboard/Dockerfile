# DOCKER-VERSION 0.3.4
FROM	ubuntu

# Enable EPEL for Node.js
RUN		apt-get update && apt-get -y upgrade && apt-get -y install nodejs npm git

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
ADD ./src/package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

# From here we load our application's code in, therefore the previous docker
# "layer" thats been cached will be used if possible
WORKDIR /opt/app
ADD . /opt/app

EXPOSE  8080
CMD ["nodejs", "/opt/app/src/index.js"]
