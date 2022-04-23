from flask import Flask, redirect

app = Flask(__name__, static_url_path='', static_folder='static')

@app.get('/')
def index():
    return redirect('/index.html')

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000)
