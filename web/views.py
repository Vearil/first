from flask import Blueprint, render_template, request, flash, jsonify, redirect, url_for, current_app, send_file, send_from_directory, session
from flask_login import login_required, current_user
from flask_sqlalchemy import SQLAlchemy
from .models import Note, Book
from . import db
import json, os

views = Blueprint('views', __name__)

@views.route('/', methods=['GET', 'POST'])
@login_required
def home():
    if request.method == 'POST':
        note = request.form.get('note')

        if len(note) < 1:
            flash('Note is too short!', category='error')
        else:
            new_note = Note(data=note, user_id=current_user.id)
            db.session.add(new_note)
            db.session.commit()
            flash('Note added', category='success')
    borrowed_books = Book.query.filter(Book.user_id == current_user.id).all()
    return render_template("home.html", user=current_user, books=borrowed_books)

@views.route('/delete-note', methods=['POST'])
def delete_note():  
    note = json.loads(request.data) 
    noteId = note['noteId']
    note = Note.query.get(noteId)
    if note:
        if note.user_id == current_user.id:
            db.session.delete(note)
            db.session.commit()

    return jsonify({})

@views.route('/borrow', methods=['GET','POST'])
@login_required
def borrow():
    query = Book.query

    search_query = request.args.get('query', '').strip()  
    if search_query:
        query = query.filter(
            db.or_(
                Book.name.ilike(f'%{search_query}%'),
                Book.author.ilike(f'%{search_query}%'),
            )
        )

    books = query.all()
    
    if request.method == 'POST':
        book_id = request.form.get('book_id')
        book = Book.query.get(book_id)
        if book.status == 'available':
            book.status = 'borrowed'
            book.user_id = current_user.id
            db.session.commit()
            return redirect(url_for('views.home'))
        elif book.user_id == current_user.id and book.status == 'borrowed':
            book.status = 'available'
            book.user_id = None
            db.session.commit()
            return redirect(url_for('views.borrow'))

    return render_template("borrow.html", user=current_user, books= books, query=search_query)

@views.route('/book/<int:book_id>', methods=['GET', 'POST'])
@login_required
def books(book_id):
    book = Book.query.get_or_404(book_id)

    if book.user_id != current_user.id:
        return redirect(url_for('views.home'))

    pdf_path = url_for('static', filename=f'books/{book.bookPath}')  

    return render_template(
        "read.html",
        user=current_user,
        book=book,
        book_id=book_id,
        user_id=current_user.id,
        pdf_path=pdf_path
    )
@views.route('/book/<int:book_id>/notes', methods=['GET', 'POST'])
@login_required
def book_notes(book_id):
    book = Book.query.get_or_404(book_id)
    page = request.args.get('pageNum', 1, type=int)

    pdf_path = url_for('static', filename=f'/books/{book.bookPath}')

    if book.user_id != current_user.id:
        return redirect(url_for('views.home'))

    return render_template("notes.html", user=current_user, book=book, book_id=book_id, user_id=current_user.id, pdf_path=pdf_path, page = page)

@views.route('/add_note', methods=['POST'])
@login_required
def add_note():
    data = request.get_json()

    note = data.get('note')
    book_id = data.get('book_id')

    if not note or len(note) < 1:
        return {'error': 'Note is too short!'}, 400

    new_note = Note(data=note, user_id=current_user.id, book_id=book_id)
    db.session.add(new_note)
    db.session.commit()

    return {'message': 'Note added!', 'note_id': new_note.id}, 200


@views.route('/draw', methods=['GET', 'POST'])
@login_required
def draw():
    return render_template("draw.html", user=current_user)