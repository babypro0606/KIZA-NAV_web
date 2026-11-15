// i18n.js
// ============================================================================
// INTERNATIONALIZATION (EN / ES / TR) — dictionary, language state & helpers
// ============================================================================

export const LANGUAGES = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'tr', label: 'TR' }
];

const DEFAULT_LANG = 'en';
const STORAGE_KEY = 'kizanav.lang';

const DICT = {
    en: {
        docTitle: 'KIZA-NAV — Mars Topographic Navigation',
        brand: 'KIZA-NAV',
        flyJezero: 'Focus on Jezero Crater',
        exploreTitle: 'Explore Mars',
        layersTitle: 'Exploration Layers (Street View)',
        roverLayer: 'Perseverance Rover',
        heliLayer: 'Ingenuity Helicopter',
        recenterMars: 'Center Mars',
        menuTitle: 'Navigation & Exploration',
        toggleMenu: 'Menu',
        closeMenu: 'Close Menu',
        routeTitle: 'Route Management',
        clearRoute: 'Clear Route',
        loopRoute: 'Loop Route',
        loopActive: 'Loop Active (↺)',
        setStart: 'Set as Start (A)',
        setFinish: 'Set as Finish (B)',
        hint: '<b>Route Planning:</b> <b>Long press (1s)</b> on the map to place Start (A) or Finish (B). <b>Left-click any pin</b> to delete it.<br><b>Imagery:</b> Turn on exploration layers and single-click waypoint nodes.',
        warning: '<span class="kiza-warning-tag">LOW RESOLUTION WARNING:</span> You are outside the Jezero HiRISE bounds. The route was computed on low-resolution MOLA topography.',
        pointA: 'POINT A',
        pointB: 'POINT B',
        startPin: 'START (A)',
        finishPin: 'FINISH (B)',
        flightLabel: 'FLIGHT #{n}',

        tutorialTitle: 'CAPTAIN FERIT // MISSION GUIDE',
        tutorialStep1: "Greetings, Explorer! I'm Captain Ferit, your mission guide on Mars. Let's begin our expedition by focusing on Jezero Crater from the Explore Mars menu!",
        tutorialStep2: "Outstanding! Jezero Crater was once an ancient lake with river deltas. Now let's plot a rover route: <b>press and hold (1s)</b> on the surface to place Start (A), then long-press again for Finish (B)!",
        tutorialStep3: "Route plotted! Now let's inspect real Martian imagery. <b>Turn on the Perseverance Rover or Ingenuity Helicopter layer</b>, then <b>click on any waypoint marker on the map</b> to view authentic NASA raw images!",
        tutorialStep4: "Mission briefing complete! You're now fully equipped to navigate Jezero Crater and explore landmarks across Mars. Have a safe journey, Explorer!",
        tutorialStepBadge: 'STEP {curr}/3',
        tutorialStepDone: 'READY',
        tutorialSkip: 'Skip Tutorial',
        tutorialFinish: 'Start Exploring',
        tutorialReplay: 'Tutorial',
        tutorialNext: 'Next ▶',
        tutorialBack: '◀ Back',
        tutorialFloatingLabel: 'Mission Guide',
        tutorialStep1Title: 'Jezero',
        tutorialStep2Title: 'Route',
        tutorialStep3Title: 'Imagery',
        tutorialTitleShort: 'Mission Guide (Captain Ferit)',
        deletePin: 'Delete Pin',
        deletePinA: 'Delete Pin (A)',
        deletePinB: 'Delete Pin (B)',

        viewerTitle: 'TELEMETRY VIEWER',
        loadingApi: 'Fetching data from the NASA API server...',
        close: 'Close',
        prevWp: '◀ Previous Stop',
        nextWp: 'Next Stop ▶',
        heliTitle: 'INGENUITY HELICOPTER // FLIGHT #{flight} (SOL {sol})',
        heliSubtitle: '{name} — Altitude: {alt} | Range: {dist} | Duration: {dur}',
        heliLoading: 'Fetching Ingenuity Flight #{flight} images...',
        roverTitle: 'PERSEVERANCE ROVER // SOL {sol}',
        roverLoading: 'Fetching Perseverance Sol {sol} images...',
        imgLoading: 'Loading image...',
        imgFailed: 'Image could not be loaded. Choose another thumbnail below.',
        platform: 'Platform',
        sensor: 'Sensor',
        flightData: 'Flight Data',
        altitude: 'Altitude',
        range: 'Range',
        duration: 'Duration',
        cameraAngle: 'Camera Angle',
        recordTime: 'Capture Time (UTC)',
        unknown: 'Unknown',
        heliPlatform: 'Ingenuity Mars Helicopter',
        roverPlatform: 'Perseverance Rover',
        sec: 's',
        camHeliAll: 'All Helicopter Cameras (RTE + NAV)',
        camHeliRte: 'HELI_RTE (Color Aerial Camera)',
        camHeliNav: 'HELI_NAV (B&W Navigation Camera)',
        camNavcam: 'NAVCAM (Wide Driving View)',
        camMcz: 'MASTCAM-Z (High Resolution)',
        camHazcam: 'HAZCAM (Hazard Camera)',
        camRoverAll: 'All Rover Cameras'
    },

    es: {
        docTitle: 'KIZA-NAV — Navegación Topográfica de Marte',
        brand: 'KIZA-NAV',
        flyJezero: 'Enfocar el Cráter Jezero',
        exploreTitle: 'Explorar Marte',
        layersTitle: 'Capas de Exploración (Street View)',
        roverLayer: 'Rover Perseverance',
        heliLayer: 'Helicóptero Ingenuity',
        recenterMars: 'Centrar Marte',
        menuTitle: 'Navegación y Exploración',
        toggleMenu: 'Menú',
        closeMenu: 'Cerrar Menú',
        routeTitle: 'Gestión de Rutas',
        clearRoute: 'Borrar Ruta',
        loopRoute: 'Ruta Circular',
        loopActive: 'Bucle Activo (↺)',
        setStart: 'Fijar como Inicio (A)',
        setFinish: 'Fijar como Destino (B)',
        language: 'Idioma',
        hint: '<b>Cálculo de Ruta:</b> <b>Mantén pulsado 1 segundo</b> en el mapa para fijar Inicio (A) o Destino (B). <b>Haz clic izquierdo en un pin</b> para eliminarlo.<br><b>Imágenes:</b> Activa las capas y haz clic en las paradas.',
        warning: '<span class="kiza-warning-tag">AVISO DE BAJA RESOLUCIÓN:</span> Estás fuera de los límites HiRISE de Jezero. La ruta se calculó sobre la topografía MOLA de baja resolución.',
        pointA: 'PUNTO A',
        pointB: 'PUNTO B',
        startPin: 'INICIO (A)',
        finishPin: 'DESTINO (B)',
        flightLabel: 'VUELO #{n}',

        tutorialTitle: 'CAPITÁN FERIT // GUÍA DE MISIÓN',
        tutorialStep1: "¡Saludos, explorador! Soy el Capitán Ferit, tu guía en Marte. ¡Comencemos enfocando nuestros sensores en el Cráter Jezero en el menú Explorar Marte!",
        tutorialStep2: "¡Excelente! El Cráter Jezero albergó un antiguo lago con deltas fluviales. Ahora tracemos una ruta: <b>mantén pulsado (1 s)</b> en la superficie para fijar Inicio (A), y vuelve a pulsar para el Destino (B).",
        tutorialStep3: "¡Ruta calculada! Ahora veamos imágenes reales de nuestros exploradores en superficie. <b>Activa la capa del Rover Perseverance o del Helicóptero Ingenuity</b>, y haz <b>clic en cualquier parada en el mapa</b> para ver fotos auténticas de la NASA.",
        tutorialStep4: "¡Instrucciones de misión completadas! Ya estás preparado para navegar por el Cráter Jezero y los grandes hitos de Marte. ¡Buen viaje, explorador!",
        tutorialStepBadge: 'PASO {curr}/3',
        tutorialStepDone: 'LISTO',
        tutorialSkip: 'Omitir',
        tutorialFinish: 'Empezar a Explorar',
        tutorialReplay: 'Tutorial',
        tutorialNext: 'Siguiente ▶',
        tutorialBack: '◀ Atrás',
        tutorialFloatingLabel: 'Guía de Misión',
        tutorialStep1Title: 'Jezero',
        tutorialStep2Title: 'Ruta',
        tutorialStep3Title: 'Imágenes',
        tutorialTitleShort: 'Guía de Misión (Capitán Ferit)',
        deletePin: 'Eliminar Pin',
        deletePinA: 'Eliminar Pin (A)',
        deletePinB: 'Eliminar Pin (B)',

        viewerTitle: 'VISOR DE TELEMETRÍA',
        loadingApi: 'Obteniendo datos del servidor de la API de la NASA...',
        close: 'Cerrar',
        prevWp: '◀ Parada Anterior',
        nextWp: 'Parada Siguiente ▶',
        heliTitle: 'HELICÓPTERO INGENUITY // VUELO #{flight} (SOL {sol})',
        heliSubtitle: '{name} — Altitud: {alt} | Alcance: {dist} | Duración: {dur}',
        heliLoading: 'Obteniendo imágenes del Vuelo #{flight} de Ingenuity...',
        roverTitle: 'ROVER PERSEVERANCE // SOL {sol}',
        roverLoading: 'Obteniendo imágenes del Sol {sol} de Perseverance...',
        imgLoading: 'Cargando imagen...',
        imgFailed: 'No se pudo cargar la imagen. Elige otra miniatura abajo.',
        platform: 'Plataforma',
        sensor: 'Sensor',
        flightData: 'Datos de Vuelo',
        altitude: 'Altitud',
        range: 'Alcance',
        duration: 'Duración',
        cameraAngle: 'Ángulo de Cámara',
        recordTime: 'Hora de Captura (UTC)',
        unknown: 'Desconocido',
        heliPlatform: 'Helicóptero Ingenuity de Marte',
        roverPlatform: 'Rover Perseverance',
        sec: 's',
        camHeliAll: 'Todas las Cámaras del Helicóptero (RTE + NAV)',
        camHeliRte: 'HELI_RTE (Cámara Aérea a Color)',
        camHeliNav: 'HELI_NAV (Cámara de Navegación B/N)',
        camNavcam: 'NAVCAM (Vista Amplia de Conducción)',
        camMcz: 'MASTCAM-Z (Alta Resolución)',
        camHazcam: 'HAZCAM (Cámara de Peligros)',
        camRoverAll: 'Todas las Cámaras del Rover'
    },

    tr: {
        docTitle: 'KIZA-NAV — Mars Topografik Navigasyon',
        brand: 'KIZA-NAV',
        flyJezero: "Jezero Krateri'ne Odaklan",
        exploreTitle: "Mars'ı Keşfet",
        layersTitle: 'Keşif Katmanları (Street View)',
        roverLayer: 'Perseverance Rover',
        heliLayer: 'Ingenuity Helikopter',
        recenterMars: "Mars'ı Ortala",
        menuTitle: 'Navigasyon ve Keşif',
        toggleMenu: 'Menü',
        closeMenu: 'Menüyü Kapat',
        routeTitle: 'Rota Yönetimi',
        clearRoute: 'Rotayı Temizle',
        loopRoute: 'Döngü Rota',
        loopActive: 'Döngü Aktif (↺)',
        setStart: 'Başlangıç Olarak Seç (A)',
        setFinish: 'Hedef Olarak Seç (B)',
        language: 'Dil',
        hint: '<b>Rota Hesaplama:</b> Başlangıç (A) ve Hedef (B) belirlemek için haritada <b>1 saniye basılı tutun</b>. Pini silmek için <b>üzerine sol tıklayın</b>.<br><b>Görüntüler:</b> Keşif katmanlarını açın ve duraklara tek tıklayın.',
        warning: '<span class="kiza-warning-tag">DÜŞÜK ÇÖZÜNÜRLÜK UYARISI:</span> Jezero HiRISE sınırları dışındasınız. Rota düşük çözünürlüklü MOLA topografyası üzerinden hesaplandı.',
        pointA: 'NOKTA A',
        pointB: 'NOKTA B',
        startPin: 'BAŞLANGIÇ (A)',
        finishPin: 'HEDEF (B)',
        flightLabel: 'UÇUŞ #{n}',

        tutorialTitle: 'KAPTAN FERİT // GÖREV REHBERİ',
        tutorialStep1: "Selam Kaşif! Ben Kaptan Ferit, Mars'taki görev rehberinim. Keşfimize Mars'ı Keşfet menüsünden Jezero Krateri'ne odaklanarak başlayalım!",
        tutorialStep2: "Harika! Jezero Krateri, nehir deltaları olan antik bir göl yatağı. Şimdi bir keşif rotası oluşturalım: haritada bir noktaya <b>1 saniye basılı tutarak</b> Başlangıç (A), ardından başka bir noktaya basılı tutarak Hedef (B) noktanı seç!",
        tutorialStep3: "Rota oluşturuldu! Şimdi yüzey kaşiflerimizin çektiği gerçek Mars fotoğraflarını inceleyelim. <b>Perseverance Rover veya Ingenuity Helikopter katmanını aç</b>, ardından Mars üzerindeki <b>herhangi bir durak noktasına tıkla</b>!",
        tutorialStep4: "Görev brifingi tamamlandı! Artık Jezero Krateri'ni ve Mars'ın tüm devasa yapılarını keşfetmeye hazırsın. Yolun açık olsun, Kaşif!",
        tutorialStepBadge: 'ADIM {curr}/3',
        tutorialStepDone: 'HAZIR',
        tutorialSkip: 'Eğitimi Geç',
        tutorialFinish: 'Keşfe Başla',
        tutorialReplay: 'Eğitim',
        tutorialNext: 'İleri ▶',
        tutorialBack: '◀ Geri',
        tutorialFloatingLabel: 'Görev Rehberi',
        tutorialStep1Title: 'Jezero',
        tutorialStep2Title: 'Rota',
        tutorialStep3Title: 'Görüntüler',
        tutorialTitleShort: 'Görev Rehberi (Kaptan Ferit)',
        deletePin: 'Pini Sil',
        deletePinA: 'Pini Sil (A)',
        deletePinB: 'Pini Sil (B)',

        viewerTitle: 'TELEMETRİ GÖRÜNTÜLEYİCİ',
        loadingApi: 'NASA API sunucusundan veri alınıyor...',
        close: 'Kapat',
        prevWp: '◀ Önceki Nokta',
        nextWp: 'Sonraki Nokta ▶',
        heliTitle: 'INGENUITY HELİKOPTER // UÇUŞ #{flight} (SOL {sol})',
        heliSubtitle: '{name} — İrtifa: {alt} | Menzil: {dist} | Süre: {dur}',
        heliLoading: 'Ingenuity Uçuş #{flight} görüntüleri alınıyor...',
        roverTitle: 'PERSEVERANCE ROVER // SOL {sol}',
        roverLoading: 'Perseverance Sol {sol} görüntüleri alınıyor...',
        imgLoading: 'Görüntü yükleniyor...',
        imgFailed: 'Görüntü yüklenemedi. Aşağıdan başka bir küçük resim seçin.',
        platform: 'Platform',
        sensor: 'Sensör',
        flightData: 'Uçuş Verisi',
        altitude: 'İrtifa',
        range: 'Menzil',
        duration: 'Süre',
        cameraAngle: 'Kamera Açısı',
        recordTime: 'Kayıt Zamanı (UTC)',
        unknown: 'Bilinmiyor',
        heliPlatform: 'Ingenuity Mars Helikopteri',
        roverPlatform: 'Perseverance Rover',
        sec: 'sn',
        camHeliAll: 'Tüm Helikopter Kameraları (RTE + NAV)',
        camHeliRte: 'HELI_RTE (Renkli Kuşbakışı Kamera)',
        camHeliNav: 'HELI_NAV (Siyah-Beyaz Navigasyon Kamerası)',
        camNavcam: 'NAVCAM (Geniş Sürüş Açısı)',
        camMcz: 'MASTCAM-Z (Yüksek Çözünürlük)',
        camHazcam: 'HAZCAM (Zemin Kamerası)',
        camRoverAll: 'Tüm Rover Kameraları'
    }
};

function readStoredLang() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && DICT[saved]) return saved;
    } catch (e) { /* storage unavailable (e.g. privacy mode) */ }
    return DEFAULT_LANG;
}

let currentLang = readStoredLang();
const listeners = new Set();

/** Returns the active language code ('en' | 'es' | 'tr'). */
export function getLang() {
    return currentLang;
}

/**
 * Translates a key, substituting {placeholders} from `vars`.
 * Falls back to English, then to the key itself.
 */
export function t(key, vars = {}) {
    const str = (DICT[currentLang] && DICT[currentLang][key]) ?? DICT.en[key] ?? key;
    return str.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? vars[name] : m));
}

/** Picks the active language from a { en, es, tr } object (plain strings pass through). */
export function L(value) {
    if (value && typeof value === 'object') return value[currentLang] ?? value.en;
    return value;
}

/** Applies translations to every element with data-i18n / data-i18n-html inside `root`. */
export function applyTranslations(root = document) {
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.documentElement.lang = currentLang;
    document.title = t('docTitle');
}

/** Switches language, persists it, re-translates the DOM and notifies subscribers. */
export function setLang(lang) {
    if (!DICT[lang] || lang === currentLang) return;
    currentLang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    applyTranslations();
    listeners.forEach(cb => cb(lang));
}

/** Subscribes to language changes. */
export function onLangChange(cb) {
    listeners.add(cb);
}
