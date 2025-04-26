from email.policy import default
from sqlalchemy import Nullable
from . import db
from flask_login import UserMixin
from sqlalchemy.sql import func


class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.String(10000))
    date = db.Column(db.DateTime(timezone=True), default=func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=True)
    page = db.Column(db.Integer, nullable=True)


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.String(150))
    first_name = db.Column(db.String(150))
    notes = db.relationship('Note')
    is_admin = db.Column(db.Boolean, default=False)

    books = db.relationship('Book', backref='owner')

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), unique=True)
    author = db.Column(db.String(150))
    status = db.Column(db.String(15), default='available')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    bookPath = db.Column(db.String(150))
