FROM python:3.13-slim


RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        openssl \
        git \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
COPY gen-key.py .
COPY ca.cnf .
COPY openssl.cnf .
COPY simulate_vuln_check.py .
COPY USERTrustECCCertificationAuthority.crt .

RUN pip install --no-cache-dir -r requirements.txt

RUN python gen-key.py USERTrustECCCertificationAuthority.crt

RUN openssl req -key p384-key-rogue.pem -new -out ca-rogue.pem -x509 -config ca.cnf -days 500 -subj "/C=US/ST=Test/L=Test/O=Test/OU=Test/CN=Evil CA"

RUN openssl ecparam -name prime256v1 -genkey -noout -out server-key.pem

RUN openssl req -key server-key.pem -config openssl.cnf -new -out server.csr -subj "/C=US/ST=Test/L=Test/O=Test/OU=Test/CN=example.com"

RUN openssl x509 -req -in server.csr -CA ca-rogue.pem -CAkey p384-key-rogue.pem -CAcreateserial -out server-cert.pem -days 500 -extensions v3_req -extfile openssl.cnf

RUN cat server-cert.pem ca-rogue.pem > cert-chain.pem

RUN python simulate_vuln_check.py


EXPOSE 443


CMD ["python3", "simulate_vuln_check.py"]
