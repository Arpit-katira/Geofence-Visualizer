// HTML se canvas element uthao
const canvas = document.getElementById('drawingBoard');

// '2d' context ka matlab hai hum 2D drawing karenge (lines, circles, etc.)
const ctx = canvas.getContext('2d');

// Canvas ka resolution/size set kar rahe hain
canvas.width = 800;
canvas.height = 500;

// Test karne ke liye ek text draw kar rahe hain
ctx.fillStyle = "gray";
ctx.font = "20px Arial";
ctx.fillText("Canvas is ready for drawing!", 20, 40);