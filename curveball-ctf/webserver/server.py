from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)
app.secret_key = 'curveball_ctf_secret_key_for_session_management_2025'  # Für Session-Management

@app.route('/')
def index():
    """Hauptseite mit Curveball-Einführung und Challenge-Übersicht"""
    return render_template('index.html')

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

@app.route('/challenge1')
def challenge1():
    """Challenge 1: ECC Grundlagen - Punktmultiplikation"""
    return render_template('challenge1.html')

@app.route('/challenge2')
def challenge2():
    """Challenge 2: Zertifikatsanalyse mit OpenSSL"""
    return render_template('challenge2.html')

@app.route('/challenge3')
def challenge3():
    """Challenge 3: Curveball Exploit Simulation"""
    return render_template('challenge3.html')

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
    app.run(host='0.0.0.0', port=8443, ssl_context=context, debug=False)
