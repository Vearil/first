"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

# revision identifiers, used by Alembic.
revision = ${repr(up_revision)}
down_revision = ${repr(down_revision)}
branch_labels = ${repr(branch_labels)}
depends_on = ${repr(depends_on)}


def upgrade():
    with op.batch_alter_table('note', schema=None) as batch_op:
        batch_op.add_column(sa.Column('book_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            'fk_note_book',  # Name of the foreign key constraint
            'book',  # Referenced table
            ['book_id'],  # Column(s) in the note table
            ['id'],  # Column(s) in the book table
        )



def downgrade():
    with op.batch_alter_table('note', schema=None) as batch_op:
        batch_op.drop_constraint('fk_note_book', type_='foreignkey')  # Drop the foreign key constraint
        batch_op.drop_column('book_id')  # Drop the 'book_id' column
