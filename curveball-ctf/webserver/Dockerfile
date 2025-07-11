FROM python:3.12-alpine

RUN apk add --no-cache openssl

WORKDIR /app
COPY . /app

RUN pip install flask

EXPOSE 443

CMD ["python", "server.py"]
