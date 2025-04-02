from .database import db
from flask_security import UserMixin, RoleMixin
from datetime import datetime
from flask_cors import CORS
roles_users = db.Table(
    'roles_users',
    db.Column('user_id', db.Integer(), db.ForeignKey('user.id')),
    db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))
)

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    pin_code = db.Column(db.Integer, nullable=True)
    active = db.Column(db.Boolean(), default=True)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    confirmed_at = db.Column(db.DateTime(), default=datetime.utcnow)
    roles = db.relationship('Role', secondary=roles_users, backref=db.backref('users', lazy='dynamic'))
    
    # Professional fields
    description = db.Column(db.String(255))
    service_type = db.Column(db.String(100))
    experience = db.Column(db.Integer)
    is_approved = db.Column(db.Boolean(), default=False)  # For approving professionals
    documents_verified = db.Column(db.Boolean(), default=False)

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(255))

class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255))
    base_price = db.Column(db.Float, nullable=False)
    time_required = db.Column(db.Integer)
    

class ServiceRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    date_of_request = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)
    date_of_completion = db.Column(db.DateTime())
    service_status = db.Column(db.String(50), default='requested')
    remarks = db.Column(db.String(255))
    rating = db.Column(db.Integer)

class JobStatus(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.String(255), unique=True, nullable=False)
    status = db.Column(db.String(50), nullable=False)
    result = db.Column(db.Text)
