const url = pdfPath;        
let pdfDoc = null;
let currentZoom = 1.0;
const pdfContainer = document.getElementById('pdf-container');

// 1) Load PDF
pdfjsLib.getDocument(url).promise.then(function(pdf) {
  pdfDoc = pdf;
  setupPageWrappers();
});

// 2) Create an empty wrapper for each page
function setupPageWrappers() {
  const frag = document.createDocumentFragment();
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const wrapper = document.createElement('div');
    wrapper.className = 'page-wrapper';
    wrapper.dataset.pageNumber = i;
    frag.appendChild(wrapper);
    observer.observe(wrapper);
  }
  pdfContainer.appendChild(frag);
}

// 3) IntersectionObserver to lazy-render / teardown
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const wrapper = entry.target;
    const pageNum = parseInt(wrapper.dataset.pageNumber, 10);

    if (entry.isIntersecting) {
      // if no canvas yet, create one
      let canvas = wrapper.querySelector('canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'pdf-page';
        wrapper.appendChild(canvas);
      }
      renderPage(pageNum, canvas);
    } else if (wrapper.querySelector('canvas')) {
      // far out of view: remove to free memory
      wrapper.innerHTML = '';
    }
  });
}, {
  root: null,               // viewport
  rootMargin: '500px 0px',  // preload 500px above & below
  threshold: 0.01
});

// 4) Render one page into its canvas
function renderPage(pageNum, canvas) {
  const ctx = canvas.getContext('2d');
  pdfDoc.getPage(pageNum).then(page => {
    const vp = page.getViewport({ scale: currentZoom });
    canvas.width  = vp.width;
    canvas.height = vp.height;
    page.render({ canvasContext: ctx, viewport: vp });
  });
}

// 5) Zoom controls
function zoomIn()    { currentZoom = Math.min(currentZoom + 0.1, 3.0); applyZoom(); }
function zoomOut()   { currentZoom = Math.max(currentZoom - 0.1, 0.1); applyZoom(); }
function setZoom(v)  {
  const z = parseFloat(v.replace('%',''))/100;
  if (z>0) { currentZoom = z; applyZoom(); }
}
function handleZoomChange(val) {
  currentZoom = (val==='fit-width' ? 3.0 : 1.5);
  applyZoom();
}

function applyZoom() {
  // update input
  document.getElementById('zoom').value = Math.round(currentZoom*100) + '%';
  // re-render only the currently-visible wrappers
  document.querySelectorAll('.page-wrapper').forEach(wrapper => {
    const canvas = wrapper.querySelector('canvas');
    if (canvas) {
      // page is (or was) in view → re-render
      renderPage(parseInt(wrapper.dataset.pageNumber,10), canvas);
    }
  });
}
