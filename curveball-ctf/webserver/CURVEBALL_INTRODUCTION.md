# 🎯 Curveball (CVE-2020-0601) - Umfassende Einführung

## 📚 Was ist Curveball?

**Curveball** ist der Codename für eine der kritischsten Sicherheitslücken in der Windows-Geschichte: **CVE-2020-0601**. Diese Schwachstelle in der Windows CryptoAPI ermöglichte es Angreifern, die Validierung von ECC-Zertifikaten vollständig zu umgehen.

### 🏛️ Historischer Kontext
- **Entdeckt**: Januar 2020 von der NSA
- **Betroffene Systeme**: Windows 10, Windows Server 2016/2019
- **CVSS Score**: 10.0 (Kritisch)
- **Anzahl betroffener Systeme**: ~900 Millionen weltweit

---

## 🔐 Grundlagen der Elliptic Curve Cryptography (ECC)

### Was sind elliptische Kurven?
Elliptische Kurven sind mathematische Strukturen der Form:
```
y² = x³ + ax + b (mod p)
```

**Warum ECC verwenden?**
- **Effizienz**: Kleinere Schlüssel bei gleicher Sicherheit
- **Performance**: Schnellere Berechnungen als RSA
- **Mobilfreundlich**: Weniger Energie- und Speicherverbrauch

### 🎯 ECC-Schlüsselkomponenten

#### 1. **Die Kurve selbst**
```python
# Beispiel: secp256r1 (P-256)
p = 2^256 - 2^224 + 2^192 + 2^96 - 1  # Primzahl
a = -3
b = 0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b
```

#### 2. **Der Generator-Punkt G**
Ein fest definierter Punkt auf der Kurve:
```python
G = (Gx, Gy)  # Koordinaten des Generator-Punkts
```

#### 3. **Die Ordnung n**
Die Anzahl der Punkte, die durch Multiplikation mit G erzeugt werden können.

#### 4. **Private/Public Key Pair**
```python
private_key = d  # Zufällige Zahl < n
public_key = d * G  # Punkt auf der Kurve
```

---

## ⚠️ Die Curveball-Schwachstelle im Detail

### 🔍 Das Problem: Fehlende Generator-Validierung

Windows validierte **NICHT**, ob der Generator-Punkt G in ECC-Zertifikaten dem Standard entspricht!

#### Normale ECC-Validierung sollte prüfen:
1. ✅ Ist die Kurve korrekt definiert?
2. ✅ Liegt der Public Key auf der Kurve?
3. ❌ **Ist der Generator-Punkt der Standard-Generator?** ← HIER WAR DER BUG!

### 🎭 Der Angriff

#### Schritt 1: Eigenen Generator wählen
```python
# Angreifer wählt eigenen Generator G'
G_rogue = custom_point_on_curve()
```

#### Schritt 2: Private Key berechnen
```python
# Für bekannten Public Key Q der echten CA:
# Q = d * G (mit unbekanntem d)
# Aber: Q = d' * G' (mit wählbarem d' und G')
private_key_rogue = calculate_inverse(Q, G_rogue)
```

#### Schritt 3: Bösartiges Zertifikat erstellen
```python
# Jetzt kann der Angreifer Zertifikate signieren,
# die Windows als "von der echten CA signiert" akzeptiert!
malicious_cert = sign_certificate(data, private_key_rogue, G_rogue)
```

---

## 🧮 Mathematische Grundlagen

### Elliptische Kurven-Arithmetik

#### Punktaddition
Für Punkte P und Q auf der Kurve:
```
P + Q = R (auch ein Punkt auf der Kurve)
```

#### Skalarmultiplikation
```
d * P = P + P + ... + P (d-mal)
```

### 🎯 Das Discrete Logarithm Problem (DLP)
**Gegeben**: P, Q (Punkte auf der Kurve)
**Gesucht**: d, sodass Q = d * P

**Warum ist das schwer?**
- Für kryptographisch sichere Kurven praktisch unlösbar
- Basis der ECC-Sicherheit

### ⚡ Der Curveball-Trick: DLP umgehen

**Normal**: Q = d * G (d unbekannt, schwer zu finden)
**Curveball**: Q = d' * G' (d' und G' wählbar!)

```python
# Angreifer-Logik:
Q = public_key_of_real_CA
G_rogue = choose_convenient_generator()
d_rogue = Q / G_rogue  # Modular inverse
# Jetzt: Q = d_rogue * G_rogue
```

---

## 🛠️ Technische Implementierung

### Zertifikat-Struktur (X.509)
```asn1
Certificate ::= SEQUENCE {
    tbsCertificate       TBSCertificate,
    signatureAlgorithm   AlgorithmIdentifier,
    signatureValue       BIT STRING
}

SubjectPublicKeyInfo ::= SEQUENCE {
    algorithm         AlgorithmIdentifier,
    subjectPublicKey  BIT STRING,
    parameters        ECParameters OPTIONAL  -- HIER DER BUG!
}
```

### ECParameters (der kritische Teil)
```asn1
ECParameters ::= CHOICE {
    namedCurve      OBJECT IDENTIFIER,
    explicitCurve   ECCurve,           -- Angreifer nutzt das!
    implicitCurve   NULL
}

ECCurve ::= SEQUENCE {
    version       INTEGER,
    fieldID       FieldID,
    curve         Curve,
    base          OCTET STRING,        -- Generator G (manipulierbar!)
    order         INTEGER,
    cofactor      INTEGER OPTIONAL
}
```

---

## 🎮 Praktische Exploitation

### Schritt-für-Schritt Angriff

#### 1. **CA-Zertifikat analysieren**
```bash
openssl x509 -in ca_cert.pem -text -noout
# Extrahiere Public Key Q der echten CA
```

#### 2. **Rogue Generator berechnen**
```python
# gen-key.py Implementation
Q = extract_public_key_from_ca()
chosen_private_key = 2  # Einfacher Wert
G_rogue = Q / chosen_private_key  # Modular inverse
```

#### 3. **Bösartiges Zertifikat erstellen**
```bash
# Erstelle Key mit expliziten (manipulierten) Parametern
openssl req -key rogue_key.pem -new -x509 -out malicious_cert.pem
```

#### 4. **Signatur erstellen**
```python
# Alles was mit dem rogue private key signiert wird,
# erscheint als von der echten CA signiert!
signature = sign_with_rogue_key(document)
```

---

## 🛡️ Erkennung und Schutz

### Wie erkennt man Curveball-Angriffe?

#### 1. **Zertifikat-Analyse**
```python
def check_for_curveball(cert):
    # Prüfe auf explicit curve parameters
    if cert.public_key().curve_name != "standard":
        return "SUSPICIOUS: Non-standard curve parameters"
    
    # Prüfe Generator-Punkt
    if cert.generator != STANDARD_GENERATORS[cert.curve]:
        return "ATTACK: Rogue generator detected!"
```

#### 2. **Netzwerk-Monitoring**
```bash
# Suche nach TLS-Verbindungen mit ungewöhnlichen Kurven
tshark -f "ssl" -T fields -e ssl.handshake.extensions_elliptic_curves
```

### 🔒 Schutzmaßnahmen

#### Für Entwickler:
1. **Immer named curves verwenden**
```python
# GUT
curve = ec.SECP256R1()

# SCHLECHT - ermöglicht explizite Parameter
curve = parse_custom_curve_from_cert()
```

2. **Generator-Punkt validieren**
```python
def validate_generator(curve, generator):
    if generator != STANDARD_GENERATORS[curve.name]:
        raise SecurityError("Invalid generator point!")
```

#### Für Administratoren:
1. **Certificate Pinning**
2. **Certificate Transparency Monitoring**
3. **Regelmäßige Zertifikat-Audits**

---

## 📊 Auswirkungen in der Praxis

### Mögliche Angriffe

#### 1. **Code-Signing Bypass**
```python
# Angreifer kann beliebige Software als "Microsoft signiert" ausgeben
malware.exe + rogue_signature = "trusted" software
```

#### 2. **TLS Man-in-the-Middle**
```
Client <-- HTTPS --> [Angreifer mit rogue cert] <-- HTTP --> Server
```

#### 3. **Enterprise PKI Compromise**
- Umgehung interner CA-Validierung
- Lateral Movement in Netzwerken
- Document Signing Attacks

### 🌍 Reale Bedrohungsszenarien

#### Nation-State Attacks
- APT-Gruppen nutzen Curveball für persistente Zugriffe
- Supply Chain Attacks durch kompromittierte Software-Signaturen

#### Cybercrime
- Banking-Trojaner mit "vertrauenswürdigen" Zertifikaten
- Ransomware-Deployment über kompromittierte Update-Mechanismen

---

## 🔬 Tiefere mathematische Analyse

### Warum funktioniert der Angriff?

#### Das mathematische Problem:
```
Gegeben: Q (Public Key der echten CA)
Normal:  Q = d * G (d unbekannt, G fest)
Angriff: Q = d' * G' (d' wählbar, G' wählbar)
```

#### Die Lösung:
```python
# Wähle d' = 2 (einfach)
# Berechne G' = Q / 2 = Q * inverse(2)
G_rogue = scalar_multiply(Q, mod_inverse(2, curve.order))
```

### Elliptische Kurven-Invarianten

#### Was bleibt gleich?
- Die Kurvengleichung y² = x³ + ax + b
- Die Public Keys liegen auf derselben Kurve

#### Was ändert sich?
- Der Generator-Punkt G
- Die private Schlüssel d

---

## 🎓 Lernziele für Studenten

Nach dieser Challenge sollten Sie verstehen:

### 🔑 Kryptographische Konzepte
- ✅ Elliptische Kurven-Arithmetik
- ✅ Public/Private Key Cryptography
- ✅ Digital Signatures und Verifikation
- ✅ Das Discrete Logarithm Problem

### 🛡️ Sicherheitskonzepte
- ✅ PKI und Zertifikat-Validierung
- ✅ Implementation vs. Spezifikation
- ✅ Parameter-Validierung in Kryptosystemen
- ✅ Side-Channel und Implementation Attacks

### 🔧 Praktische Fähigkeiten
- ✅ OpenSSL für Zertifikat-Manipulation
- ✅ Python für kryptographische Berechnungen
- ✅ ASN.1 und X.509 Struktur-Analyse
- ✅ Vulnerability Assessment

---

## 📖 Weiterführende Ressourcen

### 📚 Literatur
- **"Guide to Elliptic Curve Cryptography"** - Hankerson, Menezes, Vanstone
- **"Serious Cryptography"** - Jean-Philippe Aumasson
- **RFC 5480**: Elliptic Curve Cryptography Subject Public Key Information

### 🔗 Online-Ressourcen
- [Microsoft Security Advisory](https://portal.msrc.microsoft.com/security-guidance/advisory/CVE-2020-0601)
- [NSA Cybersecurity Advisory](https://www.nsa.gov/News-Features/Feature-Stories/Article-View/Article/2065091/)
- [NIST Curve Database](https://csrc.nist.gov/projects/elliptic-curve-cryptography)

### 🛠️ Tools für weitere Experimente
- **SageMath**: Für elliptische Kurven-Mathematik
- **Wireshark**: TLS-Traffic-Analyse
- **OpenSSL**: Zertifikat-Manipulation
- **Certificate Transparency Logs**: Zertifikat-Monitoring

---

## 🏆 Challenge-Ziel

**Ihr Ziel**: Manipulieren Sie die ECC-Parameter in der interaktiven Web-Challenge so, dass Sie die CVE-2020-0601 Schwachstelle auslösen und die Flag erhalten!

**Viel Erfolg beim Experimentieren und Lernen!** 🎓✨
