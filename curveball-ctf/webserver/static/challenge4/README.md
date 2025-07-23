# Challenge 4: Kurvenparameter-Manipulation & Signaturvalidierung

## Übersicht

Diese Challenge demonstriert den mathematischen Kern des CVE-2020-0601 "Curveball" Angriffs. Sie lernen, wie Angreifer durch Manipulation von ECC-Parametern Signaturen fälschen können, ohne den ursprünglichen privaten Schlüssel zu kennen.

## Lernziele

- **Verstehen der ECC-Mathematik**: Wie elliptische Kurven-Parameter die Sicherheit beeinflussen
- **Curveball-Mechanismus**: Praktische Demonstration der CVE-2020-0601 Schwachstelle
- **Parameter-Manipulation**: Hands-on Erfahrung mit Generator-Punkt und Kurvenparameter-Änderungen
- **Signatur-Bypass**: Wie manipulierte Parameter zu falschen Validierungen führen

## Dateien in diesem Challenge

### `valid_certificate.pem`
Ein Beispiel-ECC-Zertifikat für die Analyse. Untersuchen Sie die Kurvenparameter:
```bash
openssl x509 -in valid_certificate.pem -text -noout
```

### `signature_data.json`
Enthält Testdaten für die Signatur-Experimente:
- Ursprüngliche Signatur und Parameter
- Verschiedene Manipulations-Beispiele
- Test-Szenarien für die Validierung

### `signature_validator.py`
Python-Skript zur Demonstration der Signatur-Validierung:
```bash
python signature_validator.py
```

## Challenge-Durchführung

### 1. Analyse der ursprünglichen Parameter
- Untersuchen Sie das bereitgestellte Zertifikat
- Verstehen Sie die ECC-Parameter (p, a, b, Generator, Ordnung)
- Analysieren Sie die Test-Signatur

### 2. Parameter-Manipulation
Verwenden Sie die Web-Oberfläche oder das Python-Skript, um:
- Generator-Punkt zu manipulieren
- Kurvenparameter zu ändern
- Gruppenordnung zu modifizieren

### 3. Signatur-Tests
- Testen Sie Signaturen mit ursprünglichen Parametern
- Vergleichen Sie mit manipulierten Parametern
- Dokumentieren Sie die Unterschiede

### 4. Exploit-Demonstration
- Zeigen Sie, wie eine ungültige Signatur "gültig" erscheinen kann
- Verstehen Sie die Sicherheitsimplikationen
- Entwickeln Sie Gegenmaßnahmen

## Technische Details

### ECC-Parameter (secp256r1)
```
p = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff
a = 0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc  
b = 0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b
Generator = (0x6b17d1f2..., 0x4fe342e2...)
Order = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551
```

### Curveball-Angriffsvektoren

1. **Generator-Manipulation**: Angreifer wählt eigenen Generator-Punkt
2. **Kurvenparameter-Änderung**: Schwächung der Kurve durch Parameter-Modifikation
3. **Ordnungs-Manipulation**: Reduzierung des Schlüsselraums

### ECDSA-Validierung
Die Signatur-Validierung erfolgt nach dem Standard-ECDSA-Algorithmus:
```
1. Berechne Hash h der Nachricht
2. Validiere 1 ≤ r,s < order
3. Berechne s⁻¹ mod order
4. Berechne u₁ = h·s⁻¹ mod order, u₂ = r·s⁻¹ mod order  
5. Berechne Punkt (x,y) = u₁·G + u₂·Qa
6. Validiere x mod order = r
```

## Sicherheitsimplikationen

### Reale Auswirkungen
- **Windows CryptoAPI**: Vor Patch anfällig für Generator-Manipulation
- **Zertifikats-Spoofing**: Gefälschte vertrauenswürdige Zertifikate
- **Man-in-the-Middle**: Umgehung der TLS-Sicherheit

### Schutzmaßnahmen
- Validierung von Kurvenparametern gegen Standards
- Verwendung von CA-Root-Parametern statt Leaf-Zertifikat-Parametern
- Zusätzliche Curve-Validation-Checks
- Regelmäßige Sicherheitsupdates

## Weiterführende Ressourcen

- [CVE-2020-0601 Details](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-0601)
- [Microsoft Security Advisory](https://portal.msrc.microsoft.com/en-US/security-guidance/advisory/CVE-2020-0601)
- [ECDSA Standard (FIPS 186-4)](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-4.pdf)
- [SEC 2: Recommended Elliptic Curve Domain Parameters](https://www.secg.org/sec2-v2.pdf)

---

**⚠️ Wichtiger Hinweis**: Diese Challenge dient ausschließlich Bildungszwecken. Die demonstrierten Techniken dürfen nur in legalen, kontrollierten Umgebungen verwendet werden.
