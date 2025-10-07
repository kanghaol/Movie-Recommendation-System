
FROM python:3.8

ENV HOME /root
WORKDIR /root

COPY . .

# Allow selecting a requirements file at build time (useful to skip heavy packages like torch)
ARG REQUIREMENTS_FILE=requirements.txt
RUN pip3 install -r ${REQUIREMENTS_FILE}

EXPOSE 8080

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait



CMD /wait && python3 config.py && python3 initdb.py && python3 -u server.py