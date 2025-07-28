from flask import Flask, render_template, request, jsonify, send_from_directory, session
import os

app = Flask(__name__)
app.secret_key = 'curveball_ctf_secret_key_for_session_management_2025'  # Secret key for session management

# Challenge progress management
def get_completed_challenges():
    """Returns the list of completed challenges"""
    return session.get('completed_challenges', [])

def mark_challenge_completed(challenge_number):
    """Marks a challenge as completed"""
    completed = get_completed_challenges()
    if challenge_number not in completed:
        completed.append(challenge_number)
        session['completed_challenges'] = completed

def is_challenge_unlocked(challenge_number):
    """Checks if a challenge is unlocked"""
    if challenge_number == 1:
        return True  # Challenge 1 is always unlocked
    
    completed = get_completed_challenges()
    # Challenge N is unlocked if Challenge N-1 is completed
    return (challenge_number - 1) in completed

def get_challenge_status():
    """Returns the status of all challenges"""
    completed = get_completed_challenges()
    return {
        'completed': completed,
        'unlocked': [i for i in range(1, 5) if is_challenge_unlocked(i)]
    }

# Add security headers
@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Cross-Origin-Embedder-Policy'] = 'unsafe-none'
    response.headers['Cross-Origin-Opener-Policy'] = 'unsafe-none'
    return response

@app.route('/')
def index():
    """Main page with challenge status"""
    challenge_status = get_challenge_status()
    return render_template('index.html', challenge_status=challenge_status)

@app.route('/introduction')
def introduction():
    """shows the introduction documentation"""
    try:
        with open('CURVEBALL_INTRODUCTION.md', 'r', encoding='utf-8') as f:
            markdown_content = f.read()
        
        html_content = markdown_to_html(markdown_content)
        
        return render_template('introduction.html', content=html_content)
    except FileNotFoundError:
        return "Einführungsdokumentation nicht gefunden", 404

def markdown_to_html(markdown_text):
    """Markdown to HTML conversion"""
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
    """Challenge 1: ECC Basics - Point Multiplication"""
    if not is_challenge_unlocked(1):
        return render_template('challenge_locked.html', challenge_number=1)
    return render_template('challenge1.html')

@app.route('/challenge2')
def challenge2():
    """Challenge 2: Certificate Analysis with OpenSSL"""
    if not is_challenge_unlocked(2):
        return render_template('challenge_locked.html', challenge_number=2)
    return render_template('challenge2.html')

@app.route('/challenge3')
def challenge3():
    """Challenge 3: Curveball Exploit Simulation"""
    if not is_challenge_unlocked(3):
        return render_template('challenge_locked.html', challenge_number=3)
    return render_template('challenge3.html')

@app.route('/challenge4')
def challenge4():
    """Challenge 4: Curve Parameters & Signature Validation"""
    if not is_challenge_unlocked(4):
        return render_template('challenge_locked.html', challenge_number=4)
    return render_template('challenge4.html')

@app.route('/api/complete_challenge/<int:challenge_number>', methods=['POST'])
def complete_challenge(challenge_number):
    """API endpoint to mark a challenge as completed"""
    if challenge_number < 1 or challenge_number > 4:
        return jsonify({'error': 'Invalid challenge number'}), 400
    
    if not is_challenge_unlocked(challenge_number):
        return jsonify({'error': 'Challenge is not unlocked'}), 403
    
    mark_challenge_completed(challenge_number)
    return jsonify({
        'success': True,
        'message': f'Challenge {challenge_number} completed!',
        'status': get_challenge_status()
    })

@app.route('/api/challenge_status')
def challenge_status_api():
    """API endpoint for challenge status"""
    return jsonify(get_challenge_status())

@app.route('/api/reset_progress', methods=['POST'])
def reset_progress():
    """API endpoint to reset progress"""
    session['completed_challenges'] = []
    return jsonify({
        'success': True,
        'message': 'Progress reset',
        'status': get_challenge_status()
    })

@app.route('/downloads/<filename>')
def download_file(filename):
    """Shows files for download"""
    try:
        downloads_path = os.path.join(app.root_path, 'static', 'downloads')
        file_path = os.path.join(downloads_path, filename)
        
        # Debug-Informationen loggen
        print(f"Download requested: {filename}")
        print(f"Downloads path: {downloads_path}")
        print(f"File path: {file_path}")
        print(f"File exists: {os.path.exists(file_path)}")
        
        if os.path.exists(file_path):
            # Check file size to ensure it's not empty
            file_size = os.path.getsize(file_path)
            print(f"File size: {file_size} bytes")
            
            if file_size == 0:
                print(f"File is empty: {file_path}")
                return "File is empty", 404
            
            response = send_from_directory(downloads_path, filename, as_attachment=True)
            # Add additional headers for browser compatibility
            response.headers['Content-Description'] = 'File Transfer'
            response.headers['Content-Transfer-Encoding'] = 'binary'
            response.headers['Cache-Control'] = 'must-revalidate'
            response.headers['Pragma'] = 'public'
            return response
        else:
            print(f"File not found: {file_path}")
            return "File not found", 404
    except Exception as e:
        print(f"Error in download_file: {e}")
        return "Internal server error", 500

@app.route('/scripts/<filename>')
def download_script(filename):
    """Shows Python scripts for download"""
    try:
        scripts_path = os.path.join(app.root_path, 'static', 'scripts')
        file_path = os.path.join(scripts_path, filename)
        
        # Debug-Informationen loggen
        print(f"Script download requested: {filename}")
        print(f"Scripts path: {scripts_path}")
        print(f"File path: {file_path}")
        print(f"File exists: {os.path.exists(file_path)}")
        
        if os.path.exists(file_path):
            # Check file size to ensure it's not empty
            file_size = os.path.getsize(file_path)
            print(f"File size: {file_size} bytes")
            
            if file_size == 0:
                print(f"File is empty: {file_path}")
                return "File is empty", 404
            
            response = send_from_directory(scripts_path, filename, as_attachment=True)
            # Add additional headers for browser compatibility
            response.headers['Content-Description'] = 'File Transfer'
            response.headers['Content-Transfer-Encoding'] = 'binary'
            response.headers['Cache-Control'] = 'must-revalidate'
            response.headers['Pragma'] = 'public'
            response.headers['Content-Type'] = 'text/x-python'
            return response
        else:
            print(f"File not found: {file_path}")
            return "File not found", 404
    except Exception as e:
        print(f"Error in download_script: {e}")
        return "Internal server error", 500

@app.route('/debug/files')
def debug_files():
    """Debug route to check available files"""
    try:
        downloads_path = os.path.join(app.root_path, 'static', 'downloads')
        scripts_path = os.path.join(app.root_path, 'static', 'scripts')
        
        downloads_files = os.listdir(downloads_path) if os.path.exists(downloads_path) else []
        scripts_files = os.listdir(scripts_path) if os.path.exists(scripts_path) else []
        
        return jsonify({
            'downloads_path': downloads_path,
            'downloads_exists': os.path.exists(downloads_path),
            'downloads_files': downloads_files,
            'scripts_path': scripts_path,
            'scripts_exists': os.path.exists(scripts_path),
            'scripts_files': scripts_files,
            'app_root_path': app.root_path
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/static/downloads/<filename>')
def serve_static_download(filename):
    """Alternative route for serving downloads directly from static folder"""
    try:
        downloads_path = os.path.join(app.root_path, 'static', 'downloads')
        file_path = os.path.join(downloads_path, filename)
        
        print(f"Static download requested: {filename}")
        print(f"File path: {file_path}")
        print(f"File exists: {os.path.exists(file_path)}")
        
        if os.path.exists(file_path):
            response = send_from_directory(downloads_path, filename, as_attachment=False)
            response.headers['Content-Type'] = 'application/octet-stream'
            response.headers['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        else:
            return "File not found", 404
    except Exception as e:
        print(f"Error in serve_static_download: {e}")
        return "Internal server error", 500

@app.route('/explain/<topic>')
def explain(topic):
    """Explains various cryptography concepts"""
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
 