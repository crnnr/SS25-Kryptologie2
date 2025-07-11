#!/usr/bin/env python3
"""
Curveball CTF - Interaktives Lernmodul

Dieses Skript führt Studenten schrittweise durch die Curveball-Schwachstelle
und erklärt dabei alle wichtigen Konzepte mit praktischen Beispielen.
"""

import os
import sys
import hashlib
from pathlib import Path

def print_banner():
    print("═" * 80)
    print("🎓 CURVEBALL INTERACTIVE LEARNING MODULE")
    print("═" * 80)
    print("CVE-2020-0601: Step-by-step understanding")
    print("═" * 80)
    print()

def lesson_1_ecc_basics():
    print("📚 LEKTION 1: ECC GRUNDLAGEN")
    print("─" * 50)
    print("""
🔍 Was sind elliptische Kurven?

Eine elliptische Kurve ist eine mathematische Struktur der Form:
    y² = x³ + ax + b (mod p)

Beispiel: secp256r1 (auch bekannt als P-256)
    p = 2²⁵⁶ - 2²²⁴ + 2¹⁹² + 2⁹⁶ - 1
    a = -3
    b = 0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b

🎯 Warum ECC verwenden?
    ✅ Kleinere Schlüsselgrößen (256 bit ECC ≈ 3072 bit RSA)
    ✅ Schnellere Berechnungen
    ✅ Weniger Speicher- und Energieverbrauch
    """)
    
    input("\n📖 Drücken Sie Enter, um zur nächsten Lektion zu gehen...")

def lesson_2_generator_points():
    print("\n📚 LEKTION 2: GENERATOR-PUNKTE")
    print("─" * 50)
    print("""
🔑 Was ist ein Generator-Punkt?

Ein Generator-Punkt G ist ein spezieller Punkt auf der elliptischen Kurve.
Alle anderen Punkte werden durch "Multiplikation" mit G erzeugt:

    P = k × G

Dabei ist:
    - k: Ein Skalar (Zahl)
    - G: Der Generator-Punkt
    - P: Der resultierende Punkt

🎯 Beispiel für secp256r1:
    Gx = 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296
    Gy = 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5

⚠️  WICHTIG: Der Generator-Punkt ist für jede Kurve FEST DEFINIERT!
    """)
    
    input("\n📖 Drücken Sie Enter, um zur nächsten Lektion zu gehen...")

def lesson_3_key_generation():
    print("\n📚 LEKTION 3: SCHLÜSSELGENERIERUNG")
    print("─" * 50)
    print("""
🔐 Wie werden ECC-Schlüssel generiert?

1. Wähle eine zufällige Zahl d (Private Key):
    d ∈ [1, n-1] wobei n die Ordnung der Kurve ist

2. Berechne den Public Key:
    Q = d × G

🎯 Beispiel:
    Private Key: d = 0x12345678...
    Public Key:  Q = d × G = (Qx, Qy)

🔒 Sicherheit basiert auf dem Discrete Logarithm Problem:
    Gegeben: G, Q
    Finde:   d, sodass Q = d × G
    
    → Für kryptographisch sichere Kurven praktisch unlösbar!
    """)
    
    input("\n📖 Drücken Sie Enter, um zur nächsten Lektion zu gehen...")

def lesson_4_certificate_structure():
    print("\n📚 LEKTION 4: ZERTIFIKAT-STRUKTUR")
    print("─" * 50)
    print("""
📜 X.509 Zertifikat-Struktur (vereinfacht):

Certificate ::= SEQUENCE {
    tbsCertificate       TBSCertificate,
    signatureAlgorithm   AlgorithmIdentifier,
    signatureValue       BIT STRING
}

SubjectPublicKeyInfo ::= SEQUENCE {
    algorithm         AlgorithmIdentifier,
    subjectPublicKey  BIT STRING,
    parameters        ECParameters OPTIONAL  ← HIER IST DER BUG!
}

🎯 ECParameters kann enthalten:
    - namedCurve: Verweis auf Standardkurve (z.B. "secp256r1")
    - explicitCurve: Vollständige Kurvendefinition ← GEFÄHRLICH!

⚠️  Windows validierte explicitCurve-Parameter nicht korrekt!
    """)
    
    input("\n📖 Drücken Sie Enter, um zur nächsten Lektion zu gehen...")

def lesson_5_curveball_attack():
    print("\n📚 LEKTION 5: DER CURVEBALL-ANGRIFF")
    print("─" * 50)
    print("""
🎭 Wie funktioniert der Angriff?

NORMALE SITUATION:
    CA Public Key: Q = d × G (d unbekannt, G standardisiert)
    Angreifer kann d nicht berechnen → Sicher!

CURVEBALL-ANGRIFF:
    1. Angreifer wählt eigenen Generator G'
    2. Angreifer wählt eigenen Private Key d'
    3. Berechnet: G' = Q / d' (da Q = d' × G')
    4. Erstellt Zertifikat mit explicitCurve-Parametern

ERGEBNIS:
    Windows sieht: Q = d' × G'
    Windows denkt: "Q ist der echte CA Public Key"
    Windows validiert: Signature mit d' erstellt ✅
    
🎯 Der Angreifer kann jetzt beliebige Zertifikate "im Namen der CA" erstellen!
    """)
    
    input("\n📖 Drücken Sie Enter, um zur nächsten Lektion zu gehen...")

def lesson_6_practical_example():
    print("\n📚 LEKTION 6: PRAKTISCHES BEISPIEL")
    print("─" * 50)
    print("""
🛠️  Schritt-für-Schritt Angriff:

1. ECHTE CA ANALYSIEREN:
    $ openssl x509 -in real_ca.pem -text -noout
    → Extrahiere Public Key Q

2. ROGUE PARAMETERS BERECHNEN:
    Private Key d' = 2 (einfacher Wert)
    Generator G' = Q / 2 (Modular inverse)

3. ROGUE KEY GENERIEREN:
    $ python gen-key.py real_ca.pem
    → Erstellt p384-key-rogue.pem mit G'

4. BÖSARTIGES ZERTIFIKAT:
    $ openssl req -key p384-key-rogue.pem -new -x509 \\
        -out evil_cert.pem -config custom.cnf

5. WINDOWS VALIDIERUNG:
    Windows sieht Q = 2 × G' und akzeptiert evil_cert.pem ✅

🎯 Das Zertifikat sieht aus wie von der echten CA signiert!
    """)
    
    input("\n📖 Drücken Sie Enter, um zur nächsten Lektion zu gehen...")

def lesson_7_impact_and_defenses():
    print("\n📚 LEKTION 7: AUSWIRKUNGEN UND SCHUTZ")
    print("─" * 50)
    print("""
💥 MÖGLICHE ANGRIFFE:

1. CODE-SIGNING BYPASS:
    Malware.exe + Rogue Signature = "Vertrauenswürdige" Software

2. TLS MAN-IN-THE-MIDDLE:
    Client ↔ [Angreifer mit Rogue Cert] ↔ Server

3. ENTERPRISE PKI COMPROMISE:
    Interne Zertifikat-Validierung umgehen

🛡️  SCHUTZM‌ASSNAHMEN:

Für Entwickler:
    ✅ Nur namedCurve verwenden, nie explicitCurve
    ✅ Generator-Punkt immer validieren
    ✅ Certificate Pinning implementieren

Für Administratoren:
    ✅ Windows-Updates installieren
    ✅ Certificate Transparency überwachen
    ✅ Anomalie-Erkennung für Zertifikate

🔍 ERKENNUNG:
    - Zertifikate mit explicitCurve-Parametern
    - Ungewöhnliche Generator-Punkte
    - Zertifikate von unbekannten CAs
    """)
    
    input("\n📖 Drücken Sie Enter für die finale Zusammenfassung...")

def lesson_8_summary():
    print("\n📚 ZUSAMMENFASSUNG")
    print("─" * 50)
    print("""
🎓 WAS SIE GELERNT HABEN:

1. ✅ ECC-Grundlagen und mathematische Basis
2. ✅ Bedeutung von Generator-Punkten
3. ✅ X.509 Zertifikat-Struktur
4. ✅ Curveball-Schwachstelle im Detail
5. ✅ Praktische Angriffstechniken
6. ✅ Schutzmaßnahmen und Erkennung

🎯 NÄCHSTE SCHRITTE:

1. Öffnen Sie die Web-Challenge: https://localhost:8443
2. Experimentieren Sie mit den ECC-Parametern
3. Versuchen Sie, die CVE-2020-0601 Schwachstelle auszulösen
4. Nutzen Sie die erlernten Konzepte für die Lösung!

🏆 CHALLENGE-TIPP:
    - Wählen Sie P384 als Kurve
    - Verwenden Sie 'rogue' als Generator
    - Setzen Sie einen längeren Private Key
    - Beobachten Sie die Debug-Ausgaben

Viel Erfolg! 🚀
    """)

def interactive_quiz():
    print("\n🧠 WISSENSTEST")
    print("─" * 50)
    
    questions = [
        {
            "question": "Was ist das Discrete Logarithm Problem in ECC?",
            "options": [
                "a) Finde d, sodass Q = d × G",
                "b) Finde G, sodass Q = d × G", 
                "c) Finde Q, sodass Q = d × G"
            ],
            "correct": "a",
            "explanation": "Das DLP sucht den privaten Schlüssel d für gegebene Punkte Q und G."
        },
        {
            "question": "Was war das Problem bei Windows CVE-2020-0601?",
            "options": [
                "a) Schwache Zufallszahlen",
                "b) Fehlende Generator-Punkt-Validierung",
                "c) Schwache Hash-Funktionen"
            ],
            "correct": "b",
            "explanation": "Windows validierte nicht, ob der Generator-Punkt in explicitCurve dem Standard entsprach."
        },
        {
            "question": "Wie umgeht Curveball das Discrete Logarithm Problem?",
            "options": [
                "a) Durch Brute-Force-Angriffe",
                "b) Durch Wahl eines eigenen Generators G'",
                "c) Durch Quantencomputer"
            ],
            "correct": "b",
            "explanation": "Angreifer wählen G' so, dass sie den entsprechenden Private Key kennen."
        }
    ]
    
    score = 0
    for i, q in enumerate(questions, 1):
        print(f"\n❓ Frage {i}: {q['question']}")
        for option in q['options']:
            print(f"   {option}")
        
        answer = input("\nIhre Antwort (a/b/c): ").lower().strip()
        
        if answer == q['correct']:
            print("✅ Richtig!")
            score += 1
        else:
            print(f"❌ Falsch. Korrekt ist: {q['correct']}")
        
        print(f"💡 Erklärung: {q['explanation']}")
        input("\nDrücken Sie Enter für die nächste Frage...")
    
    print(f"\n🏆 Ihr Ergebnis: {score}/{len(questions)}")
    
    if score == len(questions):
        print("🎉 Perfekt! Sie sind bereit für die Challenge!")
    elif score >= len(questions) * 0.7:
        print("👍 Gut! Mit diesem Wissen können Sie die Challenge schaffen!")
    else:
        print("📚 Wiederholen Sie die Lektionen für besseres Verständnis.")

def main():
    print_banner()
    
    print("🎯 Willkommen zum interaktiven Curveball-Lernmodul!")
    print("Dieses Programm führt Sie Schritt für Schritt durch alle wichtigen Konzepte.")
    print()
    
    choice = input("Möchten Sie das vollständige Tutorial durchlaufen? (j/n): ").lower().strip()
    
    if choice == 'j' or choice == 'y' or choice == 'yes' or choice == 'ja':
        lesson_1_ecc_basics()
        lesson_2_generator_points()
        lesson_3_key_generation()
        lesson_4_certificate_structure()
        lesson_5_curveball_attack()
        lesson_6_practical_example()
        lesson_7_impact_and_defenses()
        lesson_8_summary()
        
        quiz_choice = input("\nMöchten Sie Ihr Wissen in einem Quiz testen? (j/n): ").lower().strip()
        if quiz_choice == 'j' or quiz_choice == 'y' or quiz_choice == 'yes' or quiz_choice == 'ja':
            interactive_quiz()
    
    print("\n" + "═" * 80)
    print("🚀 Bereit für die Challenge? Öffnen Sie: https://localhost:8443")
    print("═" * 80)

if __name__ == "__main__":
    main()
