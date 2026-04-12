const turf = require('@turf/turf');
const ut = require('../../core/utils');
const map = require('../../core/map/map');
const get_station_status = require('./get_station_status');
const set_layer_order = require('../../core/map/setLayerOrder');
const icons = require('../../core/map/icons/icons');

const NEXRADLevel2File = require('../libnexrad/level2/level2_parser');
const Level2Factory = require('../libnexrad/level2/level2_factory');

const NEXRADLevel3File = require('../libnexrad/level3/level3_parser');
const Level3Factory = require('../libnexrad/level3/level3_factory');

const loaders_nexrad = require('../libnexrad/loaders_nexrad');
const nexrad_locations = require('../libnexrad/nexrad_locations').NEXRAD_LOCATIONS;

function _copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function _point_in_bounds(lat, lon, bounds, paddingDegrees) {
    return (
        lat <= bounds.north + paddingDegrees &&
        lat >= bounds.south - paddingDegrees &&
        lon <= bounds.east + paddingDegrees &&
        lon >= bounds.west - paddingDegrees
    );
}

function _get_station_padding_for_zoom(zoom) {
    if (zoom < 4) return 8;
    if (zoom < 6) return 5;
    if (zoom < 8) return 3;
    return 1.5;
}

function do_when_map_load(func) {
    setTimeout(function() {
        if (map.loaded()) {
            func();
        } else {
            map.on('load', function() {
                func();
            })
        }
    }, 0)
}

/**
 * Helper function that generates a geojson object from a simple object with radar station data.
 * 
 * @param {Object} status_info OPTIONAL - An object containing the status of each radar station, from the "get_station_status" function.
 * @returns {Object} A geojson object containing the radar station data.
 */
function _generate_stations_geojson(status_info = null) {
    var points = [];
    const zoom = map.getZoom();
    const bounds = map.getBounds();
    const paddedBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
    };
    const paddingDegrees = _get_station_padding_for_zoom(zoom);

    for (var station in nexrad_locations) {
        if (station != 'KLIX') {
            if (nexrad_locations[station].NONSTANDARD == undefined || nexrad_locations[station].NONSTANDARD == false) {
                if (nexrad_locations[station].type == 'WSR-88D' || nexrad_locations[station].type == 'TDWR') {
                    const lat = nexrad_locations[station].lat;
                    const lon = nexrad_locations[station].lon;
                    if (!_point_in_bounds(lat, lon, paddedBounds, paddingDegrees)) {
                        continue;
                    }

                    const station_properties = _copy(nexrad_locations[station]);
                    station_properties.station_id = station;
                    const splitLabel = icons.split_station_label(station);
                    station_properties.label_top = splitLabel[0];
                    station_properties.label_bottom = splitLabel[1];
                    if (status_info != null) {
                        station_properties.status = status_info[station]?.status;
                    }

                    const point = turf.point([lon, lat], station_properties);
                    if (nexrad_locations[station].type == 'WSR-88D') {
                        point.properties.order = 1;
                    } else {
                        point.properties.order = 2;
                    }
                    points.push(point);
                }
            }
        }
    }
    const feature_collection = turf.featureCollection(points);
    return feature_collection;
}

/**
 * Helper function that adds the radar station layer to the map.
 * 
 * @param {Object} radar_stations_geojson A geojson object containing the radar station data. Comes from the "_generate_stations_geojson" function.
 * @param {Function} callback A callback function.
 */
function _add_stations_layer(radar_stations_geojson, callback) {
    icons.add_icon_svg([
        [icons.create_station_mark_icon({
            ring: '#1e6b1e',
            wave: '#4dff4d',
            glow: 'rgba(77, 255, 77, 0.15)',
        }), 'station_mark_normal'],
        [icons.create_station_mark_icon({
            ring: '#2a9e2a',
            wave: '#90ff90',
            glow: 'rgba(144, 255, 144, 0.30)',
        }), 'station_mark_selected'],
        [icons.create_station_mark_icon({
            ring: '#ff6d74',
            wave: '#ff9aa0',
            glow: 'rgba(255, 109, 116, 0.28)',
        }), 'station_mark_down'],
        [icons.create_station_mark_icon({
            ring: '#d68a2a',
            wave: '#ffcf7f',
            glow: 'rgba(214, 138, 42, 0.28)',
        }), 'station_mark_tdwr'],
    ], () => {
        map.addSource('stationSymbolLayer', {
            'type': 'geojson',
            'generateId': true,
            'data': radar_stations_geojson
        });

        map.addLayer({
            'id': 'stationSymbolLayer',
            'type': 'symbol',
            'source': 'stationSymbolLayer',
            'minzoom': 3,
            'layout': {
                'symbol-sort-key': ['get', 'order'],
                'icon-image': [
                    'case',
                    ['==', ['get', 'clicked'], 'yes'],
                    'station_mark_selected',
                    ['==', ['get', 'status'], 'down'],
                    'station_mark_down',
                    ['==', ['get', 'type'], 'TDWR'],
                    'station_mark_tdwr',
                    'station_mark_normal'
                ],
                'icon-size': [
                    'case',
                    ['==', ['get', 'type'], 'TDWR'],
                    ['interpolate', ['linear'], ['zoom'], 3, 0, 5.5, 0.2, 8, 0.28, 12, 0.34],
                    ['interpolate', ['linear'], ['zoom'], 3, 0.18, 5, 0.24, 8, 0.32, 12, 0.38]
                ],
                'icon-anchor': 'center',
                'icon-allow-overlap': false,
                'text-field': '',
            },
        });

        map.addLayer({
            'id': 'stationLabelLayer',
            'type': 'symbol',
            'source': 'stationSymbolLayer',
            'layout': {
                'symbol-sort-key': ['get', 'order'],
                'text-field': ['get', 'station_id'],
                'text-size': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    3, 10,
                    5, 10,
                    7, 12,
                    10, 14
                ],
                'text-font': ['Arial Unicode MS Bold'],
                'text-anchor': 'left',
                'text-offset': [1.8, 0],
                'text-allow-overlap': false,
            },
            'paint': {
                'text-color': '#ffffff',
                'text-halo-color': '#b71c1c',
                'text-halo-width': 3.5,
                'text-halo-blur': 0.2,
            }
        });

        get_station_status((data) => {
            window.atticData.radar_station_status = data;
            const statusified_geojson = _generate_stations_geojson(data);
            map.getSource('stationSymbolLayer').setData(statusified_geojson);
        });

        map.__atticStationsRefresh = function() {
            const currentStatus = window.atticData && window.atticData.radar_station_status
                ? window.atticData.radar_station_status
                : null;
            const refreshedGeojson = _generate_stations_geojson(currentStatus);
            const stationSource = map.getSource('stationSymbolLayer');
            if (stationSource) {
                stationSource.setData(refreshedGeojson);
            }
        };

        if (!map.__atticStationsViewportBound) {
            map.on('moveend', function() {
                if (typeof map.__atticStationsRefresh === 'function') {
                    map.__atticStationsRefresh();
                }
            });
            map.on('zoomend', function() {
                if (typeof map.__atticStationsRefresh === 'function') {
                    map.__atticStationsRefresh();
                }
            });
            map.__atticStationsViewportBound = true;
        }

        set_layer_order();
        callback();
    });
}

/**
 * Code that executes when the mouse enters a station's bubble
 */
function mouse_over() {
    map.getCanvas().style.cursor = 'pointer';
}
/**
 * Code that executes when the mouse leaves a station's bubble
 */
function mouse_out() {
    map.getCanvas().style.cursor = '';
}

function mouse_move(e) {
    const station = e.features[0].properties.station_id;
    const geojson = map.getSource('stationSymbolLayer')._data;
    for (var i in geojson.features) {
        if (geojson.features[i].properties.station_id == station) {
            geojson.features[i].properties.clicked = 'yes';
        } else {
            geojson.features[i].properties.clicked = 'no';
        }
    }
    map.getSource('stationSymbolLayer').setData(geojson);
}

function select_station_from_feature(featureProperties) {
    const clickedStation = featureProperties.station_id;
    window.atticData.currentStation = clickedStation;
    $('#radarStation').html(clickedStation);
    $('#radarLocation').html(nexrad_locations[clickedStation].name);
    $('#radarHeaderPagesBtn').css('display', 'inline-flex');
    const stationType = featureProperties.type;
    window.atticData.L2_file_id = '';

    var productToLoad;
    var abbvProductToLoad;
    if (stationType == 'WSR-88D') {
        $('#wsr88d_psm').show();
        $('#tdwr_psm').hide();
        $('#level2_psm').hide();

        productToLoad = 'N0B';
        abbvProductToLoad = 'ref';
        $('#productsDropdownTriggerText').html(window.longProductNames[abbvProductToLoad]);
    } else if (stationType == 'TDWR') {
        $('#wsr88d_psm').hide();
        $('#tdwr_psm').show();
        $('#level2_psm').hide();

        productToLoad = 'TZ0';
        abbvProductToLoad = 'sr-ref';
        $('#productsDropdownTriggerText').html(window.longProductNames[abbvProductToLoad]);
    }

    $('#radarInfoSpan').show();

    window.atticData.from_file_upload = false;
    loaders_nexrad.quick_level_3_plot(clickedStation, productToLoad, (L3Factory) => {});
}

function handle_station_click(e) {
    mouse_move(e);
    select_station_from_feature(e.features[0].properties);
}

/**
 * Function that enables all mouse-related event listeners for the radar station layer
 */
function _enable_mouse_listeners() {
    map.on('mouseover', 'stationSymbolLayer', mouse_over);
    map.on('mouseout', 'stationSymbolLayer', mouse_out);
    map.on('click', 'stationSymbolLayer', mouse_move);
    map.on('mouseover', 'stationLabelLayer', mouse_over);
    map.on('mouseout', 'stationLabelLayer', mouse_out);
    map.on('click', 'stationLabelLayer', mouse_move);
}
/**
 * Function that disables all mouse-related event listeners for the radar station layer
 */
function _disable_mouse_listeners() {
    map.off('mouseover', 'stationSymbolLayer', mouse_over);
    map.off('mouseout', 'stationSymbolLayer', mouse_out);
    map.off('click', 'stationSymbolLayer', mouse_move);
    map.off('mouseover', 'stationLabelLayer', mouse_over);
    map.off('mouseout', 'stationLabelLayer', mouse_out);
    map.off('click', 'stationLabelLayer', mouse_move);
}

/**
 * Initialize the mouse listeners for the first time.
 */
function _init_mouse_listeners() {
    _enable_mouse_listeners();
}
/**
 * Initialize the click listener for the first time.
 */
function _init_click_listener() {
    map.on('click', 'stationSymbolLayer', handle_station_click);
    map.on('click', 'stationLabelLayer', handle_station_click);
}


/**
 * Main function.
 */
function showStations() {
    const radar_stations_geojson = _generate_stations_geojson();

    _add_stations_layer(radar_stations_geojson, () => {
        _init_mouse_listeners();
        _init_click_listener();
    });
}

module.exports = showStations;
