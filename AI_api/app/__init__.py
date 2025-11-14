from flask import Flask
from flask_cors import CORS
from app import config

def create_app(config_object=config):
    app = Flask(__name__)
    CORS(app)

    app.config.from_object(config_object)
    from app.api.routes import bp as api_blueprint
    app.register_blueprint(api_blueprint)

    return app