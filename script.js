const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const eraserBtn = document.getElementById('eraserBtn');
const undoBtn = document.getElementById('undoBtn');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
const fileNameInput = document.getElementById('fileName');
const darkModeToggle = document.getElementById('darkModeToggle');

let painting = false;
let erasing = false;
let currentStroke = null;
let strokes = []; // Array of all strokes

const canvasWidth = 800;
const canvasHeight = 500;

function getCanvasBackground() {
  return document.body.classList.contains('dark') ? '#1a1a1a' : '#ffffff';
}

function fillCanvasBackground() {
  ctx.fillStyle = getCanvasBackground();
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function resizeCanvas() {
  const ratio = canvasWidth / canvasHeight;
  const maxWidth = window.innerWidth * 0.95;
  const maxHeight = window.innerHeight * 0.7;

  let newWidth = maxWidth;
  let newHeight = newWidth / ratio;

  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = newHeight * ratio;
  }

  canvas.width = newWidth;
  canvas.height = newHeight;
  redrawCanvas();
}

function startPosition(e) {
  painting = true;
  currentStroke = {
    type: erasing ? 'eraser' : 'brush',
    color: colorPicker.value,
    size: brushSize.value,
    points: []
  };
  addPointToStroke(e);
}

function endPosition() {
  if (!painting) return;
  painting = false;
  if (currentStroke.points.length > 0) {
    strokes.push(currentStroke);
  }
  currentStroke = null;
}

function addPointToStroke(e) {
  if (!painting) return;
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const x = ((clientX - rect.left) / rect.width) * canvas.width;
  const y = ((clientY - rect.top) / rect.height) * canvas.height;
  currentStroke.points.push({ x, y });
  redrawCanvas();
}

function redrawCanvas() {
  fillCanvasBackground();
  ctx.lineCap = 'round';
  for (let stroke of strokes) {
    ctx.lineWidth = stroke.size;
    ctx.strokeStyle = stroke.color;
    ctx.globalCompositeOperation = stroke.type === 'eraser' ? 'destination-out' : 'source-over';
    ctx.beginPath();
    for (let i = 0; i < stroke.points.length; i++) {
      const p = stroke.points[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  if (currentStroke) {
    ctx.lineWidth = currentStroke.size;
    ctx.strokeStyle = currentStroke.color;
    ctx.globalCompositeOperation = currentStroke.type === 'eraser' ? 'destination-out' : 'source-over';
    ctx.beginPath();
    for (let i = 0; i < currentStroke.points.length; i++) {
      const p = currentStroke.points[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }
}

eraserBtn.addEventListener('click', () => {
  erasing = !erasing;
  eraserBtn.textContent = erasing ? 'Drawing Mode' : 'Eraser';
});

undoBtn.addEventListener('click', () => {
  strokes.pop();
  redrawCanvas();
});

clearBtn.addEventListener('click', () => {
  strokes = [];
  redrawCanvas();
});

saveBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  const fileName = fileNameInput.value.trim() || 'my_drawing';
  link.download = fileName + '.png';
  link.href = canvas.toDataURL();
  link.click();
});

darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
  darkModeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
  redrawCanvas();
});

// Mouse events
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', addPointToStroke);

// Touch events (prevent scrolling/zoom)
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startPosition(e); }, { passive: false });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); addPointToStroke(e); }, { passive: false });
canvas.addEventListener('touchend', (e) => { e.preventDefault(); endPosition(); }, { passive: false });

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
