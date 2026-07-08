// DOM Elements & Canvas Context
const canvas = document.getElementById('drawingBoard');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('statusText');

// Initialize canvas resolution
canvas.width = 800;
canvas.height = 500;

// Application State
let points = []; // Stores coordinate points of the polygon
let isDrawingMode = true; // Tracks current interaction mode
const SNAP_DISTANCE = 20; // Proximity radius in pixels to auto-close the shape

// Event Listener: Handle canvas clicks
canvas.addEventListener('mousedown', (e) => {
    // Disable drawing when testing mode is active
    if (!isDrawingMode) {
        console.log("Testing Mode active. Drawing disabled.");
        return;
    }

    // Calculate relative mouse coordinates
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Auto-snap logic to close the polygon
    // Require at least 3 points to form a closed shape
    if (points.length > 2) { 
        const firstPoint = points[0];
        
        // Calculate Euclidean distance between current click and the starting point
        const distance = Math.sqrt(Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2));

        if (distance < SNAP_DISTANCE) {
            // Trigger shape closure
            isDrawingMode = false; 
            statusText.innerHTML = "Mode: 🔴 Testing Phase (Click to check inside/outside)";
            drawPolygon(); // Render final closed shape
            return; // Exit to prevent adding the closing click to the points array
        }
    }

    // Append new coordinate if snap distance is not met
    points.push({ x: x, y: y });
    drawPolygon(); // Update UI
});

// Core render function
function drawPolygon() {
    // Clear canvas for the new frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (points.length === 0) return;

    // A. Render Lines
    ctx.beginPath();
    points.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(point.x, point.y); // Move to the starting point
        } else {
            ctx.lineTo(point.x, point.y); // Draw line to subsequent points
        }
    });

    // Fill the polygon if the shape is closed
    if (!isDrawingMode) {
        ctx.closePath();
        ctx.fillStyle = "rgba(0, 150, 255, 0.2)"; // Semi-transparent blue fill
        ctx.fill();
    }

    ctx.strokeStyle = "blue"; // Stroke color
    ctx.lineWidth = 2; // Stroke width
    ctx.stroke(); // Apply stroke

    // B. Render Points (Vertices)
    points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2); // Draw a 5px radius circle
        
        // Highlight the starting point in red during drawing mode to indicate the snap target
        if (index === 0 && isDrawingMode) {
            ctx.fillStyle = "red";
        } else {
            ctx.fillStyle = "black";
        }
        
        ctx.fill();
    });
}