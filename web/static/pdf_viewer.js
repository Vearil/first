const url          = pdfPath;
let   pdfDoc       = null;
let   currentZoom  = 1.5;
const pdfContainer = document.getElementById('pdf-container');

// Track in-flight render tasks per canvas:
const renderTasks = new WeakMap();  // canvas → current RenderTask

pdfjsLib.getDocument(url).promise
  .then(pdf => {
    pdfDoc = pdf;
    buildPageWrappers();
  })
  .catch(err => console.error('PDF load error:', err));

function buildPageWrappers() {
  const frag = document.createDocumentFragment();
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const w = document.createElement('div');
    w.className = 'page-wrapper';
    w.dataset.pageNumber = i;
    frag.appendChild(w);
    observer.observe(w);
  }
  pdfContainer.appendChild(frag);
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const wrapper = entry.target;
    const pageNum = +wrapper.dataset.pageNumber;

    if (entry.isIntersecting) {
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('pageNum', pageNum);
      window.history.replaceState({}, '', newUrl);

      let canvas = wrapper.querySelector('canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'pdf-page';
        wrapper.appendChild(canvas);
      }
      renderPage(pageNum, canvas);
    } else if (wrapper.querySelector('canvas')) {
      // Remove off-screen canvases to save memory
      wrapper.innerHTML = '';
    }
  });
}, {
  root: null,
  rootMargin: '500px 0px',
  threshold: [0, 0.1, 0.5, 1.0]
});

function renderPage(pageNum, canvas) {
  // 1) Cancel any in-flight render on this canvas
  const previousTask = renderTasks.get(canvas);
  if (previousTask) {
    previousTask.cancel();
    renderTasks.delete(canvas);
  }

  // 2) Start new render
  pdfDoc.getPage(pageNum).then(page => {
    const vp  = page.getViewport({ scale: currentZoom });
    const ctx = canvas.getContext('2d');
    canvas.width  = vp.width;
    canvas.height = vp.height;

    const renderTask = page.render({ canvasContext: ctx, viewport: vp });
    renderTasks.set(canvas, renderTask);

    // 3) Clean up when done or cancelled
    renderTask.promise
      .then(() => renderTasks.delete(canvas))
      .catch(err => {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Render error:', err);
        }
        renderTasks.delete(canvas);
      });
  });
}

function applyZoom() {
  document.querySelectorAll('.page-wrapper canvas').forEach(canvas => {
    const pageNum = +canvas.parentElement.dataset.pageNumber;
    renderPage(pageNum, canvas);
  });
}

function zoomIn()  { currentZoom = Math.min(currentZoom + 0.1, 3.0); applyZoom(); }
function zoomOut() { currentZoom = Math.max(currentZoom - 0.1, 0.1); applyZoom(); }

function handleZoomChange(val) {
  if (val === 'fit-width') {
    pdfDoc.getPage(1).then(page => {
      const vp1 = page.getViewport({ scale: 1 });
      currentZoom = pdfContainer.clientWidth / vp1.width;
      applyZoom();
    });
  }
  else if (val === 'fit-page') {
    pdfDoc.getPage(1).then(page => {
      const vp1    = page.getViewport({ scale: 1.1 });
      const scaleX = pdfContainer.clientWidth / vp1.width;
      const scaleY = window.innerHeight / vp1.height;
      currentZoom   = Math.min(scaleX, scaleY);
      applyZoom();
    });
  }
  else {
    currentZoom = 3.0;
    applyZoom();
  }
}

document.getElementById('zoom-in')
        .addEventListener('click', () => zoomIn());
document.getElementById('zoom-out')
        .addEventListener('click', () => zoomOut());
document.getElementById('page-zoom')
        .addEventListener('change', e => handleZoomChange(e.target.value));

// Expose controls if needed elsewhere
window.pdfViewer = { zoomIn, zoomOut, handleZoomChange };

