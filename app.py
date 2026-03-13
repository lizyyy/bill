from flask import Flask, render_template
from controllers import record_bp
import config

app = Flask(__name__)
app.config['SECRET_KEY'] = config.SECRET_KEY

app.register_blueprint(record_bp)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8002, debug=True)
