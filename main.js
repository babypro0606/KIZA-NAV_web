// main.js
// ============================================================================
// MAIN APPLICATION ENTRY POINT: CESIUM GLOBE, LAYERS & INPUT HANDLERS
// ============================================================================

import { WMS_BASE_URL, GRID_SIZE, WEST, SOUTH, EAST, NORTH, PERSEVERANCE_WAYPOINTS, INGENUITY_FLIGHTS, MARS_LANDMARKS } from './constants.js';
import {
    initControlPanel, showResolutionWarning, showWaypointPopup, hideWaypointPopup,
    showPinPopup, hidePinPopup, onRecenterMars, onClearRoute, onOpenTutorial
} from './ui.js';
import { initTelemetryModal, openMarsViewer } from './telemetry.js';
import { findOptimalRouteOnGrid, pruneMicroZigZags, chaikinSmooth, computeGlobalMolaAStarRoute } from './pathfinding.js';
import { t } from './i18n.js';
import { initTutorial, advanceTutorialFrom, openTutorial } from './tutorial.js';

// Label text that re-evaluates every frame, so globe labels follow the active language instantly
const i18nText = (key, vars) => new Cesium.CallbackProperty(() => t(key, vars), false);

// 1. Initialize UI components (Command Bar, Fluent Drawer, Telemetry & Tutorial)
initControlPanel();
initTelemetryModal();
initTutorial();

// 2. Initialize the Cesium 3D Viewer with Earth UI widgets disabled
const viewer = new Cesium.Viewer('cesiumContainer', {
    baseLayer: false,
    baseLayerPicker: false,
    geocoder: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    selectionIndicator: false,
    infoBox: false,
    homeButton: false,
    sceneModePicker: false
});

// Configure Martian atmosphere and surface base color
viewer.scene.skyAtmosphere.show = false;
viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#a1532b');

// Enable depth testing against terrain/globe so entities respect surface occlusion
viewer.scene.globe.depthTestAgainstTerrain = true;

// Configure camera controller constraints for smooth orbiting
viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
viewer.scene.screenSpaceCameraController.maximumZoomDistance = 32000000;
viewer.scene.screenSpaceCameraController.minimumZoomDistance = 60;

// 3. Set Initial Camera View: Beautifully centered on Mars looking toward Jezero
viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(77.45, 18.45, 8200000),
    orientation: {
        heading: 0.0,
        pitch: Cesium.Math.toRadians(-90.0), // looking straight at Mars center, perfectly centered
        roll: 0.0
    }
});

/**
 * Smoothly re-centers the Mars globe in the center of the viewport.
 */
export function recenterMars(duration = 2.0) {
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(77.45, 18.45, 8200000),
        orientation: {
            heading: 0.0,
            pitch: Cesium.Math.toRadians(-90.0),
            roll: 0.0
        },
        duration: duration
    });
}

// Bind Command Bar quick actions
onRecenterMars(() => recenterMars(1.8));
onClearRoute(clearActiveRoute);
onOpenTutorial(() => openTutorial());

// 4. Auto-level camera towards Mars center when zooming out to global altitudes
// Prevents Mars from staying pushed into the bottom half of the screen
let isAdjustingCamera = false;
viewer.camera.changed.addEventListener(() => {
    if (isAdjustingCamera) return;
    const carto = viewer.camera.positionCartographic;
    if (!carto) return;
    const height = carto.height;

    // When camera is far from Mars (> 1,800 km), ensure pitch doesn't stay stuck pointing at empty space
    if (height > 1800000) {
        const pitchDeg = Cesium.Math.toDegrees(viewer.camera.pitch);
        if (pitchDeg > -75) {
            const blend = Math.min(1.0, (height - 1800000) / 4500000);
            const targetPitch = -55 - (35 * blend); // smooth blend towards -90 deg
            if (pitchDeg > targetPitch) {
                isAdjustingCamera = true;
                viewer.camera.setView({
                    orientation: {
                        heading: viewer.camera.heading,
                        pitch: Cesium.Math.toRadians(targetPitch),
                        roll: 0.0
                    }
                });
                isAdjustingCamera = false;
            }
        }
    }
});

// 5. Load Base Imagery Layer: USGS Global MOLA Color Map
const usgsMarsImagery = new Cesium.WebMapServiceImageryProvider({
    url: WMS_BASE_URL,
    layers: 'MOLA_color',
    parameters: { transparent: 'false', format: 'image/png' }
});
viewer.scene.imageryLayers.addImageryProvider(usgsMarsImagery);

// 6. Load High-Resolution Overlay: Local Jezero Crater HiRISE XYZ Tiles
const jezeroBounds = Cesium.Rectangle.fromDegrees(WEST, SOUTH, EAST, NORTH);
const tileProvider = new Cesium.UrlTemplateImageryProvider({
    url: './hirise_tiles/{z}/{x}/{y}.png',
    rectangle: jezeroBounds,
    minimumLevel: 8,
    maximumLevel: 16
});

const hiRiseLayer = viewer.scene.imageryLayers.addImageryProvider(tileProvider);
viewer.scene.imageryLayers.raiseToTop(hiRiseLayer);

// Blend grayscale HiRISE hillshade with the underlying color MOLA map
hiRiseLayer.alpha = 0.65;
hiRiseLayer.contrast = 1.65;
hiRiseLayer.brightness = 0.95;
hiRiseLayer.gamma = 0.85;

// 7. Load Local DEM PNG into a 2D Elevation Matrix for A* Pathfinding
let elevationGrid = [];
let isDataReady = false;

function loadElevationMatrix() {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = './jezero_hirise.png';

    img.onload = function() {
        const gridCanvas = document.createElement('canvas');
        gridCanvas.width = GRID_SIZE;
        gridCanvas.height = GRID_SIZE;
        const gridCtx = gridCanvas.getContext('2d');
        gridCtx.drawImage(img, 0, 0, GRID_SIZE, GRID_SIZE);
        const gridData = gridCtx.getImageData(0, 0, GRID_SIZE, GRID_SIZE).data;

        elevationGrid = new Array(GRID_SIZE);
        for (let gy = 0; gy < GRID_SIZE; gy++) {
            elevationGrid[gy] = new Array(GRID_SIZE);
            for (let gx = 0; gx < GRID_SIZE; gx++) {
                const gIdx = (gy * GRID_SIZE + gx) * 4;
                const r = gridData[gIdx], g = gridData[gIdx+1], b = gridData[gIdx+2], a = gridData[gIdx+3];

                // Mark transparent or pure white (NoData) pixels as impassable (-1)
                if (a < 20 || (r > 248 && g > 248 && b > 248)) {
                    elevationGrid[gy][gx] = -1;
                } else {
                    elevationGrid[gy][gx] = r; // Store Red channel (0-255) as height value
                }
            }
        }
        isDataReady = true;
    };
}
loadElevationMatrix();

/**
 * Checks whether a geographic coordinate falls within valid HiRISE elevation data.
 */
function isPointInHiRise(lon, lat) {
    if (lon < WEST || lon > EAST || lat < SOUTH || lat > NORTH) return false;
    if (!isDataReady) return false;
    const gx = Math.floor(((lon - WEST) / (EAST - WEST)) * (GRID_SIZE - 1));
    const gy = Math.floor(((NORTH - lat) / (NORTH - SOUTH)) * (GRID_SIZE - 1));
    return elevationGrid[gy] && elevationGrid[gy][gx] !== -1;
}

// 8. Create 3D Waypoint Entities and Trajectories for Perseverance & Ingenuity
const roverEntities = [], heliEntities = [], roverPositions = [], heliPositions = [];

PERSEVERANCE_WAYPOINTS.forEach((wp) => {
    const pos = Cesium.Cartesian3.fromDegrees(wp.lon, wp.lat, 35);
    roverPositions.push(pos);
    roverEntities.push(viewer.entities.add({
        show: false,
        position: pos,
        point: { pixelSize: 10, color: Cesium.Color.fromCssColorString('#f59e0b'), outlineColor: Cesium.Color.BLACK, outlineWidth: 2 },
        label: {
            text: `SOL ${wp.sol}`, font: "600 11px 'JetBrains Mono', monospace",
            fillColor: Cesium.Color.WHITE, outlineColor: Cesium.Color.BLACK, outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE, pixelOffset: new Cesium.Cartesian2(0, -16),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 75000.0)
        },
        properties: { isStreetViewNode: true, mode: 'rover', wpIndex: wp.id }
    }));
});
roverEntities.push(viewer.entities.add({
    show: false,
    polyline: {
        positions: roverPositions, width: 2,
        material: new Cesium.PolylineDashMaterialProperty({ color: Cesium.Color.fromCssColorString('#f59e0b').withAlpha(0.6), dashLength: 12.0 })
    }
}));

INGENUITY_FLIGHTS.forEach((fl) => {
    const pos = Cesium.Cartesian3.fromDegrees(fl.lon, fl.lat, 60);
    heliPositions.push(pos);
    heliEntities.push(viewer.entities.add({
        show: false,
        position: pos,
        point: { pixelSize: 10, color: Cesium.Color.fromCssColorString('#38bdf8'), outlineColor: Cesium.Color.BLACK, outlineWidth: 2 },
        label: {
            text: i18nText('flightLabel', { n: fl.flight }), font: "600 11px 'JetBrains Mono', monospace",
            fillColor: Cesium.Color.fromCssColorString('#38bdf8'), outlineColor: Cesium.Color.BLACK, outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE, pixelOffset: new Cesium.Cartesian2(0, -16),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 75000.0)
        },
        properties: { isStreetViewNode: true, mode: 'heli', wpIndex: fl.id }
    }));
});
heliEntities.push(viewer.entities.add({
    show: false,
    polyline: {
        positions: heliPositions, width: 2,
        material: new Cesium.PolylineDashMaterialProperty({ color: Cesium.Color.fromCssColorString('#38bdf8').withAlpha(0.6), dashLength: 12.0 })
    }
}));

// Bind Landmark shortcuts inside Drawer
document.querySelectorAll('.kiza-landmark').forEach(btn => {
    btn.addEventListener('click', () => {
        const lm = MARS_LANDMARKS.find(l => l.id === btn.dataset.landmark);
        if (!lm) return;
        showResolutionWarning(false);
        if (lm.isJezero) {
            viewer.camera.flyTo({ destination: jezeroBounds, duration: 2.2 });
            advanceTutorialFrom(1);
            return;
        }
        const isPolar = Math.abs(lm.lat) > 70;
        const target = new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(lm.lon, lm.lat, 0), 1.0);
        viewer.camera.flyToBoundingSphere(target, {
            duration: 2.8,
            offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(isPolar ? -85 : -65), lm.range)
        });
    });
});

document.getElementById('toggleRoverCheck').addEventListener('change', (e) => {
    roverEntities.forEach(ent => ent.show = e.target.checked);
});
document.getElementById('toggleHeliCheck').addEventListener('change', (e) => {
    heliEntities.forEach(ent => ent.show = e.target.checked);
});

// ============================================================================
// 9. WAYPOINT PINS & HORIZON OCCLUSION
// ============================================================================
const pinCanvasCache = {};
function getWaypointPinImage(letter, colorHex) {
    const cacheKey = `${letter}_${colorHex}`;
    if (pinCanvasCache[cacheKey]) return pinCanvasCache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 84;
    const ctx = canvas.getContext('2d');

    // Subtle drop shadow at ground contact
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(32, 78, 14, 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();
    ctx.restore();

    // Teardrop pin body
    ctx.beginPath();
    ctx.arc(32, 30, 24, Math.PI * 0.85, Math.PI * 0.15, false);
    ctx.lineTo(32, 76);
    ctx.closePath();

    // Gradient fill
    const grad = ctx.createLinearGradient(16, 6, 48, 76);
    grad.addColorStop(0, colorHex);
    grad.addColorStop(1, letter === 'A' ? '#047857' : '#991b1b');
    ctx.fillStyle = grad;
    ctx.fill();

    // White outline for contrast against terrain
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.stroke();

    // Inner badge
    ctx.beginPath();
    ctx.arc(32, 30, 13, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Letter A or B
    ctx.font = "700 16px 'JetBrains Mono', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = letter === 'A' ? '#065f46' : '#991b1b';
    ctx.fillText(letter, 32, 31);

    const dataUrl = canvas.toDataURL();
    pinCanvasCache[cacheKey] = dataUrl;
    return dataUrl;
}

function spawnPinEntity(letter, pt) {
    const isA = (letter === 'A');
    const colorHex = isA ? '#10b981' : '#ef4444';
    const alt = pt.inHiRise ? 18 : 55;
    const pos = Cesium.Cartesian3.fromDegrees(pt.lon, pt.lat, alt);

    return viewer.entities.add({
        position: pos,
        billboard: {
            image: getWaypointPinImage(letter, colorHex),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            scale: 0.65,
            disableDepthTestDistance: Number.POSITIVE_INFINITY // Never clip or slice billboard on visible side of planet
        },
        label: {
            text: i18nText(isA ? 'startPin' : 'finishPin'),
            font: "700 11px 'JetBrains Mono', monospace",
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -58),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        point: {
            pixelSize: 8,
            color: Cesium.Color.fromCssColorString(colorHex),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        properties: {
            isWaypointPin: true,
            pinType: letter,
            lon: pt.lon,
            lat: pt.lat
        }
    });
}

// ============================================================================
// 10. SCREEN INTERACTIONS & CURSOR CONTEXT POPUP ROUTING
// ============================================================================
let pressTimer = null, downPosition = null;
let pointA = null, pointB = null;
let pinEntityA = null, pinEntityB = null;
let routeLineEntity = null;

// Horizon occlusion: automatically hide pins when rotated to the occluded back side of Mars
viewer.scene.preRender.addEventListener(() => {
    if (!pointA && !pointB) return;
    const occluder = new Cesium.EllipsoidalOccluder(viewer.scene.globe.ellipsoid, viewer.camera.positionWC);
    if (pinEntityA && pointA) {
        const posA = Cesium.Cartesian3.fromDegrees(pointA.lon, pointA.lat, pointA.inHiRise ? 18 : 55);
        const visibleA = occluder.isPointVisible(posA);
        if (pinEntityA.show !== visibleA) {
            pinEntityA.show = visibleA;
            if (!visibleA) hidePinPopup();
        }
    }
    if (pinEntityB && pointB) {
        const posB = Cesium.Cartesian3.fromDegrees(pointB.lon, pointB.lat, pointB.inHiRise ? 18 : 55);
        const visibleB = occluder.isPointVisible(posB);
        if (pinEntityB.show !== visibleB) {
            pinEntityB.show = visibleB;
            if (!visibleB) hidePinPopup();
        }
    }
});

export function clearActiveRoute() {
    if (pinEntityA) { viewer.entities.remove(pinEntityA); pinEntityA = null; }
    if (pinEntityB) { viewer.entities.remove(pinEntityB); pinEntityB = null; }
    if (routeLineEntity) { viewer.entities.remove(routeLineEntity); routeLineEntity = null; }
    pointA = null;
    pointB = null;
    hideWaypointPopup();
    hidePinPopup();
    showResolutionWarning(false);
}

/**
 * Deletes an individual waypoint pin (A or B) and clears the route line if active.
 */
export function deleteWaypointPin(type) {
    if (type === 'A') {
        if (pinEntityA) {
            viewer.entities.remove(pinEntityA);
            pinEntityA = null;
        }
        pointA = null;
    } else if (type === 'B') {
        if (pinEntityB) {
            viewer.entities.remove(pinEntityB);
            pinEntityB = null;
        }
        pointB = null;
    }

    // A route requires both start (A) and finish (B); remove line if either is deleted
    if (routeLineEntity) {
        viewer.entities.remove(routeLineEntity);
        routeLineEntity = null;
    }

    const remaining = pointA || pointB;
    if (!remaining || remaining.inHiRise) {
        showResolutionWarning(false);
    }

    hidePinPopup();
}

const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

// Single Left Click: Open pin action popup or Telemetry Image Viewer
handler.setInputAction(function(click) {
    const picked = viewer.scene.pick(click.position);
    if (Cesium.defined(picked) && picked.id && picked.id.properties) {
        // 1. Check if a visible waypoint pin (Pin A or Pin B) was left clicked
        if (picked.id.properties.isWaypointPin && picked.id.properties.isWaypointPin.getValue()) {
            const pinType = picked.id.properties.pinType.getValue();
            const pt = (pinType === 'A') ? pointA : pointB;
            const ent = (pinType === 'A') ? pinEntityA : pinEntityB;
            // Only allow interaction if the pin is currently visible (not occluded behind Mars)
            if (pt && ent && ent.show !== false) {
                showPinPopup(click.position, { type: pinType, lon: pt.lon, lat: pt.lat }, () => {
                    deleteWaypointPin(pinType);
                });
            }
            return;
        }

        // 2. Check if a telemetry node (Rover / Helicopter stop) was clicked
        if (picked.id.properties.isStreetViewNode && picked.id.properties.isStreetViewNode.getValue()) {
            openMarsViewer(picked.id.properties.mode.getValue(), picked.id.properties.wpIndex.getValue());
            return;
        }
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

// Left Mouse Down: Start 800ms timer for long-press waypoint context popup
handler.setInputAction(function(movement) {
    downPosition = Cesium.Cartesian2.clone(movement.position);
    if (pressTimer) clearTimeout(pressTimer);

    // If pressing down directly on an existing waypoint pin, don't trigger the long-press terrain context menu
    const picked = viewer.scene.pick(movement.position);
    if (Cesium.defined(picked) && picked.id && picked.id.properties && picked.id.properties.isWaypointPin && picked.id.properties.isWaypointPin.getValue()) {
        return;
    }

    pressTimer = setTimeout(() => handleLongPress(downPosition), 800);
}, Cesium.ScreenSpaceEventType.LEFT_DOWN);

// Mouse Move: Cancel long-press timer if user drags/pans the globe
handler.setInputAction(function(movement) {
    if (!downPosition || !pressTimer) return;
    if (Cesium.Cartesian2.distance(downPosition, movement.endPosition) > 8) {
        clearTimeout(pressTimer);
        pressTimer = null;
    }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

// Left Mouse Up: Cancel long-press timer if released early
handler.setInputAction(function() {
    if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
    }
}, Cesium.ScreenSpaceEventType.LEFT_UP);

/**
 * Handles long press: opens cursor popup to select Start (A) or Finish (B).
 */
function handleLongPress(screenPos) {
    const cartesian = viewer.camera.pickEllipsoid(screenPos, viewer.scene.globe.ellipsoid);
    if (!cartesian) return;

    const carto = Cesium.Cartographic.fromCartesian(cartesian);
    const lon = Cesium.Math.toDegrees(carto.longitude);
    const lat = Cesium.Math.toDegrees(carto.latitude);
    const inHiRise = isPointInHiRise(lon, lat);

    showWaypointPopup(
        screenPos,
        { lon, lat, inHiRise },
        () => setWaypoint('A', { lon, lat, inHiRise }),
        () => setWaypoint('B', { lon, lat, inHiRise })
    );
}

/**
 * Sets Point A or Point B and triggers route computation when both are active.
 */
function setWaypoint(type, info) {
    const gx = info.inHiRise ? Math.floor(((info.lon - WEST) / (EAST - WEST)) * (GRID_SIZE - 1)) : -1;
    const gy = info.inHiRise ? Math.floor(((NORTH - info.lat) / (NORTH - SOUTH)) * (GRID_SIZE - 1)) : -1;
    const pt = { x: gx, y: gy, lon: info.lon, lat: info.lat, inHiRise: info.inHiRise };

    if (type === 'A') {
        pointA = pt;
        if (pinEntityA) viewer.entities.remove(pinEntityA);
        pinEntityA = spawnPinEntity('A', pt);
    } else {
        pointB = pt;
        if (pinEntityB) viewer.entities.remove(pinEntityB);
        pinEntityB = spawnPinEntity('B', pt);
    }

    if (pointA && pointB) {
        updateRoute();
    }
}

/**
 * Calculates and renders the pathfinding route (with optional closed loop back to A).
 */
async function updateRoute() {
    if (!pointA || !pointB) return;

    if (routeLineEntity) {
        viewer.entities.remove(routeLineEntity);
        routeLineEntity = null;
    }

    // Case 1: Both points inside high-res Jezero HiRISE DEM
    if (pointA.inHiRise && pointB.inHiRise) {
        showResolutionWarning(false);
        const rawPath = findOptimalRouteOnGrid(elevationGrid, GRID_SIZE, pointA, pointB, 3.8);
        if (rawPath.length > 0) {
            const detailedPath = pruneMicroZigZags(rawPath, elevationGrid, 3, 1.2);
            const crispSmoothPath = chaikinSmooth(detailedPath, 1);
            const positions = crispSmoothPath.map(p => {
                const pLon = WEST + (p.x / (GRID_SIZE - 1)) * (EAST - WEST);
                const pLat = NORTH - (p.y / (GRID_SIZE - 1)) * (NORTH - SOUTH);
                return Cesium.Cartesian3.fromDegrees(pLon, pLat, 30);
            });

            routeLineEntity = viewer.entities.add({
                polyline: {
                    positions: positions,
                    width: 4,
                    material: new Cesium.PolylineGlowMaterialProperty({ glowPower: 0.22, color: Cesium.Color.CYAN })
                }
            });
        }
    } else {
        // Case 2: At least one point outside HiRISE; compute on global MOLA data
        showResolutionWarning(true);
        const molaPositions = await computeGlobalMolaAStarRoute(pointA, pointB);

        routeLineEntity = viewer.entities.add({
            polyline: {
                positions: molaPositions,
                width: 4,
                material: new Cesium.PolylineDashMaterialProperty({ color: Cesium.Color.fromCssColorString('#f97316'), dashLength: 14.0 })
            }
        });
    }

    if (routeLineEntity) {
        advanceTutorialFrom(2);
    }
}
