const turf = require('@turf/turf');

const QUERY_URL = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_Counties_Generalized_Boundaries/FeatureServer/0/query';
const SOURCE_ID = 'attic_county_borders_source';
const FILL_LAYER_ID = 'attic_county_borders_fill';
const LINE_LAYER_ID = 'attic_county_borders_line';
function removeCountyLayers(map) {
    if (map.getLayer(LINE_LAYER_ID)) map.removeLayer(LINE_LAYER_ID);
    if (map.getLayer(FILL_LAYER_ID)) map.removeLayer(FILL_LAYER_ID);
    if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
}

function clearSelectedCountyLabel(map) {
    if (map.__atticCountyLabelTimeout) {
        clearTimeout(map.__atticCountyLabelTimeout);
        map.__atticCountyLabelTimeout = null;
    }

    if (map.__atticCountyLabelMarker) {
        map.__atticCountyLabelMarker.remove();
        map.__atticCountyLabelMarker = null;
    }
}

function showSelectedCountyLabel(map, feature, lngLat) {
    if (!feature) {
        clearSelectedCountyLabel(map);
        return;
    }

    const name = String(feature.properties && feature.properties.NAME || '').trim();
    const state = String(feature.properties && feature.properties.STATE_NAME || '').trim();
    if (!name) {
        clearSelectedCountyLabel(map);
        return;
    }

    let coords = null;
    if (lngLat && Number.isFinite(lngLat.lng) && Number.isFinite(lngLat.lat)) {
        coords = [lngLat.lng, lngLat.lat];
    } else {
        let centerFeature;
        try {
            centerFeature = turf.centerOfMass(feature);
        } catch (_) {
            centerFeature = turf.center(feature);
        }
        coords = centerFeature && centerFeature.geometry && centerFeature.geometry.coordinates;
    }

    if (!Array.isArray(coords) || coords.length < 2) {
        clearSelectedCountyLabel(map);
        return;
    }

    clearSelectedCountyLabel(map);

    const label = document.createElement('div');
    label.className = 'countyNameOverlayLabel';
    label.textContent = state ? `${name} County, ${state}` : `${name} County`;

    map.__atticCountyLabelMarker = new mapboxgl.Marker({
        element: label,
        anchor: 'center',
    })
        .setLngLat(coords)
        .addTo(map);

    map.__atticCountyLabelTimeout = setTimeout(function() {
        clearSelectedCountyLabel(map);
    }, 3000);
}

function ensureCountyLayers(map, data) {
    removeCountyLayers(map);

    map.addSource(SOURCE_ID, {
        type: 'geojson',
        data,
    });

    map.addLayer({
        id: FILL_LAYER_ID,
        type: 'fill',
        source: SOURCE_ID,
        paint: {
            'fill-color': '#7a9bb5',
            'fill-opacity': 0.01,
        },
    });

    map.addLayer({
        id: LINE_LAYER_ID,
        type: 'line',
        source: SOURCE_ID,
        paint: {
            'line-color': '#7a9bb5',
            'line-width': 0.28,
            'line-opacity': 0.52,
        },
    });
}

async function fetchCountyBorders(map) {
    const bounds = map.getBounds();
    const geometry = JSON.stringify({
        xmin: bounds.getWest(),
        ymin: bounds.getSouth(),
        xmax: bounds.getEast(),
        ymax: bounds.getNorth(),
        spatialReference: { wkid: 4326 },
    });

    const params = new URLSearchParams({
        where: '1=1',
        outFields: 'NAME,STATE_NAME',
        returnGeometry: 'true',
        geometry,
        geometryType: 'esriGeometryEnvelope',
        spatialRel: 'esriSpatialRelIntersects',
        inSR: '4326',
        outSR: '4326',
        f: 'geojson',
    });

    const response = await fetch(`${QUERY_URL}?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`County borders error ${response.status}`);
    }
    return response.json();
}

function bindCountyInteractions(map) {
    if (map.__atticCountyBordersInteractive) return;

    map.on('mouseenter', FILL_LAYER_ID, function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseenter', LINE_LAYER_ID, function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', FILL_LAYER_ID, function () {
        map.getCanvas().style.cursor = '';
    });

    map.on('mouseleave', LINE_LAYER_ID, function () {
        map.getCanvas().style.cursor = '';
    });

    map.on('click', function (event) {
        const countyFeatures = map.queryRenderedFeatures(event.point, { layers: [FILL_LAYER_ID, LINE_LAYER_ID] });
        if (countyFeatures.length) {
            showSelectedCountyLabel(map, countyFeatures[0], event.lngLat);
            return;
        }
        clearSelectedCountyLabel(map);
    });

    map.__atticCountyBordersInteractive = true;
}

function addCountyBorders(map) {
    if (!map.__atticCountyBordersToken) {
        map.__atticCountyBordersToken = 0;
    }

    async function updateCountyBorders() {
        const token = ++map.__atticCountyBordersToken;
        try {
            const geojson = await fetchCountyBorders(map);
            if (token !== map.__atticCountyBordersToken) return;
            const safeGeojson = geojson && typeof geojson === 'object' ? geojson : { type: 'FeatureCollection', features: [] };
            ensureCountyLayers(map, safeGeojson);
            bindCountyInteractions(map);
        } catch (_) {
            if (token !== map.__atticCountyBordersToken) return;
            removeCountyLayers(map);
            clearSelectedCountyLabel(map);
        }
    }

    map.__atticCountyBordersUpdate = updateCountyBorders;

    if (!map.__atticCountyBordersBound) {
        map.on('zoomend', function() {
            updateCountyBorders();
        });
        map.on('moveend', function() {
            updateCountyBorders();
        });
        map.__atticCountyBordersBound = true;
    }

    updateCountyBorders();
}

module.exports = addCountyBorders;
