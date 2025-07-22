FROM python:3.12-alpine

# Pin Alpine package versions for reproducible builds
RUN apk add --no-cache openssl~=3.1

WORKDIR /app
COPY requirements.txt /app/
RUN pip install --no-cache-dir --requirement requirements.txt

COPY . /app

EXPOSE 8443

CMD ["python", "server.py"]
