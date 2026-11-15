// constants.js
// ============================================================================
// GLOBAL CONSTANTS, BOUNDARIES, AND MISSION WAYPOINT DATASETS
// ============================================================================

// Base URL for the USGS Planetary Maps Web Map Service (WMS) providing global Mars MOLA data
export const WMS_BASE_URL = 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map';

// Resolution size (260x260 pixels) of the local 2D elevation matrix used for high-res A* pathfinding
export const GRID_SIZE = 260;

// Geographic bounding box coordinates (in degrees) for the Jezero Crater HiRISE high-resolution area
export const WEST = 77.222933077;  // Westernmost longitude limit
export const SOUTH = 18.306799450; // Southernmost latitude limit
export const EAST = 77.583964021;  // Easternmost longitude limit
export const NORTH = 18.669315007; // Northernmost latitude limit

// Historical waypoints and Martian solar days (Sols) for the Perseverance Rover mission
// `name` / `desc` are localized { en, es, tr } objects (resolved with L() from i18n.js)
export const PERSEVERANCE_WAYPOINTS = [
    { id: 0, sol: 15, lon: 77.4508, lat: 18.4447,
      name: { en: "Octavia E. Butler Landing Site", es: "Lugar de Aterrizaje Octavia E. Butler", tr: "Octavia E. Butler İniş Alanı" },
      desc: { en: "First touchdown point on the Jezero Crater floor.", es: "Primer punto de contacto en el suelo del cráter Jezero.", tr: "Jezero Krateri tabanı ilk temas noktası." } },
    { id: 1, sol: 180, lon: 77.4435, lat: 18.4365,
      name: { en: "Citadelle Overlook", es: "Mirador Citadelle", tr: "Citadelle Gözlem Noktası" },
      desc: { en: "Ridge line where the first rock core sample was taken.", es: "Cresta donde se tomó la primera muestra de núcleo de roca.", tr: "İlk kaya çekirdeği örneğinin alındığı sırt hattı." } },
    { id: 2, sol: 255, lon: 77.4350, lat: 18.4420,
      name: { en: "South Séítah Dunes", es: "Dunas de Séítah Sur", tr: "Güney Séítah Kumulları" },
      desc: { en: "Olivine-rich dune and rock region.", es: "Región de dunas y rocas ricas en olivino.", tr: "Olivin zengini kumul ve kayaç bölgesi." } },
    { id: 3, sol: 415, lon: 77.4095, lat: 18.4485,
      name: { en: "Three Forks Delta Front", es: "Frente del Delta Three Forks", tr: "Three Forks Delta Önü" },
      desc: { en: "Slope where the ancient river delta meets the crater floor.", es: "Ladera donde el antiguo delta fluvial se une al suelo del cráter.", tr: "Antik nehir deltasının tabanla birleştiği yamaç." } },
    { id: 4, sol: 495, lon: 77.4020, lat: 18.4440,
      name: { en: "Hawksbill Gap", es: "Hawksbill Gap", tr: "Hawksbill Gap" },
      desc: { en: "Start of the climb up the sedimentary delta layers.", es: "Inicio del ascenso por las capas sedimentarias del delta.", tr: "Sedimanter delta katmanlarına tırmanış başlangıcı." } },
    { id: 5, sol: 775, lon: 77.3890, lat: 18.4630,
      name: { en: "Belva Crater", es: "Cráter Belva", tr: "Belva Krateri" },
      desc: { en: "Impact crater on the upper delta plateau.", es: "Cráter de impacto en la meseta superior del delta.", tr: "Delta üst platosundaki çarpma krateri." } },
    { id: 6, sol: 940, lon: 77.3670, lat: 18.4695,
      name: { en: "Margin Unit", es: "Unidad Margin", tr: "Margin Unit" },
      desc: { en: "Carbonate-rich shoreline of the ancient lake.", es: "Antigua orilla del lago rica en carbonatos.", tr: "Antik gölün karbonat zengini kıyı şeridi." } },
    { id: 7, sol: 1175, lon: 77.3450, lat: 18.4660,
      name: { en: "Neretva Vallis", es: "Neretva Vallis", tr: "Neretva Vallis" },
      desc: { en: "Main river channel that fed Jezero.", es: "Canal fluvial principal que alimentaba Jezero.", tr: "Jezero'yu besleyen ana nehir kanalı." } },
    { id: 8, sol: 1310, lon: 77.3190, lat: 18.4490,
      name: { en: "Witch Hazel Hill", es: "Colina Witch Hazel", tr: "Witch Hazel Hill" },
      desc: { en: "Climbing route up the crater's western rim.", es: "Ruta de ascenso por el borde occidental del cráter.", tr: "Kraterin batı duvarı tırmanış hattı." } }
];

// Historical flight locations, telemetry metrics, and Sols for the Ingenuity Mars Helicopter
// `dur` is in seconds (unit label is localized at display time)
export const INGENUITY_FLIGHTS = [
    { id: 0, flight: 1, sol: 58, lon: 77.4509, lat: 18.4449, alt: "3.0 m", dist: "0 m", dur: 39.1,
      name: { en: "Wright Brothers Field", es: "Campo Hermanos Wright", tr: "Wright Brothers Field" },
      desc: { en: "The first powered flight on Mars.", es: "El primer vuelo propulsado en Marte.", tr: "Mars'ta gerçekleştirilen ilk motorlu uçuş." } },
    { id: 1, flight: 3, sol: 64, lon: 77.4505, lat: 18.4458, alt: "5.0 m", dist: "100 m", dur: 80.3,
      name: { en: "North Flight Test", es: "Prueba de Vuelo Norte", tr: "Kuzey Uçuş Testi" },
      desc: { en: "First horizontal range and speed test.", es: "Primera prueba de alcance horizontal y velocidad.", tr: "İlk yatay menzil ve hız testi." } },
    { id: 2, flight: 9, sol: 133, lon: 77.4402, lat: 18.4315, alt: "10.0 m", dist: "625 m", dur: 166.4,
      name: { en: "Séítah Dune Crossing", es: "Cruce de Dunas de Séítah", tr: "Séítah Kumul Geçişi" },
      desc: { en: "High-speed scouting flight over the dunes.", es: "Vuelo de reconocimiento a alta velocidad sobre las dunas.", tr: "Kumulların üzerinden yüksek hızlı keşif uçuşu." } },
    { id: 3, flight: 12, sol: 174, lon: 77.4312, lat: 18.4385, alt: "10.0 m", dist: "450 m", dur: 169.5,
      name: { en: "South Séítah Survey", es: "Exploración de Séítah Sur", tr: "Güney Séítah Keşfi" },
      desc: { en: "Aerial photography of rock targets.", es: "Fotografía aérea de objetivos rocosos.", tr: "Kayaç hedeflerinin havadan fotoğraflanması." } },
    { id: 4, flight: 25, sol: 395, lon: 77.4150, lat: 18.4465, alt: "10.0 m", dist: "704 m", dur: 161.3,
      name: { en: "Distance Record (704 m)", es: "Récord de Distancia (704 m)", tr: "Menzil Rekoru (704m)" },
      desc: { en: "Transfer flight covering 704 meters in one go.", es: "Vuelo de traslado de 704 metros de una sola vez.", tr: "Tek seferde 704 metre kat edilen intikal uçuşu." } },
    { id: 5, flight: 34, sol: 625, lon: 77.4005, lat: 18.4475, alt: "12.0 m", dist: "150 m", dur: 52.2,
      name: { en: "Delta Front Transfer", es: "Traslado al Frente del Delta", tr: "Delta Önü İntikali" },
      desc: { en: "Scouting at the canyon mouth of the river delta.", es: "Reconocimiento en la boca del cañón del delta.", tr: "Nehir deltasının kanyon ağzında keşif." } },
    { id: 6, flight: 50, sol: 763, lon: 77.3910, lat: 18.4605, alt: "18.0 m", dist: "322 m", dur: 145.7,
      name: { en: "Belva Crater Survey", es: "Exploración del Cráter Belva", tr: "Belva Krateri Keşfi" },
      desc: { en: "High-altitude flight over the delta plateau.", es: "Vuelo a gran altitud sobre la meseta del delta.", tr: "Delta platosunda yüksek irtifa uçuşu." } },
    { id: 7, flight: 72, sol: 1036, lon: 77.3520, lat: 18.4690, alt: "12.0 m", dist: "0 m", dur: 32.0,
      name: { en: "Valinor Hills (Final Flight)", es: "Colinas Valinor (Último Vuelo)", tr: "Valinor Hills (Son Uçuş)" },
      desc: { en: "Final point at the Neretva Vallis entrance where the mission ended.", es: "Punto final en la entrada de Neretva Vallis donde terminó la misión.", tr: "Neretva Vallis girişinde görevin tamamlandığı son nokta." } }
];

// Major Martian landmarks for the "Explore Mars" fly-to buttons.
// Includes Jezero Crater (with high-res HiRISE flag) and Gale Crater (8 landmarks total).
export const MARS_LANDMARKS = [
    { id: 'jezero', name: 'Jezero Crater', lon: 77.40, lat: 18.49, range: 120000, color: '#e8835a', isJezero: true,
      sub: { en: 'HiRISE · Rover & Heli', es: 'HiRISE · Rover y Heli', tr: 'HiRISE · Rover ve Heli' } },
    { id: 'olympus', name: 'Olympus Mons', lon: -133.8, lat: 18.65, range: 2200000, color: '#f4a582',
      sub: { en: 'Tallest volcano · 21.9 km', es: 'Volcán más alto · 21,9 km', tr: 'En yüksek volkan · 21,9 km' } },
    { id: 'valles', name: 'Valles Marineris', lon: -59.2, lat: -13.9, range: 7500000, color: '#f7c59f',
      sub: { en: 'Canyon system · 4,000 km', es: 'Sistema de cañones · 4.000 km', tr: 'Kanyon sistemi · 4.000 km' } },
    { id: 'hellas', name: 'Hellas Planitia', lon: 70.5, lat: -42.4, range: 6000000, color: '#c3b1e1',
      sub: { en: 'Impact basin · 7 km deep', es: 'Cuenca de impacto · 7 km', tr: 'Çarpma havzası · 7 km derin' } },
    { id: 'tharsis', name: 'Tharsis Montes', lon: -112.5, lat: 1.5, range: 5000000, color: '#f9d38c',
      sub: { en: 'Three giant volcanoes', es: 'Tres volcanes gigantes', tr: 'Üç dev volkan' } },
    { id: 'boreum', name: 'Planum Boreum', lon: 15.0, lat: 87.0, range: 4500000, color: '#a8d8ea',
      sub: { en: 'North polar cap', es: 'Casquete polar norte', tr: 'Kuzey kutup başlığı' } },
    { id: 'australe', name: 'Planum Australe', lon: 160.0, lat: -84.0, range: 4500000, color: '#b8e0d2',
      sub: { en: 'South polar cap', es: 'Casquete polar sur', tr: 'Güney kutup başlığı' } },
    { id: 'gale', name: 'Gale Crater', lon: 137.4, lat: -4.6, range: 2200000, color: '#e5989b',
      sub: { en: 'Curiosity · Mt. Sharp', es: 'Curiosity · Mte. Sharp', tr: 'Curiosity · Sharp Dağı' } }
];