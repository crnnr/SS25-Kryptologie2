# 🕵️‍♂️ CurveBall Challenge (CVE-2020-0601)

This project simulates the CurveBall vulnerability (CVE-2020-0601), a flaw in the Windows CryptoAPI (`Crypt32.dll`) that improperly verified ECC certificates. It allowed attackers to craft spoofed certificates that appeared to be signed by trusted root authorities.

The challenge demonstrates this vulnerability using manipulated elliptic curve parameters and is fully encapsulated in a Docker container.

---

## 📦 Docker Image (prebuilt)

A prebuilt image is available on Docker Hub:

👉 **https://hub.docker.com/r/crnnr/curveball-cve-2020-0601**

### Run the container (using remote image)

```bash
docker run --rm crnnr/curveball-cve-2020-0601
```
This command executes the simulated verification

## 🛠️ Local Build & Execution

To experiment, modify, or develop locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/crnnr/SS25-Kryptologie2/
```
### 2. Build the Docker image

```bash
docker build -t curveball-challenge .
```

### Run the container (using remote image)

```bash
docker run curveball-challenge
```

You should see output like:
```bash
[+] Simulating CVE-2020-0601 vulnerable verification...

[VULNERABLE VERIFY] ✅ Signature accepted (simulated CVE-2020-0601 exploit)
```
