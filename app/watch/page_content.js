/*
 * page_content.js
 * Native page implementations for AtticRadar's pages shell.
 * Each tab (fronts, alerts, reports, risk, lightning, ai, timezones,
 * chase, outlooks, hazcams, xweather, premium, about, updates,
 * instructions, websites) is implemented here.
 */

// ---------------------------------------------------------------------------
// Shared state
// ---------------------------------------------------------------------------
let _timer   = null;   // interval handle for clock/stopwatch pages
let _currentContainer = null;

function unmount() {
    clearInterval(_timer);
    _timer = null;
    if (_currentContainer) {
        $(_currentContainer).off('.pg');
        _currentContainer = null;
    }
}

function mount(key, container) {
    unmount();
    _currentContainer = container;
    const $c = $(container);
    const impl = PAGE_IMPLS[key];
    if (impl) {
        impl($c);
    } else {
        $c.html(pgError('Unknown page: ' + key));
    }
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------
function esc(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function pgLoading(msg) {
    return '<div class="pgLoading">' + esc(msg || 'Loading...') + '</div>';
}

function pgError(msg) {
    return '<div class="pgError">' + esc(msg) + '</div>';
}

function pgWrap(inner, extraClass) {
    return '<div class="pgWrap' + (extraClass ? ' ' + extraClass : '') + '">' + inner + '</div>';
}

function pgBar(left, right) {
    return '<div class="pgBar">' +
        '<div class="pgBarLeft">' + left + '</div>' +
        '<div class="pgBarRight">' + (right || '') + '</div>' +
    '</div>';
}

function pgCard(title, body, badge) {
    return '<div class="pgCard">' +
        (title ? '<div class="pgCardTitle">' + title + (badge ? ' <span class="pgBadge">' + badge + '</span>' : '') + '</div>' : '') +
        '<div class="pgCardBody">' + body + '</div>' +
    '</div>';
}

function pgExternalLink(href, label) {
    return '<a class="pgExtLink" href="' + esc(href) + '" target="_blank" rel="noreferrer">' + esc(label) + '</a>';
}

function pgToggleBtn(id, label, isActive) {
    return '<button class="pgToggleBtn' + (isActive ? ' pgToggleBtnActive' : '') + '" id="' + id + '">' + label + '</button>';
}

function isToggleOn(selector) {
    return $(selector).is(':checked') || $(selector).hasClass('menu_item_selected');
}

function doToggle(selector) {
    const $el = $(selector);
    if ($el.length) $el.trigger('click');
}

function formatTime(ms) {
    var h   = Math.floor(ms / 3600000);
    var m   = Math.floor((ms % 3600000) / 60000);
    var s   = Math.floor((ms % 60000) / 1000);
    var cs  = Math.floor((ms % 1000) / 100);
    return (h ? String(h).padStart(2, '0') + ':' : '') +
        String(m).padStart(2, '0') + ':' +
        String(s).padStart(2, '0') + '.' + cs;
}

async function safeFetch(url, opts) {
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), 12000);
    try {
        const res = await fetch(url, Object.assign({ signal: controller.signal }, opts || {}));
        clearTimeout(to);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res;
    } catch (e) {
        clearTimeout(to);
        throw e;
    }
}

// ---------------------------------------------------------------------------
// FRONTS
// ---------------------------------------------------------------------------
function mountFronts($c) {
    const active = isToggleOn('#armrSurfaceFrontsBtnSwitchElem');
    $c.html(pgWrap(
        pgBar(
            '<span class="pgBarTitle">Surface Fronts</span>' +
            '<span class="pgBarSub">WPC Surface Analysis</span>',
            pgToggleBtn('pgFrontsToggle', active ? 'Fronts: ON' : 'Fronts: OFF', active)
        ) +
        '<div class="pgScrollBody">' +
            '<div class="pgImageSection">' +
                '<img class="pgAnalysisImg" src="https://www.wpc.ncep.noaa.gov/noaa/noaasfc.gif" ' +
                     'alt="WPC Surface Analysis" loading="lazy">' +
                '<div class="pgImageCaption">WPC Surface Analysis — updates every hour</div>' +
            '</div>' +
            '<div class="pgLinkRow">' +
                pgExternalLink('https://www.wpc.ncep.noaa.gov/html/sfc2.shtml', 'WPC Surface Analysis') +
                pgExternalLink('https://www.wpc.ncep.noaa.gov/html/sfc3.shtml', '24h Forecast') +
                pgExternalLink('https://www.wpc.ncep.noaa.gov/html/sfc4.shtml', '48h Forecast') +
                pgExternalLink('https://forecast.weather.gov/MapClick.php?CityName=US&state=&site=&textField1=&textField2=', 'Local Forecast') +
            '</div>' +
        '</div>'
    ));

    $c.on('click.pg', '#pgFrontsToggle', function() {
        doToggle('#armrSurfaceFrontsBtnSwitchElem');
        setTimeout(function() {
            var on = isToggleOn('#armrSurfaceFrontsBtnSwitchElem');
            $('#pgFrontsToggle').text(on ? 'Fronts: ON' : 'Fronts: OFF').toggleClass('pgToggleBtnActive', on);
        }, 50);
    });
}

// ---------------------------------------------------------------------------
// ALERTS
// ---------------------------------------------------------------------------
var ALERT_CATS = [
    { key: 'TOR',       label: 'Tornado Warnings',              color: '#ef4444', test: function(e) { return /tornado warning/i.test(e); } },
    { key: 'SVR',       label: 'Severe T-Storm Warnings',       color: '#f97316', test: function(e) { return /severe thunderstorm warning/i.test(e); } },
    { key: 'FFW',       label: 'Flash Flood Warnings',          color: '#84cc16', test: function(e) { return /flash flood (warning|emergency)/i.test(e); } },
    { key: 'TOR_W',     label: 'Tornado Watches',               color: '#22c55e', test: function(e) { return /tornado watch/i.test(e); } },
    { key: 'SVR_W',     label: 'Severe T-Storm Watches',        color: '#22c55e', test: function(e) { return /severe thunderstorm watch/i.test(e); } },
    { key: 'WIN',       label: 'Winter Warnings',               color: '#a78bfa', test: function(e) { return /blizzard|winter storm warning|ice storm/i.test(e); } },
    { key: 'OTHER',     label: 'Other Alerts',                  color: '#94a3b8', test: function() { return true; } },
];

function classifyAlert(event) {
    for (var i = 0; i < ALERT_CATS.length - 1; i++) {
        if (ALERT_CATS[i].test(event)) return ALERT_CATS[i];
    }
    return ALERT_CATS[ALERT_CATS.length - 1];
}

async function mountAlerts($c) {
    var alertsOn = isToggleOn('#alertMenuItemIcon');
    $c.html(pgWrap(
        pgBar(
            '<span class="pgBarTitle">Active Alerts</span><span class="pgBarSub">Fetching from NWS...</span>',
            pgToggleBtn('pgAlertsMapToggle', alertsOn ? 'Map: ON' : 'Map: OFF', alertsOn) +
            '<button class="wwBtn" id="pgAlertsRefresh">Refresh</button>'
        ) +
        '<div class="pgScrollBody" id="pgAlertsList">' + pgLoading('Fetching active NWS alerts...') + '</div>'
    ));

    $c.on('click.pg', '#pgAlertsMapToggle', function() {
        doToggle('#alertMenuItemIcon');
        setTimeout(function() {
            var on = isToggleOn('#alertMenuItemIcon');
            $('#pgAlertsMapToggle').text(on ? 'Map: ON' : 'Map: OFF').toggleClass('pgToggleBtnActive', on);
        }, 50);
    });
    $c.on('click.pg', '#pgAlertsRefresh', function() {
        loadAlerts($c);
    });

    loadAlerts($c);
}

async function loadAlerts($c) {
    $('#pgAlertsList').html(pgLoading('Fetching active NWS alerts...'));
    try {
        var res  = await safeFetch('https://api.weather.gov/alerts/active?status=actual&limit=500');
        var data = await res.json();
        renderAlerts($c, data.features || []);
    } catch (e) {
        $('#pgAlertsList').html(pgError('Failed to load alerts: ' + e.message));
    }
}

function renderAlerts($c, features) {
    // Update subtitle
    $c.find('.pgBarSub').text(features.length + ' active NWS alert' + (features.length !== 1 ? 's' : ''));

    // Bucket by category
    var buckets = {};
    ALERT_CATS.forEach(function(cat) { buckets[cat.key] = []; });

    features.forEach(function(f) {
        var event = (f.properties || {}).event || '';
        var cat   = classifyAlert(event);
        var alreadyBucketed = ALERT_CATS.slice(0, -1).some(function(c) {
            if (c.key !== 'OTHER' && c !== cat) return false;
            return buckets[c.key].indexOf(f) >= 0;
        });
        if (!alreadyBucketed) {
            buckets[cat.key].push(f);
        }
    });

    // Rebuild: assign each feature to first matching non-OTHER bucket
    ALERT_CATS.forEach(function(cat) { buckets[cat.key] = []; });
    features.forEach(function(f) {
        var event = (f.properties || {}).event || '';
        var cat   = classifyAlert(event);
        buckets[cat.key].push(f);
    });

    if (features.length === 0) {
        $('#pgAlertsList').html('<div class="pgEmpty"><div class="pgEmptyTitle">No active alerts</div><div class="pgEmptySub">The NWS is not reporting any active alerts at this time.</div></div>');
        return;
    }

    var html = '';
    ALERT_CATS.forEach(function(cat) {
        var list = buckets[cat.key];
        if (!list.length) return;
        html += '<div class="pgAlertGroup">' +
            '<div class="pgAlertGroupHeader" style="border-left-color:' + cat.color + '">' +
                '<span class="pgAlertGroupTitle">' + esc(cat.label) + '</span>' +
                '<span class="pgAlertCount" style="background:' + cat.color + '">' + list.length + '</span>' +
            '</div>';
        list.slice(0, 30).forEach(function(f) {
            var p    = f.properties || {};
            var exp  = p.expires ? new Date(p.expires).toLocaleString() : '—';
            html += '<div class="pgAlertItem">' +
                '<div class="pgAlertEvent" style="color:' + cat.color + '">' + esc(p.event || '—') + '</div>' +
                '<div class="pgAlertHeadline">' + esc(p.headline || p.description || '').slice(0, 160) + '</div>' +
                '<div class="pgAlertMeta">' + esc((p.areaDesc || '').slice(0, 80)) + ' — expires ' + esc(exp) + '</div>' +
            '</div>';
        });
        if (list.length > 30) {
            html += '<div class="pgAlertMore">+ ' + (list.length - 30) + ' more ' + cat.label.toLowerCase() + '</div>';
        }
        html += '</div>';
    });

    $('#pgAlertsList').html(html);
}

// ---------------------------------------------------------------------------
// REPORTS
// ---------------------------------------------------------------------------
var REPORT_TYPES = {
    'Tornado':                 { color: '#ef4444',  short: 'TOR' },
    'Funnel Cloud':            { color: '#f97316',  short: 'FUN' },
    'TSTM WND GST':           { color: '#60a5fa',  short: 'WND' },
    'TSTM WND DMG':           { color: '#60a5fa',  short: 'DMG' },
    'Hail':                    { color: '#4ade80',  short: 'HAI' },
    'Flash Flood':             { color: '#22d3ee',  short: 'FLD' },
    'Flood':                   { color: '#22d3ee',  short: 'FLD' },
    'Snow':                    { color: '#a5b4fc',  short: 'SNW' },
    'Blizzard':                { color: '#a5b4fc',  short: 'BLZ' },
};

function reportStyle(type) {
    return REPORT_TYPES[type] || { color: '#94a3b8', short: type ? type.slice(0, 3).toUpperCase() : '???' };
}

async function mountReports($c) {
    $c.html(pgWrap(
        pgBar(
            '<span class="pgBarTitle">Storm Reports</span><span class="pgBarSub">Past 24 hours — Iowa State IEM</span>',
            '<input class="wwSearchInput" id="pgReportsSearch" placeholder="Search..." style="width:130px">' +
            '<button class="wwBtn" id="pgReportsRefresh">Refresh</button>'
        ) +
        '<div class="pgScrollBody" id="pgReportsList">' + pgLoading('Fetching storm reports...') + '</div>'
    ));

    $c.on('input.pg', '#pgReportsSearch', function() {
        filterReports($(this).val());
    });
    $c.on('click.pg', '#pgReportsRefresh', function() {
        loadReports($c);
    });

    loadReports($c);
}

var _cachedReports = [];

async function loadReports($c) {
    $('#pgReportsList').html(pgLoading('Fetching storm reports...'));
    try {
        var res  = await safeFetch('/api/reports');
        var data = await res.json();
        _cachedReports = data.reports || [];
        renderReports(_cachedReports, '');
        $c.find('.pgBarSub').text(_cachedReports.length + ' reports in past 24h');
    } catch (e) {
        $('#pgReportsList').html(pgError('Failed to load reports: ' + e.message +
            '. Make sure server.cjs is running (npm start).'));
    }
}

function filterReports(query) {
    var q = (query || '').trim().toLowerCase();
    var filtered = q
        ? _cachedReports.filter(function(r) {
            return r.type.toLowerCase().includes(q) ||
                   (r.city || '').toLowerCase().includes(q) ||
                   (r.state || '').toLowerCase().includes(q) ||
                   (r.remark || '').toLowerCase().includes(q);
          })
        : _cachedReports;
    renderReports(filtered, query);
}

function renderReports(reports, query) {
    if (!reports.length) {
        $('#pgReportsList').html('<div class="pgEmpty"><div class="pgEmptyTitle">No reports' +
            (query ? ' matching "' + esc(query) + '"' : '') + '</div></div>');
        return;
    }

    // Count by type
    var counts = {};
    reports.forEach(function(r) {
        counts[r.type] = (counts[r.type] || 0) + 1;
    });

    var summary = Object.keys(counts)
        .sort(function(a, b) { return counts[b] - counts[a]; })
        .slice(0, 6)
        .map(function(t) {
            var s = reportStyle(t);
            return '<span class="pgReportBadge" style="background:' + s.color + '25;color:' + s.color + ';border-color:' + s.color + '40">' +
                esc(s.short) + ' ' + counts[t] + '</span>';
        }).join('');

    var rows = reports.slice(0, 200).map(function(r) {
        var s   = reportStyle(r.type);
        var loc = [r.city, r.county, r.state].filter(Boolean).join(', ');
        var ts  = r.valid ? r.valid.slice(0, 4) + '-' + r.valid.slice(4, 6) + '-' + r.valid.slice(6, 8) +
                           ' ' + r.valid.slice(8, 10) + ':' + r.valid.slice(10, 12) + 'Z' : '';
        return '<div class="pgReportItem">' +
            '<span class="pgReportType" style="background:' + s.color + '20;color:' + s.color + ';border-color:' + s.color + '40">' + esc(s.short) + '</span>' +
            '<div class="pgReportBody">' +
                '<div class="pgReportTypeFull">' + esc(r.type) + '</div>' +
                '<div class="pgReportLoc">' + esc(loc) + (ts ? ' <span class="pgReportTime">' + esc(ts) + '</span>' : '') + '</div>' +
                (r.remark ? '<div class="pgReportRemark">' + esc(r.remark.slice(0, 120)) + '</div>' : '') +
            '</div>' +
        '</div>';
    }).join('');

    $('#pgReportsList').html(
        '<div class="pgReportSummary">' + summary + '</div>' +
        rows +
        (reports.length > 200 ? '<div class="pgAlertMore">Showing 200 of ' + reports.length + ' reports</div>' : '')
    );
}

// ---------------------------------------------------------------------------
// RISK
// ---------------------------------------------------------------------------
var SPC_RISK_LEVELS = [
    { dn: 0,  label: 'General Thunderstorms', abbr: 'TSTM', color: '#c8f5c8' },
    { dn: 1,  label: 'Marginal Risk',         abbr: 'MRGL', color: '#7fc57f' },
    { dn: 2,  label: 'Slight Risk',           abbr: 'SLGT', color: '#f6f67f' },
    { dn: 3,  label: 'Enhanced Risk',         abbr: 'ENH',  color: '#e6a23e' },
    { dn: 4,  label: 'Moderate Risk',         abbr: 'MDT',  color: '#e63e3e' },
    { dn: 5,  label: 'High Risk',             abbr: 'HIGH', color: '#ff00ff' },
];

function riskByDN(dn) {
    return SPC_RISK_LEVELS.find(function(r) { return r.dn === dn; }) || SPC_RISK_LEVELS[0];
}

async function mountRisk($c) {
    $c.html(pgWrap(
        pgBar(
            '<span class="pgBarTitle">Convective Risk</span><span class="pgBarSub">SPC Convective Outlook</span>',
            '<button class="wwBtn" id="pgRiskRefresh">Refresh</button>'
        ) +
        '<div class="pgScrollBody" id="pgRiskBody">' + pgLoading('Loading SPC outlook...') + '</div>'
    ));
    $c.on('click.pg', '#pgRiskRefresh', function() { loadRisk($c); });
    loadRisk($c);
}

async function loadRisk($c) {
    var $body = $('#pgRiskBody');
    $body.html(pgLoading('Loading SPC outlook...'));

    try {
        var res  = await safeFetch('https://www.spc.noaa.gov/products/outlook/day1otlk_cat.nolyr.geojson');
        var data = await res.json();
        renderRisk($body, data, 1);
    } catch (e) {
        // CORS or network fail — fall back to image display
        renderRiskImage($body);
    }
}

function renderRisk($body, data, day) {
    var features  = (data && data.features) || [];
    var maxRisk   = { dn: -1 };
    features.forEach(function(f) {
        var dn = parseInt((f.properties || {}).DN || 0);
        if (dn > maxRisk.dn) maxRisk = { dn: dn, label: (f.properties || {}).LABEL2 || '' };
    });

    var risk = maxRisk.dn >= 0 ? riskByDN(maxRisk.dn) : null;
    var riskHtml = risk
        ? '<div class="pgRiskGauge" style="border-color:' + risk.color + '">' +
              '<div class="pgRiskAbbr" style="color:' + risk.color + '">' + risk.abbr + '</div>' +
              '<div class="pgRiskLabel">' + risk.label + '</div>' +
              '<div class="pgRiskSub">Highest Day ' + day + ' risk on outlook</div>' +
          '</div>'
        : '<div class="pgRiskGauge"><div class="pgRiskAbbr" style="color:#94a3b8">NONE</div>' +
          '<div class="pgRiskLabel">No severe weather outlook</div></div>';

    var scaleHtml = SPC_RISK_LEVELS.slice(1).map(function(r) {
        return '<div class="pgRiskScaleItem" style="background:' + r.color + '18;border-left:3px solid ' + r.color + '">' +
            '<span class="pgRiskScaleAbbr" style="color:' + r.color + '">' + r.abbr + '</span>' +
            '<span class="pgRiskScaleLabel">' + r.label + '</span>' +
        '</div>';
    }).join('');

    $body.html(
        riskHtml +
        '<div class="pgSection">' +
            '<div class="pgSectionTitle">Risk Scale</div>' +
            '<div class="pgRiskScale">' + scaleHtml + '</div>' +
        '</div>' +
        '<div class="pgSection">' +
            '<div class="pgSectionTitle">Day 1 Outlook Map</div>' +
            '<img class="pgAnalysisImg" src="https://www.spc.noaa.gov/products/outlook/day1otlk.gif?cb=' + Date.now() + '" alt="SPC Day 1 Outlook">' +
        '</div>' +
        '<div class="pgLinkRow">' +
            pgExternalLink('https://www.spc.noaa.gov/products/outlook/', 'SPC Outlooks') +
            pgExternalLink('https://www.spc.noaa.gov/climo/reports/today.html', 'Today\'s Reports') +
        '</div>'
    );
}

function renderRiskImage($body) {
    $body.html(
        '<div class="pgSection">' +
            '<div class="pgSectionTitle">SPC Day 1 Convective Outlook</div>' +
            '<img class="pgAnalysisImg" src="https://www.spc.noaa.gov/products/outlook/day1otlk.gif?cb=' + Date.now() + '" alt="SPC Day 1 Outlook">' +
        '</div>' +
        '<div class="pgLinkRow">' +
            pgExternalLink('https://www.spc.noaa.gov/products/outlook/', 'Full SPC Outlooks') +
        '</div>'
    );
}

// ---------------------------------------------------------------------------
// LIGHTNING
// ---------------------------------------------------------------------------
function mountLightning($c) {
    var on = isToggleOn('#armrLightningVisBtnSwitchElem');
    $c.html(pgWrap(
        pgBar(
            '<span class="pgBarTitle">Lightning</span><span class="pgBarSub">Real-time strike data</span>',
            pgToggleBtn('pgLightningToggle', on ? 'Lightning: ON' : 'Lightning: OFF', on)
        ) +
        '<div class="pgScrollBody">' +
            '<div class="pgSection">' +
                '<div class="pgSectionTitle">Live Lightning Map</div>' +
                '<img class="pgAnalysisImg" ' +
                     'src="https://radar.weather.gov/ridge/lite/N0R/TLX_0.png" ' +
                     'alt="Lightning coverage map" loading="lazy">' +
                '<div class="pgImageCaption">NOAA Radar composite — lightning overlaid on map</div>' +
            '</div>' +
            '<div class="pgSection">' +
                '<div class="pgSectionTitle">Lightning Resources</div>' +
                '<div class="pgLinkRow">' +
                    pgExternalLink('https://www.blitzortung.org/en/live_lightning_maps.php', 'Blitzortung Live Map') +
                    pgExternalLink('https://www.lightningmaps.org/', 'LightningMaps.org') +
                    pgExternalLink('https://nowcoast.noaa.gov/', 'NOAA NowCOAST') +
                    pgExternalLink('https://www.weather.gov/safety/lightning', 'NWS Lightning Safety') +
                '</div>' +
            '</div>' +
            pgCard('About Lightning Data',
                'AtticRadar displays real-time lightning density from the NOAA NowCOAST WMS service. ' +
                'Toggle the lightning layer with the button above to overlay strike data on the radar map.') +
        '</div>'
    ));

    $c.on('click.pg', '#pgLightningToggle', function() {
        doToggle('#armrLightningVisBtnSwitchElem');
        setTimeout(function() {
            var nowOn = isToggleOn('#armrLightningVisBtnSwitchElem');
            $('#pgLightningToggle').text(nowOn ? 'Lightning: ON' : 'Lightning: OFF').toggleClass('pgToggleBtnActive', nowOn);
        }, 50);
    });
}

// ---------------------------------------------------------------------------
// AI
// ---------------------------------------------------------------------------
async function mountAI($c) {
    var context = buildWeatherContext();
    $c.html(pgWrap(
        pgBar(
            '<span class="pgBarTitle">Weather AI</span><span class="pgBarSub">Ask a weather question</span>'
        ) +
        '<div class="pgScrollBody">' +
            pgCard('Current Context',
                '<div class="pgAIContext">' + esc(context) + '</div>') +
            '<div class="pgSection">' +
                '<div class="pgSectionTitle">Ask a Question</div>' +
                '<div class="pgAIInputRow">' +
                    '<textarea class="pgAIInput" id="pgAIInput" placeholder="Ask about current weather, radar interpretation, storm hazards..."></textarea>' +
                    '<button class="wwBtn" id="pgAISubmit">Ask</button>' +
                '</div>' +
                '<div id="pgAIResponse" class="pgAIResponse"></div>' +
            '</div>' +
            '<div class="pgSection">' +
                '<div class="pgSectionTitle">AI Weather Tools</div>' +
                '<div class="pgLinkRow">' +
                    pgExternalLink('https://chat.openai.com/', 'ChatGPT') +
                    pgExternalLink('https://claude.ai/', 'Claude') +
                    pgExternalLink('https://www.weather.gov/media/owlie/NWS_WFO_Discussion.pdf', 'NWS AFD Guide') +
                '</div>' +
            '</div>' +
        '</div>'
    ));

    $c.on('click.pg', '#pgAISubmit', function() { submitAIQuestion($c); });
    $c.on('keydown.pg', '#pgAIInput', function(e) {
        if (e.ctrlKey && e.key === 'Enter') submitAIQuestion($c);
    });
}

function buildWeatherContext() {
    var station = $('#radarStation').text().trim() || '—';
    var product = $('#productsDropdownTriggerText').text().trim() || '—';
    var time    = $('#radarDateTime').text().trim() || '—';
    return 'Station: ' + station + '\nProduct: ' + product + '\nTime: ' + time;
}

async function submitAIQuestion($c) {
    var question = $('#pgAIInput').val().trim();
    if (!question) return;
    var $resp = $('#pgAIResponse');
    $resp.html('<div class="pgLoading">Thinking...</div>');

    var context = buildWeatherContext();
    var payload = {
        messages: [
            { role: 'system', content: 'You are a helpful weather assistant. Current radar context:\n' + context },
            { role: 'user', content: question }
        ]
    };

    try {
        var res = await safeFetch('/api/weather-ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        var data = await res.json();
        var answer = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
            || data.response || data.message || JSON.stringify(data);
        $resp.html('<div class="pgAIAnswer">' + esc(answer) + '</div>');
    } catch (e) {
        $resp.html('<div class="pgError">AI service not available. Try ChatGPT or Claude for weather questions. (' + esc(e.message) + ')</div>');
    }
}

// ---------------------------------------------------------------------------
// TIMEZONES
// ---------------------------------------------------------------------------
function mountTimezones($c) {
    $c.html(pgWrap(
        pgBar('<span class="pgBarTitle">Timezones & Clock</span>'),
        'pgStaticWrap'
    ) +
    '<div class="pgScrollBody">' +
        '<div class="pgSection pgClockSection">' +
            '<div class="pgClockLabel">UTC / Zulu Time</div>' +
            '<div class="pgClock" id="pgUtcClock">--:--:-- UTC</div>' +
            '<div class="pgClockLabel" style="margin-top:12px">Local Time</div>' +
            '<div class="pgClockSub" id="pgLocalClock">--:--:--</div>' +
        '</div>' +
        '<div class="pgSection">' +
            '<div class="pgSectionTitle">Stopwatch</div>' +
            '<div class="pgStopwatch" id="pgStopwatch">00:00.0</div>' +
            '<div class="pgStopwatchBtns">' +
                '<button class="wwBtn" id="pgSwStart">Start</button>' +
                '<button class="wwBtn" id="pgSwStop">Stop</button>' +
                '<button class="wwBtn" id="pgSwReset">Reset</button>' +
            '</div>' +
        '</div>' +
        '<div class="pgSection">' +
            '<div class="pgSectionTitle">UTC Converter</div>' +
            '<div class="pgConverterRow">' +
                '<input class="wwSearchInput" id="pgLocalInput" placeholder="Local time (e.g. 3:45 PM)">' +
                '<button class="wwBtn" id="pgToUtc">→ UTC</button>' +
                '<span class="pgConverterResult" id="pgUtcResult"></span>' +
            '</div>' +
        '</div>' +
        '<div class="pgSection">' +
            '<div class="pgSectionTitle">Time Resources</div>' +
            '<div class="pgLinkRow">' +
                pgExternalLink('https://time.is/UTC', 'time.is/UTC') +
                pgExternalLink('https://www.timeanddate.com/worldclock/', 'World Clock') +
            '</div>' +
        '</div>' +
    '</div>');

    // Stopwatch state
    var running = false, startMs = 0, elapsed = 0;

    _timer = setInterval(function() {
        var now = new Date();
        $('#pgUtcClock').text(
            String(now.getUTCHours()).padStart(2,'0') + ':' +
            String(now.getUTCMinutes()).padStart(2,'0') + ':' +
            String(now.getUTCSeconds()).padStart(2,'0') + ' UTC'
        );
        $('#pgLocalClock').text(now.toLocaleTimeString());
        if (running) {
            $('#pgStopwatch').text(formatTime(elapsed + Date.now() - startMs));
        }
    }, 100);

    $c.on('click.pg', '#pgSwStart', function() {
        if (!running) { startMs = Date.now(); running = true; }
    });
    $c.on('click.pg', '#pgSwStop',  function() {
        if (running) { elapsed += Date.now() - startMs; running = false; }
    });
    $c.on('click.pg', '#pgSwReset', function() {
        elapsed = 0; running = false;
        $('#pgStopwatch').text('00:00.0');
    });
    $c.on('click.pg', '#pgToUtc', function() {
        var input = $('#pgLocalInput').val().trim();
        if (!input) return;
        var d = new Date('1970-01-01 ' + input);
        if (isNaN(d.getTime())) { $('#pgUtcResult').text('Invalid time'); return; }
        var utcStr = String(d.getUTCHours()).padStart(2,'0') + ':' + String(d.getUTCMinutes()).padStart(2,'0') + ' UTC';
        $('#pgUtcResult').text('→ ' + utcStr);
    });
}

// ---------------------------------------------------------------------------
// CHASE
// ---------------------------------------------------------------------------
function mountChase($c) {
    $c.html(pgWrap(
        pgBar('<span class="pgBarTitle">Chase Tools</span>'),
        'pgStaticWrap'
    ) +
    '<div class="pgScrollBody">' +
        '<div class="pgSection">' +
            '<div class="pgSectionTitle">Stopwatch</div>' +
            '<div class="pgStopwatch" id="pgChaseStopwatch">00:00.0</div>' +
            '<div class="pgStopwatchBtns">' +
                '<button class="wwBtn" id="pgCsStart">Start</button>' +
                '<button class="wwBtn" id="pgCsStop">Stop</button>' +
                '<button class="wwBtn" id="pgCsReset">Reset</button>' +
            '</div>' +
        '</div>' +
        '<div class="pgSection">' +
            '<div class="pgSectionTitle">Bearing & Distance Calculator</div>' +
            '<div class="pgCalcGrid">' +
                '<label class="pgCalcLabel">From lat</label><input class="wwSearchInput pgCalcInput" id="pgLat1" placeholder="35.0">' +
                '<label class="pgCalcLabel">From lon</label><input class="wwSearchInput pgCalcInput" id="pgLon1" placeholder="-97.0">' +
                '<label class="pgCalcLabel">To lat</label><input class="wwSearchInput pgCalcInput" id="pgLat2" placeholder="36.0">' +
                '<label class="pgCalcLabel">To lon</label><input class="wwSearchInput pgCalcInput" id="pgLon2" placeholder="-96.0">' +
            '</div>' +
            '<button class="wwBtn" id="pgCalcBtn" style="margin-top:8px">Calculate</button>' +
            '<div class="pgCalcResult" id="pgCalcResult"></div>' +
        '</div>' +
        '<div class="pgSection">' +
            '<div class="pgSectionTitle">Unit Converter</div>' +
            '<div class="pgConverterRow">' +
                '<input class="wwSearchInput pgCalcInput" id="pgConvVal" placeholder="65">' +
                '<select class="wwSelect" id="pgConvFrom">' +
                    '<option value="mph">mph</option>' +
                    '<option value="kts">knots</option>' +
                    '<option value="kph">km/h</option>' +
                    '<option value="ms">m/s</option>' +
                '</select>' +
                '<button class="wwBtn" id="pgConvBtn">Convert</button>' +
            '</div>' +
            '<div class="pgCalcResult" id="pgConvResult"></div>' +
        '</div>' +
        '<div class="pgSection">' +
            '<div class="pgSectionTitle">Navigation</div>' +
            '<div class="pgLinkRow">' +
                pgExternalLink('https://www.google.com/maps', 'Google Maps') +
                pgExternalLink('https://waze.com', 'Waze') +
                pgExternalLink('https://mesonet.agron.iastate.edu/request/gis/lsrs.phtml', 'IEM LSR Map') +
            '</div>' +
        '</div>' +
    '</div>');

    var running = false, startMs = 0, elapsed = 0;

    _timer = setInterval(function() {
        if (running) $('#pgChaseStopwatch').text(formatTime(elapsed + Date.now() - startMs));
    }, 100);

    $c.on('click.pg', '#pgCsStart', function() { if (!running) { startMs = Date.now(); running = true; } });
    $c.on('click.pg', '#pgCsStop',  function() { if (running) { elapsed += Date.now() - startMs; running = false; } });
    $c.on('click.pg', '#pgCsReset', function() { elapsed = 0; running = false; $('#pgChaseStopwatch').text('00:00.0'); });

    $c.on('click.pg', '#pgCalcBtn', function() {
        var lat1 = parseFloat($('#pgLat1').val()), lon1 = parseFloat($('#pgLon1').val());
        var lat2 = parseFloat($('#pgLat2').val()), lon2 = parseFloat($('#pgLon2').val());
        if ([lat1, lon1, lat2, lon2].some(isNaN)) {
            $('#pgCalcResult').text('Enter valid coordinates.');
            return;
        }
        var dist    = haversineNm(lat1, lon1, lat2, lon2);
        var bearing = initialBearing(lat1, lon1, lat2, lon2);
        $('#pgCalcResult').html(
            'Distance: <strong>' + dist.toFixed(1) + ' nm</strong> (' + (dist * 1.852).toFixed(1) + ' km / ' + (dist * 1.151).toFixed(1) + ' mi)<br>' +
            'Bearing: <strong>' + bearing.toFixed(1) + '°</strong>'
        );
    });

    $c.on('click.pg', '#pgConvBtn', function() {
        var val  = parseFloat($('#pgConvVal').val());
        var from = $('#pgConvFrom').val();
        if (isNaN(val)) { $('#pgConvResult').text('Enter a number.'); return; }
        var mph = { mph: val, kts: val * 1.15078, kph: val * 1.60934, ms: val * 0.44704 }[from];
        $('#pgConvResult').html(
            mph.toFixed(1) + ' mph = ' +
            (mph / 1.15078).toFixed(1) + ' kts = ' +
            (mph * 1.60934).toFixed(1) + ' km/h = ' +
            (mph * 0.44704).toFixed(1) + ' m/s'
        );
    });
}

function haversineNm(lat1, lon1, lat2, lon2) {
    var R = 3440.065; // nautical miles
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function initialBearing(lat1, lon1, lat2, lon2) {
    var φ1 = lat1 * Math.PI/180, φ2 = lat2 * Math.PI/180;
    var Δλ = (lon2 - lon1) * Math.PI/180;
    var y  = Math.sin(Δλ) * Math.cos(φ2);
    var x  = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}

// ---------------------------------------------------------------------------
// OUTLOOKS
// ---------------------------------------------------------------------------
var _outlookDay  = 1;
var _outlookMode = 'cat';

var OUTLOOK_MODES = [
    { key: 'cat',  label: 'Categorical', img: function(d) { return 'https://www.spc.noaa.gov/products/outlook/day' + d + 'otlk.gif'; } },
    { key: 'torn', label: 'Tornado',     img: function(d) { return d <= 2 ? 'https://www.spc.noaa.gov/products/outlook/day' + d + 'otlk_torn.gif' : null; } },
    { key: 'hail', label: 'Hail',        img: function(d) { return d <= 2 ? 'https://www.spc.noaa.gov/products/outlook/day' + d + 'otlk_hail.gif' : null; } },
    { key: 'wind', label: 'Wind',        img: function(d) { return d <= 2 ? 'https://www.spc.noaa.gov/products/outlook/day' + d + 'otlk_wind.gif' : null; } },
];

function mountOutlooks($c) {
    $c.html(pgWrap(
        pgBar(
            '<span class="pgBarTitle">SPC Convective Outlooks</span>',
            [1,2,3,4,5].map(function(d) {
                return '<button class="pgDayBtn' + (_outlookDay === d ? ' pgDayBtnActive' : '') + '" data-pg-day="' + d + '">Day ' + d + '</button>';
            }).join('') +
            OUTLOOK_MODES.map(function(m) {
                return '<button class="pgModeBtn' + (_outlookMode === m.key ? ' pgModeBtnActive' : '') + '" data-pg-mode="' + m.key + '">' + m.label + '</button>';
            }).join('')
        ) +
        '<div class="pgScrollBody" id="pgOutlookBody">' +
            renderOutlookImg(_outlookDay, _outlookMode) +
        '</div>'
    ));

    $c.on('click.pg', '[data-pg-day]', function() {
        _outlookDay = parseInt($(this).data('pg-day'));
        $('.pgDayBtn').removeClass('pgDayBtnActive');
        $(this).addClass('pgDayBtnActive');
        // restrict mode for day 3+
        if (_outlookDay >= 3 && _outlookMode !== 'cat') {
            _outlookMode = 'cat';
            $('.pgModeBtn').removeClass('pgModeBtnActive');
            $('[data-pg-mode="cat"]').addClass('pgModeBtnActive');
        }
        $('#pgOutlookBody').html(renderOutlookImg(_outlookDay, _outlookMode));
    });
    $c.on('click.pg', '[data-pg-mode]', function() {
        _outlookMode = $(this).data('pg-mode');
        $('.pgModeBtn').removeClass('pgModeBtnActive');
        $(this).addClass('pgModeBtnActive');
        $('#pgOutlookBody').html(renderOutlookImg(_outlookDay, _outlookMode));
    });
}

function renderOutlookImg(day, mode) {
    var modeObj = OUTLOOK_MODES.find(function(m) { return m.key === mode; }) || OUTLOOK_MODES[0];
    var src     = modeObj.img(day);

    if (!src) {
        return '<div class="pgEmpty"><div class="pgEmptyTitle">' + modeObj.label + ' not available for Day ' + day + '</div>' +
               '<div class="pgEmptySub">Individual hazard outlooks are only issued for Days 1–2.</div></div>';
    }

    return '<div class="pgSection">' +
        '<img class="pgAnalysisImg" src="' + esc(src + '?cb=' + Date.now()) + '" alt="SPC Day ' + day + ' ' + modeObj.label + ' Outlook" loading="lazy">' +
        '<div class="pgImageCaption">SPC Day ' + day + ' ' + esc(modeObj.label) + ' Outlook</div>' +
    '</div>' +
    '<div class="pgLinkRow">' +
        pgExternalLink('https://www.spc.noaa.gov/products/outlook/', 'Full SPC Outlooks') +
        pgExternalLink('https://www.spc.noaa.gov/climo/reports/today.html', 'Today\'s Reports') +
        pgExternalLink('https://www.spc.noaa.gov/products/watch/', 'Active Watches') +
    '</div>';
}

// ---------------------------------------------------------------------------
// HAZCAMS
// ---------------------------------------------------------------------------
function mountHazcams($c) {
    $c.html(pgWrap(
        pgBar(
            '<span class="pgBarTitle">Hazcams</span><span class="pgBarSub">WXLogic Hazard Cameras</span>',
            '<button class="wwBtn" id="pgHazcamsReload">Reload</button>' +
            pgExternalLink('https://www.wxlogic.com/hazcams/', 'Open in tab')
        ) +
        '<div class="pgFullIframe">' +
            '<iframe id="pgHazcamsFrame" class="pgEmbedFrame" src="https://www.wxlogic.com/hazcams/" ' +
                    'frameborder="0" allow="autoplay" sandbox="allow-scripts allow-same-origin allow-forms allow-popups">' +
            '</iframe>' +
        '</div>'
    ));
    $c.on('click.pg', '#pgHazcamsReload', function() {
        var $f = $('#pgHazcamsFrame');
        $f.attr('src', $f.attr('src'));
    });
}

// ---------------------------------------------------------------------------
// XWEATHER
// ---------------------------------------------------------------------------
function mountXweather($c) {
    $c.html(pgWrap(
        pgBar('<span class="pgBarTitle">Xweather MapsGL</span>'),
        'pgStaticWrap'
    ) +
    '<div class="pgScrollBody">' +
        pgCard('Xweather by AerisWeather',
            'Xweather MapsGL provides animated weather overlays including radar mosaics, satellite, and model data. ' +
            'Integration requires an Xweather API client ID and secret.<br><br>' +
            'The Storm Chaser Grid app includes a full Xweather MapsGL integration in its Xweather tab. ' +
            'To use it, open the Storm Chaser Grid project with valid credentials and the Xweather tab will be available.') +
        '<div class="pgSection">' +
            '<div class="pgSectionTitle">Xweather Resources</div>' +
            '<div class="pgLinkRow">' +
                pgExternalLink('https://www.xweather.com/', 'Xweather') +
                pgExternalLink('https://www.xweather.com/docs/mapsgl/', 'MapsGL Docs') +
                pgExternalLink('https://www.xweather.com/account', 'Get API Keys') +
                pgExternalLink('https://esri.maps.arcgis.com/apps/webappviewer/index.html?id=', 'ArcGIS Weather') +
                pgExternalLink('https://zoom.earth/', 'Zoom Earth') +
            '</div>' +
        '</div>' +
    '</div>');
}

// ---------------------------------------------------------------------------
// PREMIUM
// ---------------------------------------------------------------------------
function mountPremium($c) {
    $c.html(pgWrap(
        pgBar('<span class="pgBarTitle">Premium Tools</span>'),
        'pgStaticWrap'
    ) +
    '<div class="pgScrollBody">' +
        pgCard('Coming Soon',
            'Premium features are planned for a future update. This slot is reserved for advanced tools including ' +
            'AI-powered nowcasting, model guidance summaries, and priority alert scoring.') +
        '<div class="pgSection">' +
            '<div class="pgSectionTitle">Already Available in AtticRadar</div>' +
            '<div class="pgLinkRow">' +
                pgExternalLink('https://steepatticstairs.github.io/AtticRadar/', 'AtticRadar Web') +
                pgExternalLink('https://github.com/steepatticstairs/AtticRadar', 'GitHub') +
            '</div>' +
        '</div>' +
    '</div>');
}

// ---------------------------------------------------------------------------
// ABOUT
// ---------------------------------------------------------------------------
function mountAbout($c) {
    $c.html(pgWrap(
        pgBar('<span class="pgBarTitle">About</span>'),
        'pgStaticWrap'
    ) +
    '<div class="pgScrollBody">' +
        '<div class="pgSection pgAboutHero">' +
            '<div class="pgAboutTitle">AtticRadar</div>' +
            '<div class="pgAboutSub">A powerful, open-source weather toolkit for the web browser.</div>' +
        '</div>' +
        pgCard('What is AtticRadar?',
            'AtticRadar is a hobby proof-of-concept weather radar analysis tool. It parses and renders NEXRAD Level 2 and Level 3 data entirely client-side using WebGL, Web Workers, and WebAssembly.<br><br>' +
            'Features include NEXRAD reflectivity/velocity/dual-pol rendering, Doppler velocity dealiasing, NWS weather alerts, METARs, surface fronts, SPC outlooks, lightning, tides, hurricane tracking, and more.') +
        pgCard('Storm Chaser Grid Integration',
            'This pages shell is modeled after the Storm Chaser Grid app (WeatherWatch), which combines AtticRadar\'s radar engine with a modern React UI. ' +
            'The Watch tab, page navigation, and several tools were ported from that project.') +
        '<div class="pgSection">' +
            '<div class="pgSectionTitle">Links</div>' +
            '<div class="pgLinkRow">' +
                pgExternalLink('https://github.com/steepatticstairs/AtticRadar', 'GitHub Repository') +
                pgExternalLink('https://steepatticstairs.github.io/AtticRadar/', 'Web Version') +
            '</div>' +
        '</div>' +
        pgCard('Disclaimer',
            'AtticRadar is a hobby project and should NOT be used to make life-saving decisions. ' +
            'Always refer to official NWS warnings and your local emergency management for life-safety information.') +
    '</div>');
}

// ---------------------------------------------------------------------------
// UPDATES
// ---------------------------------------------------------------------------
function mountUpdates($c) {
    var entries = [
        { date: 'April 2026', tag: 'New', title: 'Storm Chaser Grid integration',
          items: ['Pages shell with 17-tab navigation ported from Storm Chaser Grid', 'Native Watch Wall: YouTube live stream grid with 18 default storm chasers', 'All remaining tabs implemented natively (Alerts, Reports, Outlooks, Risk, Chase, etc.)', 'Radar Workspace sidebar with live status sync'] },
        { date: 'August 2025', tag: 'Update', title: 'Library cleanup',
          items: ['Removed unused nexrad-level-2-data and nexrad-level-2-plot libraries', 'Reduced bundle size'] },
        { date: 'Earlier', tag: 'Feature', title: 'Core weather tools',
          items: ['NEXRAD Level 2 & 3 parsing and WebGL rendering', 'Doppler velocity dealiasing (region-based algorithm from PyART)', 'NWS weather alerts with polygon display', 'Surface fronts, SPC outlooks, lightning, tides, METARs', 'Hurricane tracking (NHC & JTWC)', 'Storm relative velocity, storm tracks, TVS markers'] },
    ];

    var html = entries.map(function(e) {
        var items = e.items.map(function(i) { return '<li>' + esc(i) + '</li>'; }).join('');
        return '<div class="pgChangelogEntry">' +
            '<div class="pgChangelogHeader">' +
                '<span class="pgChangelogDate">' + esc(e.date) + '</span>' +
                '<span class="pgChangelogTag">' + esc(e.tag) + '</span>' +
                '<span class="pgChangelogTitle">' + esc(e.title) + '</span>' +
            '</div>' +
            '<ul class="pgChangelogList">' + items + '</ul>' +
        '</div>';
    }).join('');

    $c.html(pgWrap(
        pgBar('<span class="pgBarTitle">Updates</span><span class="pgBarSub">What\'s new in AtticRadar</span>'),
        'pgStaticWrap'
    ) +
    '<div class="pgScrollBody">' + html + '</div>');
}

// ---------------------------------------------------------------------------
// INSTRUCTIONS / HELP
// ---------------------------------------------------------------------------
function mountInstructions($c) {
    var sections = [
        { title: 'Getting Started',
          body: 'Click the <strong>Pages</strong> button (top-right) to open this panel. Use the tab bar to navigate between tools. Click <strong>Radar Workspace</strong> to access radar layer controls.' },
        { title: 'Watch Tab — Live Streams',
          body: 'Shows a responsive grid of storm chaser YouTube streams. Use <em>Manage</em> to add or remove chasers. Drag tiles to reorder. Click <em>Full</em> on any tile to go fullscreen. Use <em>Live Panel</em> to manually mark chasers as live.' },
        { title: 'Radar',
          body: 'The radar map is always visible behind the pages panel. Click a NEXRAD station to load its radar data. Use the product selector to switch between reflectivity, velocity, dual-pol products, and more. The Radar Workspace sidebar shows current station and layer status.' },
        { title: 'Alerts & Reports',
          body: 'The Alerts tab fetches active NWS warnings and watches from api.weather.gov. The Reports tab fetches Local Storm Reports from the Iowa State IEM archive (last 24 hours). Both require an internet connection.' },
        { title: 'Outlooks & Risk',
          body: 'The Outlooks tab shows SPC convective outlooks for Days 1–5. Use the day and mode selectors to view categorical, tornado, hail, and wind outlooks. The Risk tab shows the highest Day 1 risk category nationally.' },
        { title: 'Chase Tools',
          body: 'Stopwatch for tracking elapsed time since a tornado or storm event. Bearing & distance calculator for two lat/lon coordinates. Unit converter between mph, knots, km/h, and m/s.' },
        { title: 'Timezones',
          body: 'Live UTC/Zulu clock, local time, and a stopwatch. Use the converter to quickly translate local times to UTC for logging and coordination.' },
        { title: 'Server (npm start)',
          body: 'Run <code>npm start</code> in the AtticRadar directory to start the Node.js server. This enables the Reports proxy and the AI endpoint. Without it, Reports will fail but the rest of the app works offline.' },
    ];

    var html = sections.map(function(s) {
        return '<div class="pgHelpSection">' +
            '<div class="pgHelpTitle">' + s.title + '</div>' +
            '<div class="pgHelpBody">' + s.body + '</div>' +
        '</div>';
    }).join('');

    $c.html(pgWrap(
        pgBar('<span class="pgBarTitle">Instructions</span><span class="pgBarSub">How to use AtticRadar</span>'),
        'pgStaticWrap'
    ) +
    '<div class="pgScrollBody">' + html + '</div>');
}

// ---------------------------------------------------------------------------
// WEBSITES
// ---------------------------------------------------------------------------
function mountWebsites($c) {
    var sites = [
        { name: 'WeatherWise', href: 'https://weatherwise.app', rating: '10/10' },
        { name: 'Pivotal Weather', href: 'https://www.pivotalweather.com', rating: '10/10' },
        { name: 'Attic Radar', href: 'https://steepatticstairs.github.io/AtticRadar/', rating: '10/10' },
        { name: 'Tropical Tidbits', href: 'https://www.tropicaltidbits.com/', rating: '9/10' },
        { name: 'Everything SPC', href: 'https://www.spc.noaa.gov/products/outlook/', rating: '9/10' },
        { name: 'NWS Aviation Weather Center', href: 'https://aviationweather.gov/', rating: '7/10' },
        { name: 'WPC', href: 'https://www.wpc.ncep.noaa.gov/', rating: '7/10' },
        { name: 'One Stop', href: 'https://data.noaa.gov/onestop/', rating: '7/10' },
        { name: 'Meteologix', href: 'https://meteologix.com/', rating: '6/10' },
        { name: 'Lightning Maps', href: 'https://www.lightningmaps.org/', rating: '6/10' },
        { name: 'College of DuPage (COD) Weather', href: 'https://weather.cod.edu/', rating: '5/10' },
        { name: 'GOES Imagery', href: 'https://rammb-slider.cira.colostate.edu/', rating: '5/10' },
        { name: 'NWS Radar', href: 'https://radar.weather.gov/', rating: '5/10' },
        { name: 'Tropical (NHC)', href: 'https://www.nhc.noaa.gov/', rating: '5/10' },
        { name: 'Earth Nullschool', href: 'https://earth.nullschool.net/', rating: '5/10' },
        { name: 'Ventusky', href: 'https://www.ventusky.com/', rating: '4/10' },
        { name: 'IEM NEXRAD Mosaics', href: 'https://mesonet.agron.iastate.edu/GIS/radmap.php', rating: '4/10' },
        { name: 'Storm Events Database', href: 'https://www.ncei.noaa.gov/access/search/service/search', rating: '4/10' },
        { name: 'NHC Graphical Tropical Weather Outlook', href: 'https://www.nhc.noaa.gov/gtwo.php', rating: '4/10' },
        { name: 'Windy', href: 'https://www.windy.com/', rating: '3/10' },
        { name: 'NWS Alerts', href: 'https://www.weather.gov/alerts', rating: '3/10' },
        { name: 'NWS Forecast', href: 'https://forecast.weather.gov/', rating: '3/10' },
        { name: 'IEM', href: 'https://mesonet.agron.iastate.edu/', rating: '2/10' },
        { name: 'USGS WaterWatch', href: 'https://waterwatch.usgs.gov/', rating: '1/10' },
    ];

    $c.html(pgWrap(
        pgBar(
            '<span class="pgBarTitle">Weather Websites</span><span class="pgBarSub">Owners Ratings.</span>',
            '<input class="wwSearchInput" id="pgWebsitesSearch" placeholder="Search links..." style="width:180px">'
        ),
        'pgStaticWrap'
    ) +
    '<div class="pgScrollBody">' +
        '<div class="pgCard">' +
            '<div class="pgCardBody">' +
                '<div class="pgAboutTitle" style="font-size:28px;margin-bottom:6px;">Owners Ratings.</div>' +
                '<div class="pgAboutSub">Weather websites ranked by the owner</div>' +
            '</div>' +
        '</div>' +
        '<div id="pgWebsitesList" class="pgWebsiteList"></div>' +
    '</div>');

    function renderWebsites(query) {
        var q = String(query || '').trim().toLowerCase();
        var filtered = q ? sites.filter(function(site) {
            return site.name.toLowerCase().indexOf(q) >= 0 ||
                   site.href.toLowerCase().indexOf(q) >= 0 ||
                   site.rating.toLowerCase().indexOf(q) >= 0;
        }) : sites;

        if (!filtered.length) {
            $('#pgWebsitesList').html('<div class="pgEmpty"><div class="pgEmptyTitle">No matches.</div></div>');
            return;
        }

        $('#pgWebsitesList').html(filtered.map(function(site) {
            return '<a class="pgWebsiteItem" href="' + esc(site.href) + '" target="_blank" rel="noreferrer">' +
                '<span class="pgWebsiteName">' + esc(site.name) + '</span>' +
                '<span class="pgWebsiteRating">' + esc(site.rating) + '</span>' +
            '</a>';
        }).join(''));
    }

    renderWebsites('');
    $c.on('input.pg', '#pgWebsitesSearch', function() {
        renderWebsites($(this).val());
    });
}

// ---------------------------------------------------------------------------
// Page implementation map
// ---------------------------------------------------------------------------
var PAGE_IMPLS = {
    fronts:       mountFronts,
    alerts:       mountAlerts,
    reports:      mountReports,
    risk:         mountRisk,
    lightning:    mountLightning,
    ai:           mountAI,
    timezones:    mountTimezones,
    chase:        mountChase,
    outlooks:     mountOutlooks,
    hazcams:      mountHazcams,
    xweather:     mountXweather,
    premium:      mountPremium,
    about:        mountAbout,
    updates:      mountUpdates,
    instructions: mountInstructions,
    websites:     mountWebsites,
};

module.exports = { mount: mount, unmount: unmount };
