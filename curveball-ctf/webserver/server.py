from flask import Flask, render_template, request, jsonify
import ssl
import socket
from cryptography import x509
from cryptography.hazmat.primitives import hashes
from cryptography.x509.oid import NameOID
import base64
import hashlib
import os
import json

app = Flask(__name__)

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

@app.route('/', methods=['GET', 'POST'])
def index():
    flag = None
    validation_result = None
    
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
    
    return render_template('index.html', 
                         flag=flag, 
                         validation_result=validation_result,
                         curves=VALID_CURVES,
                         generators=GENERATOR_POINTS)

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
    """Endpoint für gestufte Hints"""
    hints = [
        "🔍 CVE-2020-0601 betrifft die ECC-Generator-Punkt-Validierung",
        "🎯 Versuchen Sie verschiedene Kurven - P384 ist interessant",
        "🔑 Der Generator-Punkt ist der Schlüssel - 'rogue' könnte helfen",
        "💾 Ein längerer Private Key (>8 Zeichen) könnte nötig sein",
        "🎮 Kombinieren Sie: P384 + rogue Generator + längerer Private Key",
        "🔓 Oder erstellen Sie eigene 'evil' Parameter im Generator-Feld!"
    ]
    return jsonify(hints)

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
