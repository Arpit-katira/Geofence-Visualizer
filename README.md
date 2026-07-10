# Geofence Visualizer 🗺️

**Live Demo:** [Click here to view the live project](https://geofence-visualizer.vercel.app)

<img width="2940" height="1696" alt="image" src="https://github.com/user-attachments/assets/c7563602-e75c-4d46-b29f-9eecf39162ac" />


## 📌 Overview
Geofence Visualizer is an interactive web-based tool that allows users to draw custom geographical boundaries (polygons) on a real-world map and test if specific GPS coordinates fall inside or outside those boundaries. 

This project demonstrates the practical application of computational geometry in modern mapping solutions, similar to how food delivery (Zomato/Swiggy) and ride-sharing apps (Uber) manage their operational zones.

## ✨ Key Features
* **Interactive Mapping:** Built on top of Leaflet.js for smooth, real-world map navigation.
* **Dynamic Geofencing:** Click to draw precise service zones using real GPS coordinates (Latitude/Longitude).
* **Mathematical Validation:** Implements the **Even-Odd Rule (Ray Casting Algorithm)** to accurately detect Point-in-Polygon (PIP) states.
* **Smart Auto-Snap & Validation:** Automatically closes the polygon and detects invalid (self-intersecting/complex) shapes to maintain data integrity.
* **Responsive UI:** Modern, clean, and intuitive interface with seamless mode toggling.

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3 
* **Core Logic:** Vanilla JavaScript (ES6+)
* **Map Engine:** Leaflet.js & OpenStreetMap Tiles
* **Deployment:** Vercel (CI/CD Pipeline)

## 🧠 Core Algorithm (Ray Casting)
The application's testing logic relies on the Ray Casting Algorithm. When a user tests a point on the map, a virtual ray is cast horizontally from that coordinate to infinity. 
* If the ray crosses the polygon boundary an **odd** number of times, the system classifies the point as **Inside** (Green).
* If it crosses an **even** number of times, the point is classified as **Outside** (Red).

## 🚀 How to Run Locally
1. Clone the repository: `git clone https://github.com/Arpit-katira/Geofence-Visualizer.git`
2. Navigate to the project directory: `cd Geofence-Visualizer/frontend-canvas`
3. Simply open `index.html` in any modern web browser. No local server required!
