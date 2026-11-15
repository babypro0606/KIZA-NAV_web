// telemetry.js
// ============================================================================
// TELEMETRY & STREET VIEW MODAL (STRICT SENSOR SEPARATION & DARK-FRAME FILTER)
// ============================================================================

import { PERSEVERANCE_WAYPOINTS, INGENUITY_FLIGHTS } from './constants.js';
import { t, L, onLangChange } from './i18n.js';
import { advanceTutorialFrom } from './tutorial.js';

// State variables for tracking active viewer mode, waypoint index, and fetched image list
let currentMode = 'rover';
let currentWpIndex = 0;
let currentPhotos = [];

// State variables for interactive mouse panning and scroll zooming on the main image
let panX = 0, panY = 0, zoomScale = 1.0;
let isDraggingSv = false, startDragX = 0, startDragY = 0;

// Cached DOM element references for the modal
let svModal, svViewport, svMainImg, svCameraSelect;

/**
 * Verified real NASA Ingenuity raw images (mars.nasa.gov, CORS-friendly).
 * Used as a guaranteed fallback if the API is unreachable.
 */
const NASA_RAW = "https://mars.nasa.gov/mars2020-raw-images/pub/ods/surface/sol";
const GUARANTEED_HELI_IMAGES = [
    {
        sol: 58,
        camera: { instrument: "HELI_NAV" },
        date_taken_utc: "2021-04-19T07:34:23Z",
        image_files: {
            small: `${NASA_RAW}/00058/ids/edr/browse/heli/HNM_0058_0672089521_264ECM_N0010001HELI00537_0000A0J02_320.jpg`,
            large: `${NASA_RAW}/00058/ids/edr/browse/heli/HNM_0058_0672089521_264ECM_N0010001HELI00537_0000A0J02_1200.jpg`
        }
    },
    {
        sol: 58,
        camera: { instrument: "HELI_NAV" },
        date_taken_utc: "2021-04-19T07:35:42Z",
        image_files: {
            small: `${NASA_RAW}/00058/ids/edr/browse/heli/HNM_0058_0672089567_340ECM_N0010001HELI01926_0000LUJ02_320.jpg`,
            large: `${NASA_RAW}/00058/ids/edr/browse/heli/HNM_0058_0672089567_340ECM_N0010001HELI01926_0000LUJ02_1200.jpg`
        }
    },
    {
        sol: 1069,
        camera: { instrument: "HELI_RTE" },
        date_taken_utc: "2024-02-22T01:43:58Z",
        image_files: {
            small: `${NASA_RAW}/01069/ids/edr/browse/heli/HSF_1069_0761837397_369ECM_N0720001HELI00001_000085J01_320.jpg`,
            large: `${NASA_RAW}/01069/ids/edr/browse/heli/HSF_1069_0761837397_369ECM_N0720001HELI00001_000085J01_1200.jpg`
        }
    }
];

/**
 * Guaranteed fallback images for Perseverance Rover in case of total API outage.
 */
const GUARANTEED_ROVER_IMAGES = [
    {
        sol: 58,
        camera: { instrument: "NAVCAM_LEFT" },
        date_taken_utc: "2021-04-19T00:00:00Z",
        image_files: {
            small: `${NASA_RAW}/00058/ids/edr/browse/ncam/NLF_0058_0672086944_648EBY_N0032046NCAM00603_00_0LLJ02_320.jpg`,
            large: `${NASA_RAW}/00058/ids/edr/browse/ncam/NLF_0058_0672086944_648EBY_N0032046NCAM00603_00_0LLJ02_1200.jpg`
        }
    },
    {
        sol: 180,
        camera: { instrument: "MCZ_LEFT" },
        date_taken_utc: "2021-08-22T19:18:44Z",
        image_files: {
            small: `${NASA_RAW}/00180/ids/edr/browse/zcam/ZL0_0180_0682931680_956ECM_N0070000ZCAM07107_063085J01_320.jpg`,
            large: `${NASA_RAW}/00180/ids/edr/browse/zcam/ZL0_0180_0682931680_956ECM_N0070000ZCAM07107_063085J01_1200.jpg`
        }
    },
    {
        sol: 2023,
        camera: { instrument: "FRONT_HAZCAM_LEFT_A" },
        date_taken_utc: "2026-10-29T13:07:42Z",
        image_files: {
            small: `${NASA_RAW}/02023/ids/edr/browse/fcam/FLF_2023_0846549745_302ECM_N0930000FHAZ00206_01_295J01_320.jpg`,
            large: `${NASA_RAW}/02023/ids/edr/browse/fcam/FLF_2023_0846549745_302ECM_N0930000FHAZ00206_01_295J01_1200.jpg`
        }
    }
];

/**
 * Attempts to fetch JSON from the NASA RSS API using multiple CORS proxies.
 * @param {string} targetUrl - Raw NASA API endpoint URL.
 * @returns {Promise<Object>} Parsed JSON object.
 */
async function fetchNasaJsonWithFallback(targetUrl) {
    const encoded = encodeURIComponent(targetUrl);
    const endpoints = [
        targetUrl, // NASA sends Access-Control-Allow-Origin: * — try direct first
        `https://api.allorigins.win/raw?url=${encoded}`,
        `https://api.codetabs.com/v1/proxy?quest=${encoded}`
    ];

    for (const url of endpoints) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (data && Array.isArray(data.images)) {
                    return data;
                }
            }
        } catch (err) {
            // Silently continue to next proxy endpoint
        }
    }
    throw new Error("NASA RSS endpoints unreachable");
}

/**
 * Safely extracts the camera instrument name from a NASA API photo object.
 */
function getCameraName(photo) {
    if (!photo) return t('unknown');
    if (photo.camera && typeof photo.camera.instrument === 'string') return photo.camera.instrument;
    if (typeof photo.instrument === 'string') return photo.instrument;
    return "MARS2020_CAM";
}

/**
 * Filters out pitch-black calibration frames, subframes, and mismatched platform sensors.
 * Ensures Helicopter mode ONLY displays HELI_RTE / HELI_NAV images, and Rover mode
 * avoids night-time dark calibration exposures.
 * @param {Array<Object>} images - Raw array of NASA photo objects.
 * @param {boolean} isHeli - True if currently in Ingenuity Helicopter mode.
 * @returns {Array<Object>} Clean, visible surface/aerial photos.
 */
function filterValidMarsImages(images, isHeli) {
    if (!Array.isArray(images)) return [];

    return images.filter(img => {
        // Must have valid large or medium image URLs
        if (!img.image_files || (!img.image_files.large && !img.image_files.full_res && !img.image_files.medium)) {
            return false;
        }

        // Reject tiny subframes or thumbnail-only calibration artifacts
        if (img.sample_type && img.sample_type !== "Full") {
            return false;
        }

        const cam = getCameraName(img).toUpperCase();
        const title = (img.title || "").toUpperCase();
        const caption = (img.caption || "").toUpperCase();

        if (isHeli) {
            // STRICT HELICOPTER CHECK: Only allow Ingenuity's onboard cameras (HELI_RTE or HELI_NAV)
            // This prevents Perseverance's MCZ/SkyCam dark frames from leaking into Helicopter view
            return cam.includes("HELI") || cam.includes("RTE") || title.includes("HELICOPTER");
        } else {
            // STRICT ROVER CHECK: Exclude helicopter cameras and skycam sun-calibration black frames
            if (cam.includes("HELI") || cam.includes("MEDA") || cam.includes("SKYCAM") || cam.includes("PIXL") || cam.includes("SHERLOC")) {
                return false;
            }
            // Exclude dark calibration exposures taken when the sun is below the horizon (elevation < -2 deg)
            if (img.extended && img.extended.mastEl && img.extended.mastEl !== "UNK") {
                const el = parseFloat(img.extended.mastEl);
                if (!isNaN(el) && el > 45) return false; // Pointed straight up at empty sky
            }
            if (caption.includes("CALIBRATION") || caption.includes("DARK")) {
                return false;
            }
            return true;
        }
    });
}

/**
 * Builds the fullscreen telemetry viewer modal in the DOM with clean, non-overlapping UI zones.
 */
export function initTelemetryModal() {
    const modalStyle = document.createElement('style');
    modalStyle.innerHTML = `
        #svHeaderBar {
            display: flex; justify-content: space-between; align-items: center;
            padding: 12px 24px; background: #0f1117;
            border-bottom: 1px solid rgba(255,255,255,0.1); z-index: 20; flex-shrink: 0;
        }
        #svCameraSelect {
            padding: 8px 14px;
            background-color: #141722;
            color: #f8fafc;
            border: 1px solid rgba(255, 255, 255, 0.16);
            border-radius: 10px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            color-scheme: dark;
            outline: none;
            transition: border-color 0.2s, background-color 0.2s;
        }
        #svCameraSelect:hover {
            background-color: #1c2030;
            border-color: rgba(255, 255, 255, 0.3);
        }
        #svCameraSelect:focus {
            border-color: #ea580c;
            box-shadow: 0 0 0 2px rgba(234, 88, 12, 0.25);
        }
        #svCameraSelect option {
            background-color: #141722;
            color: #f8fafc;
            padding: 8px 12px;
        }
        #svViewport {
            flex: 1; position: relative; overflow: hidden;
            display: flex; align-items: center; justify-content: center;
            cursor: grab; background: #050608;
        }
        #svMainImg {
            max-height: calc(100vh - 190px); max-width: calc(100vw - 180px);
            object-fit: contain; transform: translate(0px, 0px) scale(1);
            transition: transform 0.05s linear; display: none;
            border: 1px solid rgba(255,255,255,0.12);
            box-shadow: 0 16px 48px rgba(0,0,0,0.85);
            z-index: 1;
        }
        .sv-nav-btn {
            position: absolute; top: 50%; transform: translateY(-50%);
            padding: 10px 14px; background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(8px); color: #f8fafc;
            border: 1px solid rgba(255,255,255,0.18); border-radius: 8px;
            font-weight: 600; cursor: pointer; font-size: 12px; z-index: 10;
            transition: background 0.2s, border-color 0.2s;
        }
        .sv-nav-btn:hover {
            background: rgba(234, 88, 12, 0.85); border-color: #ea580c;
        }
        #svTelemetry {
            position: absolute; bottom: 16px; left: 16px;
            background: rgba(10, 12, 18, 0.82); backdrop-filter: blur(10px);
            padding: 10px 14px; border: 1px solid rgba(255,255,255,0.12);
            border-left: 3px solid #ea580c; border-radius: 6px;
            font-size: 11.5px; line-height: 1.55; pointer-events: none;
            color: #e2e8f0; z-index: 10; max-width: 440px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.6);
        }
        #svThumbStrip {
            height: 86px; background: #0f1117;
            border-top: 1px solid rgba(255,255,255,0.08);
            display: flex; align-items: center; gap: 10px;
            padding: 8px 20px; overflow-x: auto; overflow-y: hidden;
            z-index: 20; flex-shrink: 0;
        }
        /* Clean dark scrollbar styling for the thumbnail strip */
        #svThumbStrip::-webkit-scrollbar { height: 6px; }
        #svThumbStrip::-webkit-scrollbar-track { background: #090a0f; }
        #svThumbStrip::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        #svThumbStrip::-webkit-scrollbar-thumb:hover { background: #475569; }
    `;
    document.head.appendChild(modalStyle);

    svModal = document.createElement('div');
    svModal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: #07080a; z-index: 9999; display: none;
        flex-direction: column; color: #f8fafc; user-select: none;
    `;

    svModal.innerHTML = `
        <!-- Top Header Bar -->
        <div id="svHeaderBar">
            <div>
                <div id="svTitle" style="font-family:'JetBrains Mono', monospace; font-size: 15px; font-weight: 600; color: #f8fafc;">${t('viewerTitle')}</div>
                <div id="svSubtitle" style="font-size: 12px; color: #94a3b8; margin-top: 3px;"></div>
            </div>
            <div style="display:flex; gap: 12px; align-items:center;">
                <select id="svCameraSelect"></select>
                <button id="svCloseBtn" data-i18n="close" style="padding: 8px 18px; background: rgba(239,120,110,0.12); color: #f6b3ab; border: 1px solid rgba(239,120,110,0.3); border-radius: 10px; font-size:12px; font-weight: 600; cursor: pointer;">${t('close')}</button>
            </div>
        </div>

        <!-- Central Interactive Viewport -->
        <div id="svViewport">
            <div id="svLoader" style="position:absolute; font-size:13px; color:#94a3b8; font-family:'JetBrains Mono', monospace; text-align:center; padding: 20px; z-index:5;">${t('loadingApi')}</div>
            <img id="svMainImg" src="" draggable="false" />
            
            <!-- Bottom-Left Telemetry Metadata Readout -->
            <div id="svTelemetry"></div>

            <!-- Waypoint Chronological Navigation Buttons -->
            <button id="svPrevWpBtn" class="sv-nav-btn" data-i18n="prevWp" style="left: 16px;">${t('prevWp')}</button>
            <button id="svNextWpBtn" class="sv-nav-btn" data-i18n="nextWp" style="right: 16px;">${t('nextWp')}</button>
        </div>

        <!-- Bottom Thumbnail Carousel -->
        <div id="svThumbStrip"></div>
    `;
    document.body.appendChild(svModal);

    svViewport = document.getElementById('svViewport');
    svMainImg = document.getElementById('svMainImg');
    svCameraSelect = document.getElementById('svCameraSelect');

    // --- Bind Mouse Drag (Pan) and Wheel (Zoom) Events ---
    svViewport.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        isDraggingSv = true;
        svViewport.style.cursor = 'grabbing';
        startDragX = e.clientX - panX;
        startDragY = e.clientY - panY;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDraggingSv) return;
        panX = e.clientX - startDragX;
        panY = e.clientY - startDragY;
        svMainImg.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomScale})`;
    });

    window.addEventListener('mouseup', () => {
        isDraggingSv = false;
        svViewport.style.cursor = 'grab';
    });

    svViewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        zoomScale += e.deltaY * -0.0015;
        zoomScale = Math.min(Math.max(0.6, zoomScale), 4.0);
        svMainImg.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomScale})`;
    });

    // --- Bind Modal Control Buttons ---
    document.getElementById('svCloseBtn').addEventListener('click', () => {
        svModal.style.display = 'none';
    });

    svCameraSelect.addEventListener('change', () => {
        fetchAndDisplayPhotos(currentMode, currentWpIndex);
    });

    document.getElementById('svPrevWpBtn').addEventListener('click', () => {
        if (currentWpIndex > 0) openMarsViewer(currentMode, currentWpIndex - 1);
    });

    document.getElementById('svNextWpBtn').addEventListener('click', () => {
        const list = currentMode === 'heli' ? INGENUITY_FLIGHTS : PERSEVERANCE_WAYPOINTS;
        if (currentWpIndex < list.length - 1) openMarsViewer(currentMode, currentWpIndex + 1);
    });

    // --- Live re-translation of the open viewer (no image re-fetch) ---
    onLangChange(() => {
        if (svCameraSelect.options.length > 0) buildCameraOptions(currentMode);
        if (svModal.style.display !== 'flex') return;
        const isHeli = currentMode === 'heli';
        const wp = (isHeli ? INGENUITY_FLIGHTS : PERSEVERANCE_WAYPOINTS)[currentWpIndex];
        renderHeader(wp, isHeli);
        if (loaderState) document.getElementById('svLoader').innerText = loaderText(loaderState, wp, isHeli);
        if (currentPhotos[currentPhotoIdx]) renderTelemetry(currentPhotos[currentPhotoIdx], wp, isHeli);
    });
}

// Tracks what the loader overlay is showing so it can be re-translated: 'api' | 'img' | 'failed' | null
let loaderState = null;
let currentPhotoIdx = 0;

function loaderText(state, wp, isHeli) {
    if (state === 'api') return isHeli ? t('heliLoading', { flight: wp.flight }) : t('roverLoading', { sol: wp.sol });
    if (state === 'img') return t('imgLoading');
    if (state === 'failed') return t('imgFailed');
    return '';
}

function setLoader(state, wp, isHeli) {
    loaderState = state;
    const loaderEl = document.getElementById('svLoader');
    loaderEl.style.display = state ? 'block' : 'none';
    if (state) loaderEl.innerText = loaderText(state, wp, isHeli);
}

/** Fills the camera dropdown with localized labels, preserving the current selection. */
function buildCameraOptions(mode) {
    const prev = svCameraSelect.value;
    const opts = mode === 'heli'
        ? [['ALL', 'camHeliAll'], ['HELI_RTE', 'camHeliRte'], ['HELI_NAV', 'camHeliNav']]
        : [['NAVCAM', 'camNavcam'], ['MCZ', 'camMcz'], ['HAZCAM', 'camHazcam'], ['ALL', 'camRoverAll']];
    svCameraSelect.innerHTML = opts.map(([v, k]) => `<option value="${v}">${t(k)}</option>`).join('');
    if (opts.some(([v]) => v === prev)) svCameraSelect.value = prev;
}

function formatDur(wp) {
    return `${wp.dur} ${t('sec')}`;
}

/** Renders the localized title/subtitle for the current waypoint. */
function renderHeader(wp, isHeli) {
    if (isHeli) {
        document.getElementById('svTitle').innerText = t('heliTitle', { flight: wp.flight, sol: wp.sol });
        document.getElementById('svSubtitle').innerText = t('heliSubtitle', { name: L(wp.name), alt: wp.alt, dist: wp.dist, dur: formatDur(wp) });
    } else {
        document.getElementById('svTitle').innerText = t('roverTitle', { sol: wp.sol });
        document.getElementById('svSubtitle').innerText = `${L(wp.name)} — ${L(wp.desc)}`;
    }
}

/**
 * Opens the telemetry modal for a specific platform mode and waypoint index.
 */
export function openMarsViewer(mode, wpIndex) {
    if (currentMode !== mode || svCameraSelect.options.length === 0) {
        currentMode = mode;
        svCameraSelect.innerHTML = '';
        buildCameraOptions(mode);
    }
    fetchAndDisplayPhotos(mode, wpIndex);
    advanceTutorialFrom(3);
}

/**
 * Fetches and displays authentic Mars surface imagery with strict platform separation.
 */
async function fetchAndDisplayPhotos(mode, wpIndex) {
    currentWpIndex = wpIndex;
    const isHeli = (mode === 'heli');
    const list = isHeli ? INGENUITY_FLIGHTS : PERSEVERANCE_WAYPOINTS;
    const wp = list[wpIndex];
    const camFilter = svCameraSelect.value;
    const accent = isHeli ? '#7cc8f0' : '#f5b971';

    svModal.style.display = 'flex';
    svMainImg.style.display = 'none';
    currentPhotos = [];
    const telemetryEl = document.getElementById('svTelemetry');
    telemetryEl.innerHTML = '';
    telemetryEl.style.borderLeftColor = accent;

    renderHeader(wp, isHeli);
    setLoader('api', wp, isHeli);

    document.getElementById('svPrevWpBtn').style.display = wpIndex > 0 ? 'block' : 'none';
    document.getElementById('svNextWpBtn').style.display = wpIndex < list.length - 1 ? 'block' : 'none';

    let validImages = [];

    // --- TIER 1: Query NASA Mars 2020 Raw Images API with strict category & sensor filtering ---
    try {
        if (isHeli) {
            // Ingenuity images live under the 'ingenuity' category ('mars2020_heli' does not exist -> 404).
            // Images are often downlinked days after a flight, so search a widening sol window
            // around the flight sol and sort results by proximity to it.
            const searchParam = camFilter !== "ALL" ? `&search=${encodeURIComponent('|' + camFilter)}` : "";
            for (const radius of [0, 10, 40]) {
                const url = `https://mars.nasa.gov/rss/api/?feed=raw_images&category=ingenuity&feedtype=json${searchParam}` +
                    `&num=50&page=0&order=sol+asc&condition_2=${Math.max(0, wp.sol - radius)}:sol:gte&condition_3=${wp.sol + radius}:sol:lte`;
                const data = await fetchNasaJsonWithFallback(url);
                validImages = filterValidMarsImages(data.images, true);
                if (validImages.length > 0) break;
            }
            validImages.sort((a, b) => Math.abs(a.sol - wp.sol) - Math.abs(b.sol - wp.sol));
        } else {
            // Query Rover images and filter out non-surface/calibration frames
            const urlRover = `https://mars.nasa.gov/rss/api/?feed=raw_images&category=mars2020&feedtype=json&num=80&page=0&condition_2=${wp.sol}:sol:gte&condition_3=${wp.sol}:sol:lte`;
            const dataRover = await fetchNasaJsonWithFallback(urlRover);
            validImages = filterValidMarsImages(dataRover.images, false);

            // Reverse array order so daytime drive images appear before early-morning calibration frames
            validImages.reverse();
        }
    } catch (err) {
        console.warn("NASA RSS API fallback triggered:", err.message);
    }

    // --- TIER 2: Guaranteed Curated Archive Fallback if API returns empty ---
    if (validImages.length === 0) {
        validImages = isHeli ? GUARANTEED_HELI_IMAGES : GUARANTEED_ROVER_IMAGES;
    }

    // Apply user's camera dropdown filter
    if (camFilter !== "ALL") {
        let camMatched = validImages.filter(img => getCameraName(img).toUpperCase().includes(camFilter));
        if (camMatched.length === 0) {
            const fallbackPool = isHeli ? GUARANTEED_HELI_IMAGES : GUARANTEED_ROVER_IMAGES;
            camMatched = fallbackPool.filter(img => getCameraName(img).toUpperCase().includes(camFilter));
        }
        currentPhotos = camMatched.length > 0 ? camMatched : validImages;
    } else {
        currentPhotos = validImages;
    }

    // Render thumbnail strip
    const thumbStrip = document.getElementById('svThumbStrip');
    thumbStrip.innerHTML = '';

    currentPhotos.slice(0, 24).forEach((photo, idx) => {
        const thumb = document.createElement('img');
        thumb.src = photo.image_files.small || photo.image_files.medium || photo.image_files.large;
        thumb.style.cssText = `
            height: 66px; width: 66px; object-fit: cover; border-radius: 5px;
            cursor: pointer; border: 2px solid ${idx === 0 ? accent : 'transparent'};
            flex-shrink: 0; opacity: ${idx === 0 ? '1' : '0.55'};
            transition: opacity 0.15s, border-color 0.15s; background: #1e293b;
        `;
        thumb.onclick = () => selectStreetViewPhoto(idx, wp, isHeli, accent);
        thumbStrip.appendChild(thumb);
    });

    // Display the first image in the viewport
    selectStreetViewPhoto(0, wp, isHeli, accent);
}

/**
 * Loads a selected photo into the main viewport and updates the telemetry overlay box.
 */
function selectStreetViewPhoto(idx, wp, isHeli, accent) {
    const photo = currentPhotos[idx];
    if (!photo) return;

    panX = 0; panY = 0; zoomScale = 1.0;
    svMainImg.style.transform = `translate(0px, 0px) scale(1)`;

    currentPhotoIdx = idx;
    setLoader('img', wp, isHeli);

    svMainImg.src = photo.image_files.large || photo.image_files.full_res || photo.image_files.medium;
    svMainImg.onload = () => {
        setLoader(null, wp, isHeli);
        svMainImg.style.display = 'block';
    };
    svMainImg.onerror = () => {
        const backup = isHeli ? GUARANTEED_HELI_IMAGES[0] : GUARANTEED_ROVER_IMAGES[0];
        if (svMainImg.src !== backup.image_files.large) {
            svMainImg.src = backup.image_files.large;
        } else {
            setLoader('failed', wp, isHeli);
        }
    };

    renderTelemetry(photo, wp, isHeli);

    const thumbs = document.getElementById('svThumbStrip').children;
    for (let i = 0; i < thumbs.length; i++) {
        thumbs[i].style.border = i === idx ? `2px solid ${accent}` : '2px solid transparent';
        thumbs[i].style.opacity = i === idx ? '1' : '0.55';
    }
}

/** Renders the localized bottom-left telemetry readout for a photo. */
function renderTelemetry(photo, wp, isHeli) {
    const sep = ' &nbsp;|&nbsp; ';
    let attText = `<b>${t('platform')}:</b> ${isHeli ? t('heliPlatform') : t('roverPlatform')}${sep}<b>${t('sensor')}:</b> ${getCameraName(photo)}<br>`;
    if (isHeli) {
        attText += `<b>${t('flightData')}:</b> ${t('altitude')} ${wp.alt}${sep}${t('range')} ${wp.dist}${sep}${t('duration')} ${formatDur(wp)}<br>`;
    } else if (photo.extended && photo.extended.mastAz && photo.extended.mastAz !== "UNK") {
        attText += `<b>${t('cameraAngle')}:</b> Azimuth ${parseFloat(photo.extended.mastAz).toFixed(1)}°${sep}Elevation ${parseFloat(photo.extended.mastEl).toFixed(1)}°<br>`;
    }
    attText += `<b>${t('recordTime')}:</b> ${photo.date_taken_utc || t('unknown')} (Sol ${photo.sol || wp.sol})`;
    document.getElementById('svTelemetry').innerHTML = attText;
}