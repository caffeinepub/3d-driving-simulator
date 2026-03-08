# 3D Driving Simulator

## Current State
New project. No existing backend or frontend code.

## Requested Changes (Diff)

### Add
- Full-screen 3D city environment rendered with Three.js + React Three Fiber
- Driveable 3D car model controlled via WASD / arrow keys
- Top-down overhead camera view and third-person follow camera (toggle with key or button)
- City environment: road grid with lane markings, buildings (varied heights/sizes), trees, sidewalks, street elements
- Mini-map HUD in corner showing bird's-eye view of city with car position indicator
- Speedometer HUD showing current speed
- Directional/ambient lighting with shadows
- Smooth car physics: acceleration, deceleration, steering, friction
- Camera toggle button in UI

### Modify
N/A — new project.

### Remove
N/A — new project.

## Implementation Plan
1. Backend: minimal Motoko actor (no persistent state needed; app is purely frontend-driven)
2. Frontend:
   - React Three Fiber canvas as full-screen scene
   - CityMap component: procedural road grid, buildings (BoxGeometry), trees (cylinder+cone), road markings (plane stripes)
   - Car component: simple 3D box-based car model with wheels
   - CarController hook: keyboard input -> velocity/steering state, physics update loop
   - CameraController: two modes — ThirdPerson (follows car from behind/above) and TopDown (fixed overhead)
   - MiniMap: off-screen render or 2D canvas overlay drawing road layout + car dot
   - SpeedometerHUD: HTML overlay showing speed in km/h with needle gauge
   - CameraToggle button: switches between views
   - Lighting: directional sunlight with shadow maps, ambient fill
