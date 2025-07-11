from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    flag = None
    if request.method == 'POST':
        # hier kann später die Zertifikatsprüfung eingebaut werden
        flag = 'FLAG{curveball_ctf_success}'
    return render_template('index.html', flag=flag)

if __name__ == '__main__':
    context = ('certs/server.crt', 'certs/server.key')
    app.run(host='0.0.0.0', port=443, ssl_context=context)
