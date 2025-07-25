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

### 2. Navigate to the CTF directory
```bash
cd SS25-Kryptologie2/curveball-ctf
```

### 3. Start the web application with Docker Compose

```bash
docker-compose up --build
```

### 4. Access the web interface

Once the container is running, open your web browser and navigate to:

🌐 **https://localhost:8443**

⚠️ **Note**: Since the application uses a self-signed certificate, your browser will show a security warning. This is expected - click "Advanced" and "Proceed to localhost" (or similar) to continue.

### 5. Complete the challenges

The web interface provides an interactive way to learn about the CurveBall vulnerability through hands-on challenges:

- **Challenge 1**: Understanding ECC certificate validation
- **Challenge 2**: Certificate signing request analysis  
- **Challenge 3**: Exploiting curve parameter manipulation
- **Challenge 4**: Advanced cryptographic attacks
- **Challenge 5**: Full exploitation demonstration

### Alternative: Command Line Simulation

For a quick command-line demonstration without the web interface:

```bash
docker build -t curveball-challenge .
docker run curveball-challenge
```

You should see output like:
```bash
[+] Simulating CVE-2020-0601 vulnerable verification...

[VULNERABLE VERIFY] ✅ Signature accepted (simulated CVE-2020-0601 exploit)
```

---

## 📁 Project Structure

```
SS25-Kryptologie2/
├── curveball-ctf/              # Interactive web-based CTF challenges
│   ├── docker-compose.yml     # Docker orchestration
│   └── webserver/             # Flask web application
│       ├── server.py          # Main web server
│       ├── static/            # CSS, JavaScript, downloads
│       ├── templates/         # HTML templates
│       └── certs/             # SSL certificates
├── Docs/                      # Project documentation
│   ├── Challenge_instructions/ # Challenge guides
│   ├── Challenge_solutions/   # Solution documentation
│   └── Projectdocs/          # Technical documentation
└── README.md                  # This file
```

## 🎯 Learning Objectives

This project helps you understand:
- **ECC Certificate Validation**: How elliptic curve certificates are verified
- **CVE-2020-0601**: The specific Windows CryptoAPI vulnerability
- **Cryptographic Attacks**: Practical exploitation techniques
- **Certificate Chain Analysis**: Understanding trust relationships
- **Defensive Measures**: How to prevent similar vulnerabilities

## 🔒 Security Note

This project is for **educational purposes only**. The vulnerability simulation is contained within Docker and does not affect your host system. Use this knowledge responsibly and only in authorized testing environments.
