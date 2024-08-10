FROM sitespeedio/node:ubuntu-22.04-nodejs-18.16.0

# Set the working directory inside the container
WORKDIR /TL16

COPY . ./

RUN apt update && apt install nginx -y \
    && apt install python-is-python3 -y && apt install python3-pip -y

RUN pip install -r ./requirements.txt

RUN cd app && npm install && npm run build

RUN apt install lsb-release -y && apt install curl -y && ./install_odbc.sh

WORKDIR /TL16/app/

CMD ["npm", "run", "start"]

EXPOSE 8080

