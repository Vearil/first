const FLASH_TIMEOUT = 1000;  // 1 sec
const LAYOUT_CLASSES = {
  RIGHT: 'align-right',
  LEFT: 'align-left'
};
//note delete with redirect
function deleteNote(noteId) {
  fetch("/delete-note", {
    method: "POST",
    body: JSON.stringify({ noteId: noteId }),
  }).then((_res) => {
    window.location.href = "/";
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Could not delete note');
  });
  }


//deleting notes without reloading
document.addEventListener('click', function (e) {
  if (e.target.closest('button.close')) {
    const button = e.target.closest('button.close');
    const noteId = button.getAttribute('data-note-id');

    fetch("/delete-note", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ noteId: noteId }),
    })
    .then((res) => {
        if (!res.ok) {
            throw new Error("Failed to delete note");
        }
        const noteElement = button.closest("li.list-group-item");
        if (noteElement) {
            noteElement.remove();
            const notesList = document.getElementById("notes");
            if (notesList.children.length === 0) {
                notesList.innerHTML = "<li class='list-group-item text-center'>No notes available.</li>";
            }
        }
    })
    .catch((error) => {
        console.error("Error:", error);
        alert("Could not delete note");
    });
  }
});
//Flash autoclose
document.addEventListener('DOMContentLoaded', () => {
  const alerts = document.querySelectorAll('.alert');

  alerts.forEach((alert) => {
    setTimeout(() => {
      alert.classList.remove('show');
    }, FLASH_TIMEOUT); // 1 sec
  });
});

//layout change
function toggleLayout() {
  const layout = document.querySelector('.main-layout');
  const btnImg = document.getElementById('button-image');
  const topNav = document.querySelector('.top-nav');

  const isReversed = layout.classList.toggle('reversed');

  btnImg.src = `/static/img/${isReversed ? 'off' : 'on'}-button.png`;
  
  topNav.classList.toggle('align-right', !isReversed);
  topNav.classList.toggle('align-left', isReversed);

}
function toggleNotes() {
  const toggle = document.querySelector('.toggle-notes');
  const btnImg = document.getElementById('button-note');

  const isReversed = toggle.classList.toggle('reversed');

  btnImg.src = `/static/img/${isReversed ? 'off' : 'on'}-button.png`;
  
}


// Book notes
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('noteForm');
  const noteInput = document.getElementById('note');
  const notesList = document.getElementById('notes');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const note = noteInput.value;
    const bookId = form.getAttribute('data-book-id');

    fetch("/add_note", {
        method: "POST",
        body: JSON.stringify({ note: note, book_id: bookId }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => { throw new Error(data.error); });
        }
        return response.json();
    })
    .then(data => {
        noteInput.value = '';
        const newNote = document.createElement('li');
        newNote.className = 'list-group-item';
        newNote.innerHTML = `
            ${note}
            <button type="button" class="close" onClick="deleteBookNote(${data.note_id}, ${bookId})">
                <span aria-hidden="true">&times;</span>
            </button>
        `;
        notesList.appendChild(newNote);
    })
    .catch(error => {
        alert(error.message);
    });
  });
});