from flask import Flask, render_template
from models.payment import Payment
app = Flask(__name__)

@app.route('/')
def index():
    data = {'javascript': Payment().javascript()}
    return render_template('index.html', data=data)

if __name__ == '__main__':
    app.run()
