from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def index():
    data = {}
    return render_template('index.html', data=data)
