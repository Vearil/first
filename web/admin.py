from flask_admin import Admin, AdminIndexView, expose
from flask_admin.contrib.sqla import ModelView
from flask_login import current_user
from .models import db, User, Note, Book

class RestrictedModelView(ModelView):
    def is_accessible(self):
        return current_user.is_authenticated and current_user.is_admin
    
    def on_model_change(self, form, model, is_created):
        print(f"Form data: {form.data}")
        super(RestrictedModelView, self).on_model_change(form, model, is_created)

class UserModelView(RestrictedModelView):
    column_list = ['id', 'email', 'first_name', 'is_admin']
    form_columns = ['email', 'first_name']
    column_exclude_list = ['notes', 'books']

    column_searchable_list = ['email', 'first_name']
    column_sortable_list = ['id', 'email','first_name']

class BookModelView(RestrictedModelView):
    column_list = ['id', 'name', 'author', 'status', 'user_id', 'bookPath']
    form_columns = ['name', 'author', 'status', 'user_id', 'bookPath']

    column_searchable_list = ['name', 'author', 'user_id']
    column_sortable_list = ['id', 'name','author', 'status', 'user_id']

class NoteModelView(RestrictedModelView):
    column_list = ['id', 'data', 'date', 'user_id', 'book_id']
    form_columns = ['data', 'user_id']

    column_searchable_list = ['data', 'user_id']
    column_sortable_list = ['date', 'id','user_id']

class HomeView(AdminIndexView):
    def is_accessible(self):
        return current_user.is_authenticated and current_user.is_admin
    
    @expose('/')
    def index(self):
        user_count = User.query.count()
        book_count = Book.query.count()
        note_count = Note.query.count()
        
        return self.render('admin/home.html', 
                         user_count=user_count,
                         book_count=book_count,
                         note_count=note_count)
    
def setup_admin(app):
    admin = Admin(
        name='My Admin',
        template_mode='bootstrap4',
        index_view=HomeView(name='Dashboard', endpoint='admin', url='/admin/')
    )    
    admin.init_app(app)
    admin.add_view(UserModelView(User, db.session))
    admin.add_view(NoteModelView(Note, db.session))
    admin.add_view(BookModelView(Book, db.session))
