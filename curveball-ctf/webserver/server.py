from flask import Flask, render_template, request, jsonify, session
import ssl
import socket
from cryptography import x509
from cryptography.hazmat.primitives import hashes
from cryptography.x509.oid import NameOID
import base64
import hashlib
import os
import json
import datetime
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization

app = Flask(__name__)
app.secret_key = 'curveball_ctf_secret_key_for_session_management_2025'  # Für Session-Management

# Simulierte ECC-Parameter für die Challenge
VALID_CURVES = {
    'P256': {'name': 'secp256r1', 'size': 256, 'secure': True},
    'P384': {'name': 'secp384r1', 'size': 384, 'secure': True},
    'P521': {'name': 'secp521r1', 'size': 521, 'secure': True}
}

GENERATOR_POINTS = {
    'standard': {'x': '6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296', 'valid': True},
    'rogue': {'x': 'deadbeefcafebabe1337133713371337deadbeefcafebabe1337133713371337', 'valid': False},
    'custom': {'x': '', 'valid': False}
}

def validate_ecc_parameters(curve, generator_x, generator_y, private_key, signature_data):
    """
    Simuliert die ECC-Parameter-Validierung mit der Curveball-Schwachstelle
    """
    try:
        # Schritt 1: Kurven-Validierung
        if curve not in VALID_CURVES:
            return False, "Ungültige Kurve ausgewählt", {}
        
        curve_info = VALID_CURVES[curve]
        
        # Schritt 2: Generator-Punkt-Validierung (hier ist der Bug!)
        # Normale Implementierung würde Generator validieren
        # Curveball: Generator wird NICHT korrekt validiert!
        
        generator_status = "unknown"
        if generator_x in [g['x'] for g in GENERATOR_POINTS.values()]:
            for name, point in GENERATOR_POINTS.items():
                if point['x'] == generator_x:
                    generator_status = name
                    break
        
        # Schritt 3: Simuliere die Schwachstelle
        vulnerability_triggered = False
        message = ""
        
        if generator_status == 'rogue':
            # Curveball-Schwachstelle ausgenutzt!
            if curve == 'P384' and len(private_key) >= 8:
                vulnerability_triggered = True
                message = "🎯 CVE-2020-0601 EXPLOIT ERFOLGREICH! ECC-Parameter wurden nicht korrekt validiert."
            else:
                message = "⚠️ Rogue Generator erkannt, aber andere Parameter stimmen nicht."
        elif generator_status == 'standard':
            message = "✅ Standard Generator verwendet - normale Validierung."
        elif generator_status == 'custom':
            if 'evil' in generator_x.lower() or 'rogue' in generator_x.lower():
                vulnerability_triggered = True
                message = "🎯 BENUTZERDEFINIERTER EXPLOIT! Sie haben eigene manipulierte Parameter erstellt."
            else:
                message = "❌ Benutzerdefinierte Parameter, aber kein Exploit erkannt."
        else:
            message = "❌ Unbekannte Generator-Parameter."
        
        # Debug-Informationen für Studenten
        debug_info = {
            'curve_secure': curve_info['secure'],
            'generator_status': generator_status,
            'vulnerability_triggered': vulnerability_triggered,
            'curve_size': curve_info['size'],
            'private_key_length': len(private_key) if private_key else 0
        }
        
        return vulnerability_triggered, message, debug_info
        
    except Exception as e:
        return False, f"Fehler bei der Parameter-Validierung: {str(e)}", {}

def generate_mock_certificate_info(curve, generator_x, generator_y, private_key):
    """
    Erstellt simulierte Zertifikatsinformationen basierend auf den eingegebenen Parametern
    """
    try:
        # Simuliere Zertifikats-Metadaten
        now = datetime.datetime.now()
        valid_from = now - datetime.timedelta(days=30)
        valid_until = now + datetime.timedelta(days=365)
        
        # Berechne einen simulierten Public Key basierend auf den Parametern
        public_key_x = generator_x if generator_x else "6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296"
        
        # Simuliere verschiedene Certificate Authority basierend auf Generator
        if 'rogue' in generator_x.lower() or 'evil' in generator_x.lower():
            issuer = "CN=Rogue Certificate Authority,O=Evil Corp,C=XX"
            trust_status = "⚠️ NICHT VERTRAUENSWÜRDIG"
            validation_status = "MANIPULIERT"
        elif generator_x and generator_x != GENERATOR_POINTS['standard']['x']:
            issuer = "CN=Custom Certificate Authority,O=Unknown,C=??"
            trust_status = "❓ UNBEKANNT"
            validation_status = "BENUTZERDEFINIERT"
        else:
            issuer = "CN=Trusted Root CA,O=Microsoft Corporation,C=US"
            trust_status = "✅ VERTRAUENSWÜRDIG"
            validation_status = "STANDARD"
        
        # Erstelle Zertifikatsdaten
        cert_info = {
            'subject': f"CN=curveball-demo.example.com,O=CTF Challenge,C=DE",
            'issuer': issuer,
            'serial_number': f"0x{hashlib.md5((generator_x + private_key).encode()).hexdigest()[:16]}",
            'valid_from': valid_from.strftime("%Y-%m-%d %H:%M:%S"),
            'valid_until': valid_until.strftime("%Y-%m-%d %H:%M:%S"),
            'signature_algorithm': f"ecdsa-with-SHA256 ({curve})",
            'public_key_algorithm': f"EC Public Key ({VALID_CURVES.get(curve, {}).get('size', 256)} bit)",
            'curve_name': VALID_CURVES.get(curve, {}).get('name', 'unknown'),
            'generator_point_x': public_key_x[:32] + "..." if len(public_key_x) > 32 else public_key_x,
            'generator_point_y': generator_y[:32] + "..." if generator_y and len(generator_y) > 32 else (generator_y or "nicht gesetzt"),
            'public_key_x': public_key_x,
            'private_key_present': bool(private_key),
            'trust_status': trust_status,
            'validation_status': validation_status,
            'thumbprint': hashlib.sha1((issuer + public_key_x + curve).encode()).hexdigest().upper(),
            'key_usage': ['Digital Signature', 'Key Agreement', 'Certificate Signing'],
            'extended_key_usage': ['TLS Web Server Authentication', 'TLS Web Client Authentication']
        }
        
        # CVE-2020-0601 spezifische Informationen
        curveball_info = {
            'generator_validation': validation_status != "STANDARD",
            'custom_generator': generator_x != GENERATOR_POINTS['standard']['x'] if generator_x else False,
            'vulnerability_indicator': 'rogue' in generator_x.lower() or 'evil' in generator_x.lower() if generator_x else False,
            'attack_vector': "ECC Generator Point Manipulation" if validation_status != "STANDARD" else "Keine Manipulation erkannt"
        }
        
        return cert_info, curveball_info
        
    except Exception as e:
        return {
            'error': f"Fehler beim Erstellen der Zertifikatsinformationen: {str(e)}"
        }, {}

@app.route('/', methods=['GET', 'POST'])
def index():
    flag = None
    validation_result = None
    certificate_info = None
    
    # Session-Initialisierung für Fehlversuche
    if 'failed_attempts' not in session:
        session['failed_attempts'] = 0
    
    if request.method == 'POST':
        # Hole Parameter aus dem Formular
        curve = request.form.get('curve', 'P256')
        generator_x = request.form.get('generator_x', '')
        generator_y = request.form.get('generator_y', '')
        private_key = request.form.get('private_key', '')
        signature_data = request.form.get('signature_data', '')
        
        # Validiere die Parameter
        is_vulnerable, message, debug_info = validate_ecc_parameters(
            curve, generator_x, generator_y, private_key, signature_data
        )
        
        validation_result = {
            'success': is_vulnerable,
            'message': message,
            'debug': debug_info
        }
        
        if is_vulnerable:
            flag = 'FLAG{curveball_interactive_ecc_parameter_manipulation_pwned}'
            # Reset bei Erfolg
            session['failed_attempts'] = 0
        else:
            # Erhöhe Fehlversuche bei Misserfolg
            session['failed_attempts'] = session.get('failed_attempts', 0) + 1
        
        # Generiere Zertifikatsinformationen
        certificate_info, curveball_info = generate_mock_certificate_info(curve, generator_x, generator_y, private_key)
    else:
        certificate_info = None
        curveball_info = None
    
    return render_template('index.html', 
                         flag=flag, 
                         validation_result=validation_result,
                         curves=VALID_CURVES,
                         generators=GENERATOR_POINTS,
                         certificate_info=certificate_info,
                         curveball_info=curveball_info,
                         failed_attempts=session.get('failed_attempts', 0))

@app.route('/introduction')
def introduction():
    """Serviert die detaillierte Curveball-Einführung"""
    try:
        with open('CURVEBALL_INTRODUCTION.md', 'r', encoding='utf-8') as f:
            markdown_content = f.read()
        
        # Konvertiere Markdown zu HTML (einfache Version)
        html_content = markdown_to_html(markdown_content)
        
        return render_template('introduction.html', content=html_content)
    except FileNotFoundError:
        return "Einführungsdokumentation nicht gefunden", 404

def markdown_to_html(markdown_text):
    """Einfache Markdown-zu-HTML Konvertierung"""
    import re
    
    html = markdown_text
    
    # Headers
    html = re.sub(r'^# (.+)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.+)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.+)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^#### (.+)$', r'<h4>\1</h4>', html, flags=re.MULTILINE)
    
    # Code blocks
    html = re.sub(r'```(\w+)?\n(.*?)\n```', r'<pre><code class="language-\1">\2</code></pre>', html, flags=re.DOTALL)
    html = re.sub(r'`([^`]+)`', r'<code>\1</code>', html)
    
    # Bold and italic
    html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.+?)\*', r'<em>\1</em>', html)
    
    # Links
    html = re.sub(r'\[(.+?)\]\((.+?)\)', r'<a href="\2" target="_blank">\1</a>', html)
    
    # Line breaks
    html = html.replace('\n\n', '</p><p>')
    html = html.replace('\n', '<br>')
    
    # Wrap in paragraphs
    html = '<p>' + html + '</p>'
    
    # Clean up empty paragraphs
    html = re.sub(r'<p></p>', '', html)
    html = re.sub(r'<p><h([1-6])>', r'<h\1>', html)
    html = re.sub(r'</h([1-6])></p>', r'</h\1>', html)
    
    return html

@app.route('/hint')
def hint():
    """Endpoint für progressive Hints basierend auf Fehlversuchen"""
    failed_attempts = session.get('failed_attempts', 0)
    
    # Definiere alle verfügbaren Hints
    all_hints = [
        {
            'min_attempts': 3,
            'text': "🔍 CVE-2020-0601 betrifft die ECC-Generator-Punkt-Validierung. Windows validierte nicht korrekt, ob der Generator-Punkt dem Standard entspricht."
        },
        {
            'min_attempts': 4,
            'text': "🎯 Versuchen Sie verschiedene Kurven - P384 (384 bit) ist für diesen Exploit besonders interessant."
        },
        {
            'min_attempts': 5,
            'text': "🔑 Der Generator-Punkt ist der Schlüssel! Schauen Sie sich die vordefinierten Optionen an - 'rogue' Generator könnte sehr hilfreich sein."
        },
        {
            'min_attempts': 6,
            'text': "💾 Ein längerer Private Key (mindestens 8 Zeichen) ist für diesen speziellen Exploit erforderlich."
        },
        {
            'min_attempts': 7,
            'text': "🎮 Kombinieren Sie alles: P384 Kurve + 'rogue' Generator + längerer Private Key. Das ist der klassische Curveball-Exploit!"
        },
        {
            'min_attempts': 8,
            'text': "🔓 Alternativ: Erstellen Sie eigene manipulierte Parameter! Geben Sie 'evil' oder 'rogue' in das Generator X-Feld ein für einen benutzerdefinierten Exploit."
        },
        {
            'min_attempts': 10,
            'text': "🏆 Letzter Tipp: Verwenden Sie P384 + 'rogue' Generator + Private Key 'curveball123' - das sollte definitiv funktionieren!"
        }
    ]
    
    # Filtere verfügbare Hints basierend auf Fehlversuchen
    available_hints = []
    for hint in all_hints:
        if failed_attempts >= hint['min_attempts']:
            available_hints.append(hint['text'])
    
    return jsonify({
        'hints': available_hints,
        'failed_attempts': failed_attempts,
        'next_hint_at': None if not available_hints else min([h['min_attempts'] for h in all_hints if h['min_attempts'] > failed_attempts], default=None)
    })

@app.route('/explain/<topic>')
def explain(topic):
    """Erklärt verschiedene Kryptographie-Konzepte"""
    explanations = {
        'ecc': {
            'title': 'Elliptic Curve Cryptography (ECC)',
            'content': 'ECC basiert auf der mathematischen Struktur elliptischer Kurven. Die Sicherheit beruht auf dem Discrete Logarithm Problem.'
        },
        'generator': {
            'title': 'Generator-Punkt',
            'content': 'Der Generator-Punkt G ist ein fest definierter Punkt auf der elliptischen Kurve. Alle anderen Punkte werden durch Multiplikation mit G erzeugt.'
        },
        'curveball': {
            'title': 'CVE-2020-0601 Curveball',
            'content': 'Windows validierte nicht korrekt, ob der Generator-Punkt in ECC-Zertifikaten dem Standard entspricht. Angreifer konnten eigene Generatoren verwenden.'
        }
    }
    
    return jsonify(explanations.get(topic, {'title': 'Unbekannt', 'content': 'Thema nicht gefunden'}))

if __name__ == '__main__':
    context = ('certs/server.crt', 'certs/server.key')
    app.run(host='0.0.0.0', port=8443, ssl_context=context, debug=True)
