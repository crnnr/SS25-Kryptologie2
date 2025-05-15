from ecdsa import SigningKey, NIST384p, VerifyingKey, BadSignatureError
import hashlib

print("\n[+] Simulating CVE-2020-0601 vulnerable verification...\n")

with open("p384-key-rogue.pem", "rb") as f:
    pem = f.read()
    rogue_key = SigningKey.from_pem(pem)

rogue_pub = rogue_key.verifying_key

message = b"Simulated CVE-2020-0601 message"
digest = hashlib.sha256(message).digest()
signature = rogue_key.sign_digest(digest)

try:
    if rogue_pub.verify_digest(signature, digest):
        print("[VULNERABLE VERIFY] ✅ Signature accepted (simulated CVE-2020-0601 exploit)")
    else:
        print("[VULNERABLE VERIFY] ❌ Signature rejected")
except BadSignatureError:
    print("[VULNERABLE VERIFY] ❌ Signature rejected (BadSignatureError)")
