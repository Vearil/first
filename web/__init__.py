from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from os import path
from flask_login import LoginManager
from flask_admin import Admin
from flask_wtf import FlaskForm
from flask_migrate import Migrate
import os


db = SQLAlchemy()
DB_NAME = "database.db"

def create_app():
    app = Flask(__name__)
    migrate = Migrate(app, db)
    app.config['SECRET_KEY'] = 'hjshjhdjah kjshkjdhjs'
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_NAME}'
    app.secret_key = os.environ.get('SECRET_KEY', 'fallback_dev_key')
    db.init_app(app)
    
    admin = Admin(name='My Admin', template_mode='bootstrap4')

    from .views import views
    from .auth import auth

    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/')

    from .models import User, Note, Book


    from .admin import setup_admin
    setup_admin(app)

    with app.app_context():
        db.create_all()

    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(id):
        return User.query.get(int(id))

    return app


def create_database(app):
    if not path.exists('web/' + DB_NAME):
        with app.app_context():
            db.create_all()
        print('Created Database!')

