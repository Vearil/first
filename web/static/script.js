const canvas = document.querySelector('#paintCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.querySelector('#colorPicker');
const brushSize = document.querySelector('#brushSize');
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Function to get position of touch or mouse event on the canvas
function getPosition(e) {
  let x, y;
  const rect = canvas.getBoundingClientRect(); // Get the canvas position relative to the viewport
  if (e.touches) {
    // For touch events, we get the first touch's position
    x = e.touches[0].clientX - rect.left;
    y = e.touches[0].clientY - rect.top;
  } else {
    // For mouse events
    x = e.offsetX;
    y = e.offsetY;
  }
  return { x, y };
}

// Mouse events
canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  const { x, y } = getPosition(e);
  lastX = x;
  lastY = y;
});

canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);

// Touch events
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault(); // Prevents scrolling or zooming on touch
  isDrawing = true;
  const { x, y } = getPosition(e);
  lastX = x;
  lastY = y;
});

canvas.addEventListener('touchend', () => isDrawing = false);
canvas.addEventListener('touchcancel', () => isDrawing = false);

// Clear button
const clearButton = document.querySelector('#clear');
clearButton.addEventListener('click', () => ctx.clearRect(0, 0, canvas.width, canvas.height));

// Save button
const saveButton = document.querySelector('#save');
saveButton.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'sketch.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// Drawing on mousemove or touchmove
canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  const { x, y } = getPosition(e);
  const baseSize = parseInt(brushSize.value);
  const speed = Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2);
  const dynamicSize = Math.max(1, baseSize - speed / 20);
  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = dynamicSize;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();
  lastX = x;
  lastY = y;
});

// Touch event drawing
canvas.addEventListener('touchmove', (e) => {
  if (!isDrawing) return;
  e.preventDefault(); // Prevents default touch scrolling
  const { x, y } = getPosition(e);
  const baseSize = parseInt(brushSize.value);
  const speed = Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2);
  const dynamicSize = Math.max(1, baseSize - speed / 20);
  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = dynamicSize;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();
  lastX = x;
  lastY = y;
});
