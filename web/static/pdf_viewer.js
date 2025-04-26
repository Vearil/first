const url = pdfPath;  // from Flask

let pdfDoc = null;
const scale = 1.5;  // Adjust this for desired zoom level (1.5 = 150% zoom)
const pdfContainer = document.getElementById('pdf-container');

pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
  pdfDoc = pdfDoc_;
  // Render pages when they're needed
  renderPage(1);  // Start with the first page (you can improve this for lazy loading)
});

function renderPage(num) {
  // Check if we have the page already
  if (num > pdfDoc.numPages) return;

  pdfDoc.getPage(num).then(function(page) {
    const viewport = page.getViewport({ scale: scale });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    canvas.style.marginBottom = "20px"; // Optional margin between pages

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    // Use requestAnimationFrame for smoother rendering
    requestAnimationFrame(function() {
      page.render(renderContext).promise.then(function() {
        pdfContainer.appendChild(canvas);
        // Render next page after current page finishes (to avoid blocking)
        renderPage(num + 1);
      });
    });
  });
}

