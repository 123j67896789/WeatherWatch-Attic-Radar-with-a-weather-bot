mapboxgl.accessToken = 'pk.eyJ1IjoidHdhbGtlcjkyIiwiYSI6ImNtZDkwaHMwdTAyazkya3BzNXphYWI3a2kifQ.sWYO653OYlYHYc_wOHsd2A';
var addCityLabels = require('./city_labels').addCityLabels;
var addCountyBorders = require('./county_borders');
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    zoom: 3,
    center: [-98.5606744, 36.8281576],
    maxZoom: 20,
    preserveDrawingBuffer: true,
    maxPitch: 0,
    fadeDuration: 0,
    attributionControl: false,
    projection: 'mercator',
});

const ut = require('../utils');
ut.setMapMargin('bottom', $('#mapFooter').height(), map);
ut.setMapMargin('top', $('#radarHeader').height(), map);

if (require('../misc/detect_mobile_browser')) {
    const div = document.createElement('div');
    div.className = 'mapFooter';
    $(div).css('z-index', $('#mapFooter').css('z-index') - 1);
    document.body.appendChild(div);

    $('#mapFooter').css('bottom', '5%');
    const offset = $(window).height() * (5 / 100);
    ut.setMapMargin('bottom', offset + $('#mapFooter').height(), map);

    $('.mapFooter').css('justify-content', 'space-evenly');
}

map.on('style.load', function() {
    const layers = map.getStyle().layers || [];

    const borderLayers = layers.filter(function(layer) {
        if (layer.type !== 'line') return false;
        const id = String(layer.id || '').toLowerCase();
        const sourceLayer = String(layer['source-layer'] || '').toLowerCase();
        return (
            id.includes('boundary') ||
            id.includes('border') ||
            sourceLayer.includes('boundary') ||
            sourceLayer.includes('admin')
        );
    });

    for (const layer of borderLayers) {
        const id = layer.id;
        if (!map.getLayer(id)) continue;
        try { map.setFilter(id, null); } catch (e) {}
        try { map.setLayerZoomRange(id, 0, 22); } catch (e) {}
        try { map.setLayoutProperty(id, 'visibility', 'visible'); } catch (e) {}
        try { map.setPaintProperty(id, 'line-color', '#0a1020'); } catch (e) {}
        try { map.setPaintProperty(id, 'line-opacity', 0.95); } catch (e) {}
        try {
            map.setPaintProperty(id, 'line-width', [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 1.6,
                2, 2.2,
                4, 2.8,
                6, 3.2,
                8, 3.6
            ]);
        } catch (e) {}
    }

    addCountyBorders(map);
});

addCityLabels(map);

map.touchZoomRotate.disableRotation();
map.dragRotate.disable();
map.keyboard.disableRotation();

$('#map').on('contextmenu', function(e) {
    if ($(e.target).hasClass('mapboxgl-canvas')) {
        e.preventDefault();
    }
});

setTimeout(() => map.resize(), 0);
window.addEventListener('resize', function() {
    map.resize();
});

document.getElementById('texturecolorbar').width = 0;
document.getElementById('texturecolorbar').height = 0;

module.exports = map;
