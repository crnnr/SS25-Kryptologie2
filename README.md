# Curveball Crypto-Challenge (CVE-2020-0601)

This challenge simulates the infamous CVE-2020-0601 "Curveball" vulnerability.

## Goal
Craft or detect a fake ECC certificate accepted by vulnerable verification logic.

## Instructions
1. Build the container:
   `docker build -t curveball .`

2. Run it:
   `docker run --rm curveball`

3. Try to break it by using your own certificate or understand the logic behind the flaw.

Good luck!
