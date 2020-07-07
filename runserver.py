from flask import Flask
from views import create_app

app = Flask(__name__)

create_app(app)

if __name__ == '__main__':
    app.run('0.0.0.0', debug=True)
