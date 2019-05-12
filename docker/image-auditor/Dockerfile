FROM node:8
MAINTAINER Guillaume Valvona

COPY src /opt/app/

WORKDIR /opt/app/
RUN npm install

ENTRYPOINT ["node", "/opt/app/Auditor.js"]
