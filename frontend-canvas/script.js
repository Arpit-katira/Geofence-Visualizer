const canvas = document.getElementById('drawingBoard');
const ctx = canvas.getContext('2d');
const warningText = document.getElementById('warningText');
const resetBtn = document.getElementById('resetBtn');
const drawToggle = document.getElementById('drawToggle');
const testToggle = document.getElementById('testToggle');

// Dynamic Canvas Resolution
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}
resizeCanvas(); // Initialize on load
window.addEventListener('resize', () => {
    resizeCanvas();
    drawCanvas(); // Screen resize hone par drawing wapas banao
});

let points = []; 
let testPoints = []; 
let isDrawingMode = true; 
const SNAP_DISTANCE = 20; 

// --- TOGGLE LOGIC ---
function setMode(mode) {
    if (mode === 'DRAW') {
        isDrawingMode = true;
        drawToggle.checked = true;
        testToggle.checked = false;
        testPoints = []; 
        drawCanvas();
    } else if (mode === 'TEST') {
        isDrawingMode = false;
        drawToggle.checked = false;
        testToggle.checked = true;
    }
}

drawToggle.addEventListener('change', (e) => {
    if (e.target.checked) setMode('DRAW');
    else e.target.checked = true; 
});

testToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        if (points.length > 2) {
            if (isValidPolygon(points)) {
                setMode('TEST');
                drawCanvas();
            } else {
                e.target.checked = false;
                showWarning();
            }
        } else {
            e.target.checked = false; 
        }
    } else {
        e.target.checked = true; 
    }
});

// --- RESET BUTTON ---
resetBtn.addEventListener('click', () => {
    points = [];
    testPoints = [];
    warningText.classList.add('hidden');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setMode('DRAW'); 
});

function showWarning() {
    warningText.classList.remove('hidden');
    setTimeout(() => {
        warningText.classList.add('hidden');
    }, 3000);
}

// --- MOUSE CLICK LOGIC ---
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!isDrawingMode) {
        if(points.length > 0) {
            const inside = isPointInside(x, y, points);
            testPoints.push({ x: x, y: y, isInside: inside });
            drawCanvas(); 
        }
        return;
    }

    if (points.length > 2) { 
        const firstPoint = points[0];
        const distance = Math.sqrt(Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2));

        if (distance < SNAP_DISTANCE) {
            if (!isValidPolygon(points)) {
                showWarning();
                return; 
            }
            setMode('TEST');
            drawCanvas(); 
            return; 
        }
    }

    points.push({ x: x, y: y });
    drawCanvas();
});

// --- RAY CASTING ---
function isPointInside(x, y, polygon) {
    let isInside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        let xi = polygon[i].x, yi = polygon[i].y;
        let xj = polygon[j].x, yj = polygon[j].y;
        let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) isInside = !isInside;
    }
    return isInside;
}

// --- VALIDATION ---
function isValidPolygon(poly) {
    if (poly.length < 3) return true;
    for (let i = 0; i < poly.length; i++) {
        let p1 = poly[i];
        let q1 = poly[(i + 1) % poly.length];
        for (let j = i + 1; j < poly.length; j++) {
            let p2 = poly[j];
            let q2 = poly[(j + 1) % poly.length];
            if (i === j || (i === 0 && j === poly.length - 1) || j === i + 1) continue;
            if (doIntersect(p1, q1, p2, q2)) return false;
        }
    }
    return true;
}

function onSegment(p, q, r) {
    return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
           q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
}

function orientation(p, q, r) {
    let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val == 0) return 0;  
    return (val > 0) ? 1 : 2; 
}

function doIntersect(p1, q1, p2, q2) {
    let o1 = orientation(p1, q1, p2);
    let o2 = orientation(p1, q1, q2);
    let o3 = orientation(p2, q2, p1);
    let o4 = orientation(p2, q2, q1);
    if (o1 != o2 && o3 != o4) return true;
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;
    return false;
}

// --- DRAWING ---
function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (points.length === 0) return;

    ctx.beginPath();
    points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
    });

    if (!isDrawingMode) {
        ctx.closePath();
        ctx.fillStyle = "rgba(66, 133, 244, 0.15)"; 
        ctx.fill();
    }

    ctx.strokeStyle = "#4285f4"; 
    ctx.lineWidth = 2;
    ctx.stroke();

    points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = (index === 0 && isDrawingMode) ? "#ea4335" : "#202124"; 
        ctx.fill();
    });

    testPoints.forEach((tp) => {
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = tp.isInside ? "#34a853" : "#ea4335"; 
        ctx.fill();
    });
}