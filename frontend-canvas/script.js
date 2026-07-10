const canvas = document.getElementById('drawingBoard');
const ctx = canvas.getContext('2d');
const warningText = document.getElementById('warningText');
const resetBtn = document.getElementById('resetBtn');
const drawToggle = document.getElementById('drawToggle');
const testToggle = document.getElementById('testToggle');

// --- 1. Map Initialization (Leaflet.js Configuration) ---
const map = L.map('map', {
    zoomControl: false 
}).setView([29.9695, 76.8227], 14); // Default coordinate: Kurukshetra

// Load geographic tile layer from OpenStreetMap asset repository
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Anchor viewport zoom navigation controls to bottom-right region
L.control.zoom({ position: 'bottomright' }).addTo(map);

// --- 2. Graphic Canvas Layer & Viewport Orchestration ---
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}
resizeCanvas();

// Synchronize canvas rendering cycle with map viewport translation and scale transformations
map.on('move moveend zoomend', () => {
    drawCanvas();
});

let geoPoints = []; // Master array storing persistent geofence boundary nodes (LatLng configuration)
let geoTestPoints = []; // Collection array tracking audited test points with containment vectors
let isDrawingMode = true; // Operational runtime state flag
const SNAP_DISTANCE = 20; // Proximity threshold in pixels for automated boundary closure

// --- 3. Operational Mode State Controller ---
function setMode(mode) {
    if (mode === 'DRAW') {
        isDrawingMode = true;
        drawToggle.checked = true;
        testToggle.checked = false;
        geoTestPoints = []; 
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
        // Project geographical coordinates to active screen space pixels for structural verification
        const currentPixels = geoPoints.map(gp => map.latLngToContainerPoint([gp.lat, gp.lng]));
        if (currentPixels.length > 2) {
            if (isValidPolygon(currentPixels)) {
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

// --- 4. Interface Controls & UI Mutators ---
resetBtn.addEventListener('click', () => {
    geoPoints = [];
    geoTestPoints = [];
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

// --- 5. Asynchronous Event Pipeline (Map Click Routing) ---
map.on('click', (e) => {
    // Extract geographic coordinate matrix and layout-relative screen vector space
    const latLng = e.latlng;
    const x = e.containerPoint.x;
    const y = e.containerPoint.y;

    if (!isDrawingMode) {
        if(geoPoints.length > 0) {
            const currentPixels = geoPoints.map(gp => map.latLngToContainerPoint([gp.lat, gp.lng]));
            const inside = isPointInside(x, y, currentPixels);
            
            geoTestPoints.push({ lat: latLng.lat, lng: latLng.lng, isInside: inside });
            drawCanvas(); 
        }
        return;
    }

    if (geoPoints.length > 2) { 
        const firstPixel = map.latLngToContainerPoint([geoPoints[0].lat, geoPoints[0].lng]);
        const distance = Math.sqrt(Math.pow(x - firstPixel.x, 2) + Math.pow(y - firstPixel.y, 2));

        if (distance < SNAP_DISTANCE) {
            const currentPixels = geoPoints.map(gp => map.latLngToContainerPoint([gp.lat, gp.lng]));
            if (!isValidPolygon(currentPixels)) {
                showWarning();
                return; 
            }
            setMode('TEST');
            drawCanvas(); 
            return; 
        }
    }

    geoPoints.push({ lat: latLng.lat, lng: latLng.lng });
    drawCanvas();
});

// --- 6. Computational Geometry & Spatial Topology Core ---

/**
 * Executes a Ray-Casting algorithm to evaluate point containment inside a non-convex polygon.
 */
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

/**
 * Validates spatial structure integrity by confirming zero self-intersections within the path matrix.
 */
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

// --- 7. Vector Graphics Rendering Pipeline ---
function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (geoPoints.length === 0) return;

    // Transform static LatLng coordinate array into real-time screen coordinates relative to the dynamic viewport status
    const pixels = geoPoints.map(gp => map.latLngToContainerPoint([gp.lat, gp.lng]));

    // Segment Vector Pipeline
    ctx.beginPath();
    pixels.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
    });

    if (!isDrawingMode) {
        ctx.closePath();
        ctx.fillStyle = "rgba(66, 133, 244, 0.2)"; 
        ctx.fill();
    }

    ctx.strokeStyle = "#4285f4"; 
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Node Anchor Pipeline
    pixels.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = (index === 0 && isDrawingMode) ? "#ea4335" : "#202124"; 
        ctx.fill();
    });

    // Containment Audit Interface Nodes
    geoTestPoints.forEach((gtp) => {
        const pt = map.latLngToContainerPoint([gtp.lat, gtp.lng]);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = gtp.isInside ? "#34a853" : "#ea4335"; 
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.stroke();
    });
}