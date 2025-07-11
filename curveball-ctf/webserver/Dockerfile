FROM python:3.12-alpine

RUN apk add --no-cache openssl

WORKDIR /app
COPY . /app

RUN pip install flask cryptography

EXPOSE 8443

CMD ["python", "server.py"]
