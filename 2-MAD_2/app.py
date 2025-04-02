from flask import Flask
from Backend.database import db
from Backend.models import User, Role, Service, ServiceRequest, JobStatus
from flask_security import Security, SQLAlchemyUserDatastore
from Backend.config import LocalDevelopmentConfig
from flask_security import hash_password
from celery import Celery

def create_app():
    app = Flask(__name__, template_folder='Frontend', static_folder='Frontend/static')
    app.config.from_object(LocalDevelopmentConfig)
    
    # Configure Flask-Security token settings
    app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = 'Authorization'
    app.config['WTF_CSRF_ENABLED'] = False  # Disable CSRF for API
    
    db.init_app(app)
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore)
    app.app_context().push()
    return app

app = create_app()

with app.app_context():
    db.create_all()
    app.security.datastore.find_or_create_role(name='admin', description='Administrator')
    app.security.datastore.find_or_create_role(name='user_customer', description='User_Customer')
    app.security.datastore.find_or_create_role(name='user_professional', description='User_Professional')
    db.session.commit()
    
    if not app.security.datastore.find_user(email='adminsanjay@gmail.com'):
        app.security.datastore.create_user(
            email='adminsanjay@gmail.com', 
            password=hash_password('admin1234'),
            username='admin', 
            roles=['admin'], 
            phone='8939037854', 
            pin_code='600014', 
            active=True
        )
    if not app.security.datastore.find_user(email='customerSanjay@gmail.com'):
        app.security.datastore.create_user(
            email='customerSanjay@gmail.com', 
            password=hash_password('customer1234'),
            username='customer', 
            roles=['user_customer'], 
            phone='8939037954', 
            pin_code='600014', 
            active=True
        )
    if not app.security.datastore.find_user(email='professionalsanjay@gmail.com'):
        app.security.datastore.create_user(
            email='professionalsanjay@gmail.com', 
            password=hash_password('professional1234'),
            username='professional', 
            roles=['user_professional'], 
            phone='893907854',
            pin_code='600014', 
            active=True
        )
    db.session.commit()

# Import routes after app is fully configured
from Backend.routes import *

if __name__ == '__main__':
    app.run()
