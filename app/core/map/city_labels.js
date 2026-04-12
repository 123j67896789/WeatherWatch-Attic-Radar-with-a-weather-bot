function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function pointInBounds(lat, lon, bounds, paddingDegrees) {
    if (!bounds) return false;
    return (
        lat <= bounds.north + paddingDegrees &&
        lat >= bounds.south - paddingDegrees &&
        lon <= bounds.east + paddingDegrees &&
        lon >= bounds.west - paddingDegrees
    );
}

const RADAR_CITY_LABELS = [
    { name: 'New York', lat: 40.7128, lon: -74.006, pop: 8500000 },
    { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, pop: 3900000 },
    { name: 'Chicago', lat: 41.8781, lon: -87.6298, pop: 2700000 },
    { name: 'Houston', lat: 29.7604, lon: -95.3698, pop: 2300000 },
    { name: 'Phoenix', lat: 33.4484, lon: -112.074, pop: 1600000 },
    { name: 'Philadelphia', lat: 39.9526, lon: -75.1652, pop: 1550000 },
    { name: 'San Antonio', lat: 29.4241, lon: -98.4936, pop: 1450000 },
    { name: 'San Diego', lat: 32.7157, lon: -117.1611, pop: 1380000 },
    { name: 'Dallas', lat: 32.7767, lon: -96.797, pop: 1300000 },
    { name: 'Austin', lat: 30.2672, lon: -97.7431, pop: 980000 },
    { name: 'Jacksonville', lat: 30.3322, lon: -81.6557, pop: 950000 },
    { name: 'Fort Worth', lat: 32.7555, lon: -97.3308, pop: 930000 },
    { name: 'Columbus', lat: 39.9612, lon: -82.9988, pop: 900000 },
    { name: 'Charlotte', lat: 35.2271, lon: -80.8431, pop: 900000 },
    { name: 'San Francisco', lat: 37.7749, lon: -122.4194, pop: 810000 },
    { name: 'Indianapolis', lat: 39.7684, lon: -86.1581, pop: 880000 },
    { name: 'Seattle', lat: 47.6062, lon: -122.3321, pop: 760000 },
    { name: 'Denver', lat: 39.7392, lon: -104.9903, pop: 710000 },
    { name: 'Washington, DC', lat: 38.9072, lon: -77.0369, pop: 690000 },
    { name: 'Boston', lat: 42.3601, lon: -71.0589, pop: 670000 },
    { name: 'Nashville', lat: 36.1627, lon: -86.7816, pop: 680000 },
    { name: 'Detroit', lat: 42.3314, lon: -83.0458, pop: 640000 },
    { name: 'Portland', lat: 45.5152, lon: -122.6784, pop: 630000 },
    { name: 'Oklahoma City', lat: 35.4676, lon: -97.5164, pop: 680000 },
    { name: 'Las Vegas', lat: 36.1699, lon: -115.1398, pop: 640000 },
    { name: 'Louisville', lat: 38.2527, lon: -85.7585, pop: 620000 },
    { name: 'Baltimore', lat: 39.2904, lon: -76.6122, pop: 570000 },
    { name: 'Milwaukee', lat: 43.0389, lon: -87.9065, pop: 570000 },
    { name: 'Albuquerque', lat: 35.0844, lon: -106.6504, pop: 560000 },
    { name: 'Tucson', lat: 32.2226, lon: -110.9747, pop: 540000 },
    { name: 'Mesa', lat: 33.4152, lon: -111.8315, pop: 510000 },
    { name: 'Atlanta', lat: 33.749, lon: -84.388, pop: 510000 },
    { name: 'Kansas City', lat: 39.0997, lon: -94.5786, pop: 510000 },
    { name: 'Miami', lat: 25.7617, lon: -80.1918, pop: 450000 },
    { name: 'Raleigh', lat: 35.7796, lon: -78.6382, pop: 470000 },
    { name: 'Omaha', lat: 41.2565, lon: -95.9345, pop: 485000 },
    { name: 'Minneapolis', lat: 44.9778, lon: -93.265, pop: 430000 },
    { name: 'Tulsa', lat: 36.154, lon: -95.9928, pop: 410000 },
    { name: 'Arlington', lat: 32.7357, lon: -97.1081, pop: 400000 },
    { name: 'New Orleans', lat: 29.9511, lon: -90.0715, pop: 380000 },
    { name: 'Fresno', lat: 36.7378, lon: -119.7871, pop: 540000 },
    { name: 'Sacramento', lat: 38.5816, lon: -121.4944, pop: 525000 },
    { name: 'Colorado Springs', lat: 38.8339, lon: -104.8214, pop: 485000 },
    { name: 'Long Beach', lat: 33.7701, lon: -118.1937, pop: 455000 },
    { name: 'Virginia Beach', lat: 36.8529, lon: -75.978, pop: 455000 },
    { name: 'Oakland', lat: 37.8044, lon: -122.2711, pop: 440000 },
    { name: 'Wichita', lat: 37.6872, lon: -97.3301, pop: 400000 },
    { name: 'Bakersfield', lat: 35.3733, lon: -119.0187, pop: 410000 },
    { name: 'Tampa', lat: 27.9506, lon: -82.4572, pop: 395000 },
    { name: 'Honolulu', lat: 21.3069, lon: -157.8583, pop: 350000 },
    { name: 'Aurora', lat: 39.7294, lon: -104.8319, pop: 395000 },
    { name: 'Santa Ana', lat: 33.7455, lon: -117.8677, pop: 310000 },
    { name: 'Anaheim', lat: 33.8366, lon: -117.9143, pop: 350000 },
    { name: 'Corpus Christi', lat: 27.8006, lon: -97.3964, pop: 320000 },
    { name: 'Riverside', lat: 33.9806, lon: -117.3755, pop: 315000 },
    { name: 'Lexington', lat: 38.0406, lon: -84.5037, pop: 320000 },
    { name: 'Stockton', lat: 37.9577, lon: -121.2908, pop: 320000 },
    { name: 'Henderson', lat: 36.0395, lon: -114.9817, pop: 330000 },
    { name: 'Saint Paul', lat: 44.9537, lon: -93.09, pop: 310000 },
    { name: 'Cincinnati', lat: 39.1031, lon: -84.512, pop: 310000 },
    { name: 'Greensboro', lat: 36.0726, lon: -79.792, pop: 300000 },
    { name: 'Plano', lat: 33.0198, lon: -96.6989, pop: 290000 },
    { name: 'Newark', lat: 40.7357, lon: -74.1724, pop: 305000 },
    { name: 'Toledo', lat: 41.6528, lon: -83.5379, pop: 270000 },
    { name: 'Anchorage', lat: 61.2181, lon: -149.9003, pop: 290000 },
    { name: 'Boise', lat: 43.615, lon: -116.2023, pop: 240000 },
    { name: 'Salt Lake City', lat: 40.7608, lon: -111.891, pop: 200000 },
    { name: 'Santa Fe', lat: 35.687, lon: -105.9378, pop: 90000 },
    { name: 'Ciudad Juarez', lat: 31.6904, lon: -106.4245, pop: 1500000 },
    { name: 'Hermosillo', lat: 29.0729, lon: -110.9559, pop: 900000 },
    { name: 'Chihuahua City', lat: 28.632, lon: -106.0691, pop: 925000 },
    { name: 'Helena', lat: 46.5884, lon: -112.0245, pop: 33000 },
    { name: 'Billings', lat: 45.7833, lon: -108.5007, pop: 120000 },
    { name: 'Cheyenne', lat: 41.14, lon: -104.8202, pop: 65000 },
    { name: 'Bismarck', lat: 46.8083, lon: -100.7837, pop: 75000 },
    { name: 'Sioux Falls', lat: 43.5446, lon: -96.7311, pop: 210000 },
    { name: 'Rochester', lat: 44.0121, lon: -92.4802, pop: 120000 },
    { name: 'Des Moines', lat: 41.5868, lon: -93.625, pop: 215000 },
    { name: 'Topeka', lat: 39.0473, lon: -95.6752, pop: 125000 },
    { name: 'Memphis', lat: 35.1495, lon: -90.049, pop: 620000 },
    { name: 'Springfield', lat: 37.2089, lon: -93.2923, pop: 170000 },
    { name: 'Jackson', lat: 32.2988, lon: -90.1848, pop: 150000 },
    { name: 'Birmingham', lat: 33.5186, lon: -86.8104, pop: 200000 },
    { name: 'Orlando', lat: 28.5383, lon: -81.3792, pop: 320000 },
];

const RADAR_STATE_CAPITALS = [
    { name: 'Montgomery', lat: 32.3668, lon: -86.3, pop: 200000 },
    { name: 'Juneau', lat: 58.3019, lon: -134.4197, pop: 31000 },
    { name: 'Phoenix', lat: 33.4484, lon: -112.074, pop: 1600000 },
    { name: 'Little Rock', lat: 34.7465, lon: -92.2896, pop: 200000 },
    { name: 'Sacramento', lat: 38.5816, lon: -121.4944, pop: 525000 },
    { name: 'Denver', lat: 39.7392, lon: -104.9903, pop: 710000 },
    { name: 'Hartford', lat: 41.7658, lon: -72.6734, pop: 120000 },
    { name: 'Dover', lat: 39.1582, lon: -75.5244, pop: 39000 },
    { name: 'Tallahassee', lat: 30.4383, lon: -84.2807, pop: 200000 },
    { name: 'Atlanta', lat: 33.749, lon: -84.388, pop: 510000 },
    { name: 'Honolulu', lat: 21.3069, lon: -157.8583, pop: 350000 },
    { name: 'Boise', lat: 43.615, lon: -116.2023, pop: 240000 },
    { name: 'Springfield', lat: 39.7817, lon: -89.6501, pop: 115000 },
    { name: 'Indianapolis', lat: 39.7684, lon: -86.1581, pop: 880000 },
    { name: 'Des Moines', lat: 41.5868, lon: -93.625, pop: 215000 },
    { name: 'Topeka', lat: 39.0473, lon: -95.6752, pop: 125000 },
    { name: 'Frankfort', lat: 38.2009, lon: -84.8733, pop: 28000 },
    { name: 'Baton Rouge', lat: 30.4515, lon: -91.1871, pop: 220000 },
    { name: 'Augusta', lat: 44.3106, lon: -69.7795, pop: 19000 },
    { name: 'Annapolis', lat: 38.9784, lon: -76.4922, pop: 41000 },
    { name: 'Boston', lat: 42.3601, lon: -71.0589, pop: 670000 },
    { name: 'Lansing', lat: 42.7325, lon: -84.5555, pop: 112000 },
    { name: 'Saint Paul', lat: 44.9537, lon: -93.09, pop: 310000 },
    { name: 'Jackson', lat: 32.2988, lon: -90.1848, pop: 150000 },
    { name: 'Jefferson City', lat: 38.5767, lon: -92.1735, pop: 43000 },
    { name: 'Helena', lat: 46.5884, lon: -112.0245, pop: 33000 },
    { name: 'Lincoln', lat: 40.8136, lon: -96.7026, pop: 290000 },
    { name: 'Carson City', lat: 39.1638, lon: -119.7674, pop: 58000 },
    { name: 'Concord', lat: 43.2081, lon: -71.5376, pop: 44000 },
    { name: 'Trenton', lat: 40.2206, lon: -74.7597, pop: 90000 },
    { name: 'Santa Fe', lat: 35.687, lon: -105.9378, pop: 90000 },
    { name: 'Albany', lat: 42.6526, lon: -73.7562, pop: 100000 },
    { name: 'Raleigh', lat: 35.7796, lon: -78.6382, pop: 470000 },
    { name: 'Bismarck', lat: 46.8083, lon: -100.7837, pop: 75000 },
    { name: 'Columbus', lat: 39.9612, lon: -82.9988, pop: 900000 },
    { name: 'Oklahoma City', lat: 35.4676, lon: -97.5164, pop: 680000 },
    { name: 'Salem', lat: 44.9429, lon: -123.0351, pop: 180000 },
    { name: 'Harrisburg', lat: 40.2732, lon: -76.8867, pop: 50000 },
    { name: 'Providence', lat: 41.824, lon: -71.4128, pop: 190000 },
    { name: 'Columbia', lat: 34.0007, lon: -81.0348, pop: 135000 },
    { name: 'Pierre', lat: 44.3683, lon: -100.351, pop: 14000 },
    { name: 'Nashville', lat: 36.1627, lon: -86.7816, pop: 680000 },
    { name: 'Austin', lat: 30.2672, lon: -97.7431, pop: 980000 },
    { name: 'Salt Lake City', lat: 40.7608, lon: -111.891, pop: 200000 },
    { name: 'Montpelier', lat: 44.2601, lon: -72.5754, pop: 8000 },
    { name: 'Richmond', lat: 37.5407, lon: -77.436, pop: 225000 },
    { name: 'Olympia', lat: 47.0379, lon: -122.9007, pop: 55000 },
    { name: 'Charleston', lat: 38.3498, lon: -81.6326, pop: 47000 },
    { name: 'Madison', lat: 43.0731, lon: -89.4012, pop: 280000 },
    { name: 'Cheyenne', lat: 41.14, lon: -104.8202, pop: 65000 },
];

const RADAR_CITY_LABELS_DEDUPED = Array.from(
    new Map(RADAR_CITY_LABELS.concat(RADAR_STATE_CAPITALS).map((city) => [city.name, city])).values()
);

const PINNED_RADAR_CITIES = new Set([
    'Boise', 'Salt Lake City', 'Las Vegas', 'Los Angeles', 'Santa Fe',
    'Ciudad Juarez', 'Hermosillo', 'Chihuahua City',
    'Helena', 'Billings', 'Cheyenne', 'Denver',
    'Bismarck', 'Sioux Falls', 'Minneapolis', 'Rochester', 'Milwaukee', 'Chicago',
    'Des Moines', 'Topeka', 'Oklahoma City', 'Dallas',
    'Memphis', 'Nashville', 'Springfield', 'Jackson', 'New Orleans', 'Atlanta',
    'Seattle', 'Portland', 'San Francisco', 'San Diego',
    'Phoenix', 'Albuquerque',
    'Detroit', 'Indianapolis', 'Kansas City', 'St. Louis',
    'Austin', 'San Antonio',
    'Birmingham', 'Charlotte', 'Raleigh', 'Jacksonville',
    'Tampa', 'Orlando', 'Miami',
    'Washington, DC', 'Philadelphia', 'New York', 'Boston',
]);

const CAPITAL_NAMES = new Set(RADAR_STATE_CAPITALS.map((city) => city.name));

function radarCityLabelIcon(name, featured) {
    const container = document.createElement('div');
    container.className = 'radarCityLabelIcon';

    const label = document.createElement('span');
    label.className = featured ? 'radarCityLabelText is-featured' : 'radarCityLabelText';
    label.innerHTML = escapeHtml(name);
    container.appendChild(label);

    return container;
}

function getZoomRules(zoom) {
    if (zoom <= 4) return { minPop: 1500000, maxCities: 22, pad: 2.2 };
    return { minPop: Infinity, maxCities: 0, pad: 0.6 };
}

function getVisibleCities(map) {
    const zoom = map.getZoom();
    const bounds = map.getBounds();
    const rule = getZoomRules(zoom);
    const simpleBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
    };

    const cityMeta = RADAR_CITY_LABELS_DEDUPED
        .map((city) => ({
            name: city.name,
            lat: city.lat,
            lon: city.lon,
            pop: city.pop,
            featured: city.pop >= 300000,
            capital: CAPITAL_NAMES.has(city.name),
            pinned: PINNED_RADAR_CITIES.has(city.name),
        }))
        .filter((city) => {
            if (zoom > 4) return city.pinned;
            return city.pinned || city.capital || city.featured || city.pop >= rule.minPop;
        })
        .filter((city) => pointInBounds(city.lat, city.lon, simpleBounds, rule.pad));

    const pinnedCities = cityMeta.filter((city) => city.pinned);
    const capitalCities = cityMeta.filter((city) => city.capital && !city.pinned);
    const remainingSlots = zoom > 4 ? 0 : Math.max(0, rule.maxCities - pinnedCities.length - capitalCities.length);

    const nonCapitalCities = cityMeta
        .filter((city) => !city.capital && !city.pinned)
        .sort((a, b) => {
            if (a.featured !== b.featured) return a.featured ? -1 : 1;
            return b.pop - a.pop;
        })
        .slice(0, remainingSlots);

    return pinnedCities.concat(capitalCities).concat(nonCapitalCities);
}

function updateCityLabels(map) {
    const nextVisible = getVisibleCities(map);
    const nextKeys = new Set();
    const markers = map.__atticCityLabelMarkers || {};

    nextVisible.forEach(function(city) {
        nextKeys.add(city.name);
        if (!markers[city.name]) {
            const element = radarCityLabelIcon(city.name, city.featured || city.pinned);
            markers[city.name] = new mapboxgl.Marker({
                element: element,
                anchor: 'center',
            })
                .setLngLat([city.lon, city.lat])
                .addTo(map);
            markers[city.name].getElement().style.pointerEvents = 'none';
        } else {
            markers[city.name].setLngLat([city.lon, city.lat]);
        }
    });

    Object.keys(markers).forEach(function(key) {
        if (!nextKeys.has(key)) {
            markers[key].remove();
            delete markers[key];
        }
    });

    map.__atticCityLabelMarkers = markers;
}

function addCityLabels(map) {
    if (!map.__atticCityLabelMarkers) {
        map.__atticCityLabelMarkers = {};
    }

    if (!map.__atticCityLabelsBound) {
        map.on('load', function() {
            updateCityLabels(map);
        });
        map.on('moveend', function() {
            updateCityLabels(map);
        });
        map.on('zoomend', function() {
            updateCityLabels(map);
        });
        map.__atticCityLabelsBound = true;
    }

    if (map.loaded()) {
        updateCityLabels(map);
    }
}

module.exports = {
    RADAR_CITY_LABELS,
    RADAR_STATE_CAPITALS,
    RADAR_CITY_LABELS_DEDUPED,
    PINNED_RADAR_CITIES,
    radarCityLabelIcon,
    addCityLabels,
};
