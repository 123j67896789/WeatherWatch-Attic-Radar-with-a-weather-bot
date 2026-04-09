const map = require('../map/map');

function formatCoordinate(value, positiveLabel, negativeLabel) {
    if (!Number.isFinite(value)) {
        return 'Unknown';
    }

    const direction = value >= 0 ? positiveLabel : negativeLabel;
    return `${Math.abs(value).toFixed(2)}° ${direction}`;
}

function setStatusPill(elem, active) {
    if (!elem.length) return;

    elem.text(active ? 'Active' : 'Idle');
    elem.toggleClass('stormGridStatusPill-active', !!active);
}

function syncCheckbox(selector, checked) {
    const elem = $(selector);
    if (!elem.length) return;
    elem.prop('checked', !!checked);
}

function applyMapStyle(style) {
    if (style === 'dark') {
        $('#armrDarkMapBtnSwitchElem').prop('checked', true).trigger('click');
    } else if (style === 'light') {
        $('#armrLightMapBtnSwitchElem').prop('checked', true).trigger('click');
    } else if (style === 'satellite') {
        $('#armrSatelliteMapBtnSwitchElem').prop('checked', true).trigger('click');
    }

    setTimeout(refreshPreview, 20);
}

function readMapCenter() {
    if (!map || !map.getCenter) {
        return 'Unknown';
    }

    const center = map.getCenter();
    return `${formatCoordinate(center.lat, 'N', 'S')} / ${formatCoordinate(center.lng, 'E', 'W')}`;
}

function readStationText() {
    const station = $('#radarStation').text().trim();
    const location = $('#radarLocation').text().trim();
    if (!station && !location) {
        return 'Waiting for radar';
    }

    return `${station || 'Station'}${location ? ` ${location}` : ''}`.trim();
}

function readProductText() {
    const productTrigger = $('#productsDropdownTriggerText').text().trim();
    const radarTime = $('#radarDateTime').text().trim();
    const product = productTrigger || 'No product selected';
    return radarTime ? `${product} · ${radarTime}` : product;
}

function refreshPreview() {
    const stationText = readStationText();
    const productText = readProductText();
    const centerText = readMapCenter();
    const mapStyle = (window.atticData && window.atticData.map_type) ? window.atticData.map_type : 'dark';

    $('#stormGridPreviewStation').text(stationText);
    $('#stormGridPreviewProduct').text(productText);
    $('#stormGridPreviewRadarFocus').text(stationText);
    $('#stormGridPreviewCenter').text(centerText);
    $('#stormGridPreviewMapStyle').text(mapStyle);
    $('#stormGridDockStation').text(stationText);
    $('#stormGridDockProduct').text(productText);
    $('#stormGridDockCenter').text(centerText);
    $('#stormGridSidebarSummary').text(`${stationText} · ${productText}`);

    setStatusPill($('#stormGridPreviewAlerts'), $('#alertMenuItemIcon').hasClass('menu_item_selected'));
    setStatusPill($('#stormGridPreviewFronts'), $('#armrSurfaceFrontsBtnSwitchElem').is(':checked'));
    setStatusPill($('#stormGridPreviewRadio'), $('#armrWeatherRadioBtnSwitchElem').is(':checked'));
    setStatusPill($('#stormGridPreviewTides'), $('#armrTideStationsBtnSwitchElem').is(':checked'));

    $('[data-storm-grid-action="alerts"]').toggleClass('is-active', $('#alertMenuItemIcon').hasClass('menu_item_selected'));
    $('[data-storm-grid-action="fronts"]').toggleClass('is-active', $('#armrSurfaceFrontsBtnSwitchElem').is(':checked'));
    $('[data-storm-grid-action="radio"]').toggleClass('is-active', $('#armrWeatherRadioBtnSwitchElem').is(':checked'));
    $('[data-storm-grid-action="tides"]').toggleClass('is-active', $('#armrTideStationsBtnSwitchElem').is(':checked'));
    $('[data-storm-grid-action="stations"]').toggleClass('is-active', $('#stationMenuItemIcon').hasClass('menu_item_selected'));
    $('[data-storm-grid-action="draw"]').toggleClass('is-active', $('#drawMenuItemIcon').hasClass('menu_item_selected'));
    $('[data-storm-grid-map-style]').removeClass('is-active');
    $(`[data-storm-grid-map-style="${mapStyle}"]`).addClass('is-active');

    syncCheckbox('#stormGridLayerRadar', $('#armrRadarVisBtnSwitchElem').is(':checked'));
    syncCheckbox('#stormGridLayerStormTracks', $('#armrSTVisBtnSwitchElem').is(':checked'));
    syncCheckbox('#stormGridLayerFronts', $('#armrSurfaceFrontsBtnSwitchElem').is(':checked'));
    syncCheckbox('#stormGridLayerRadio', $('#armrWeatherRadioBtnSwitchElem').is(':checked'));
    syncCheckbox('#stormGridLayerTides', $('#armrTideStationsBtnSwitchElem').is(':checked'));
    syncCheckbox('#stormGridLayerWarnings', $('#armrWarningsBtnSwitchElem').is(':checked'));
}

function showPreview() {
    refreshPreview();
    $('#stormGridPreview').fadeIn(150);
    $('body').addClass('stormGridPreviewOpen');
    $('body').addClass('stormGridWorkspacePrimary');
}

function hidePreview() {
    $('#stormGridPreview').fadeOut(150);
    $('body').removeClass('stormGridPreviewOpen');
    $('body').removeClass('stormGridWorkspacePrimary');
}

$('#stormGridPreviewToggle').on('click', function () {
    if ($('#stormGridPreview').is(':visible')) {
        hidePreview();
        return;
    }

    showPreview();
});

$('#stormGridPreviewClose, .stormGridPreviewBackdrop').on('click', function () {
    hidePreview();
});

$('.stormGridPreviewTab').on('click', function () {
    const tab = $(this).attr('data-storm-grid-tab');
    $('.stormGridPreviewTab').removeClass('is-active');
    $(this).addClass('is-active');
    $('.stormGridPreviewSection').removeClass('is-active');
    $(`.stormGridPreviewSection[data-storm-grid-panel="${tab}"]`).addClass('is-active');
    refreshPreview();
});

$('[data-storm-grid-action]').on('click', function () {
    const action = $(this).attr('data-storm-grid-action');

    if (action === 'alerts') {
        $('#alertMenuItemIcon').trigger('click');
    } else if (action === 'fronts') {
        $('#armrSurfaceFrontsBtnSwitchElem').trigger('click');
    } else if (action === 'radio') {
        $('#armrWeatherRadioBtnSwitchElem').trigger('click');
    } else if (action === 'tides') {
        $('#armrTideStationsBtnSwitchElem').trigger('click');
    } else if (action === 'stations') {
        $('#stationMenuItemIcon').trigger('click');
    } else if (action === 'draw') {
        $('#drawMenuItemIcon').trigger('click');
    } else if (action === 'settings') {
        $('#settingsItemClass').trigger('click');
    }

    setTimeout(refreshPreview, 20);
});

$('[data-storm-grid-map-style]').on('click', function () {
    applyMapStyle($(this).attr('data-storm-grid-map-style'));
});

$('#stormGridLayerRadar').on('change', function () {
    $('#armrRadarVisBtnSwitchElem').trigger('click');
    setTimeout(refreshPreview, 20);
});

$('#stormGridLayerStormTracks').on('change', function () {
    $('#armrSTVisBtnSwitchElem').trigger('click');
    setTimeout(refreshPreview, 20);
});

$('#stormGridLayerFronts').on('change', function () {
    $('#armrSurfaceFrontsBtnSwitchElem').trigger('click');
    setTimeout(refreshPreview, 20);
});

$('#stormGridLayerRadio').on('change', function () {
    $('#armrWeatherRadioBtnSwitchElem').trigger('click');
    setTimeout(refreshPreview, 20);
});

$('#stormGridLayerTides').on('change', function () {
    $('#armrTideStationsBtnSwitchElem').trigger('click');
    setTimeout(refreshPreview, 20);
});

$('#stormGridLayerWarnings').on('change', function () {
    $('#armrWarningsBtnSwitchElem').trigger('click');
    setTimeout(refreshPreview, 20);
});

if (map && map.on) {
    map.on('moveend', refreshPreview);
    map.on('zoomend', refreshPreview);
}

setInterval(refreshPreview, 3000);
setTimeout(showPreview, 120);

module.exports = {
    refreshPreview,
};
