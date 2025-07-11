FROM python:3.12-alpine

RUN apk add --no-cache openssl

WORKDIR /app
COPY . /app

RUN pip install requests cryptography

CMD ["python", "challenger.py"]
