/*
 * watch_wall.js
 * Native Watch Wall for AtticRadar — ported from Storm Chaser Grid.
 * Renders a responsive YouTube live-stream grid directly in the pages shell,
 * no iframe embedding required.
 */

const DEFAULT_CHASERS = [
    { name: 'Reed Timmer',                   channelId: 'UCV6hWxB0-u_IX7e-h4fEBAw' },
    { name: 'Brian Emfinger',                channelId: 'UCwv4c1i6QktoA72HORu9DVw' },
    { name: 'Brad Arnold',                   channelId: 'UCRepOZk9KgisXqThE02AHyg' },
    { name: 'Connor Croff',                  channelId: 'UCb0U1g5r4kH_NDMGiGRhysA' },
    { name: "Ryan Hall, Y'all",              channelId: 'UCJHAT3Uvv-g3I8H3GhHWV7w' },
    { name: 'Pecos Hank',                    channelId: 'UCAQpSHsgUcNt6uCOjpgD8kw' },
    { name: 'Max Velocity',                  channelId: 'UCvBVK2ymNzPLRJrgip2GeQQ' },
    { name: 'Texas Storm Chasers',           channelId: 'UCNPvoDpoOWevcdTHr8GyTyA' },
    { name: 'Storm Runner Media',            channelId: 'UCBmOfiL9LC3dT4Ps2veVCoQ' },
    { name: 'Brandon Copic',                 channelId: 'UC6S6d061r5Lq2M81O1Z1FQA' },
    { name: 'Live Storms Media',             channelId: 'UC1nJElGcVcTpeZJVyxEbzJw' },
    { name: 'StormChaserIRL',               channelId: 'UCXUU-_dJ-eGBh3-bjPNsalQ' },
    { name: 'StormChaseTV',                  channelId: 'UCdSMdTFOfqmOXP-1vD2cxAA' },
    { name: 'Tornado Crew Storm Chasers',    channelId: 'UCaS1PyCKSyoDlel7iVOI2Vw' },
    { name: 'TwisterChasers',               channelId: 'UCTWhf2uDTdr3pVNKUCdgnDQ' },
    { name: 'Storm Chaser Tyler Kurtz',      channelId: 'UCRCXo0mDpBOZ6-qB5fqHQKA' },
    { name: 'StormChasingVideo',            channelId: 'UCWAN-rRJFLosqgiiIFVpkEQ' },
    { name: 'The Storm Chasing Channel',     channelId: 'UCqAWcfd0BJBgCW8iyOLOF3g' },
];

const LS_CHASERS = 'ar_chasers_v1';
const LS_PREFS   = 'ar_watch_prefs_v1';
const LS_MUTES   = 'ar_watch_mutes_v1';
const LS_LIVE    = 'ar_liveMap_v1';

const DEFAULT_PREFS = {
    liveOnly: false,
    compact:  false,
    scroll:   false,
    cols:     'auto',
    size:     'md',
};

// ---------------------------------------------------------------------------
// Module-level state — survives page navigation inside the pages shell
// ---------------------------------------------------------------------------
const _s = {
    chasers:   null,   // array of { name, channelId }
    prefs:     null,
    mutes:     null,   // { channelId: false } means UNMUTED; absent = muted (default)
    liveMap:   null,   // { channelId: true } means manually marked LIVE
    nonce:     0,      // incremented on "Reload all" to bust iframe src cache
    query:     '',
    view:      'grid', // 'grid' | 'full' | 'manage'
    selected:  null,   // { name, channelId } when in full view
    dragFrom:  null,
    container: null,
};

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------
function lsGet(key, def) {
    try { return JSON.parse(localStorage.getItem(key)) ?? def; }
    catch (_) { return def; }
}
function lsSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
}

function ensureState() {
    if (_s.chasers === null) {
        _s.chasers  = lsGet(LS_CHASERS, DEFAULT_CHASERS);
        _s.prefs    = Object.assign({}, DEFAULT_PREFS, lsGet(LS_PREFS, {}));
        _s.mutes    = lsGet(LS_MUTES, {});
        _s.liveMap  = lsGet(LS_LIVE, {});
    }
}

// ---------------------------------------------------------------------------
// YouTube embed URL builder
// ---------------------------------------------------------------------------
function buildEmbedUrl(channelId, muted, cb) {
    const params = new URLSearchParams({
        autoplay:        '1',
        mute:            muted ? '1' : '0',
        controls:        '1',
        rel:             '0',
        modestbranding:  '1',
        playsinline:     '1',
        enablejsapi:     '1',
        cb:              String(cb || 0),
        origin:          window.location.origin,
    });
    return 'https://www.youtube-nocookie.com/embed/live_stream?channel=' + channelId + '&' + params.toString();
}

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------
function visibleChasers() {
    const q = _s.query.trim().toLowerCase();
    return _s.chasers.filter(function(c) {
        if (q && c.name.toLowerCase().indexOf(q) === -1) return false;
        if (_s.prefs.liveOnly && !_s.liveMap[c.channelId]) return false;
        return true;
    });
}

// ---------------------------------------------------------------------------
// Simple HTML escaping
// ---------------------------------------------------------------------------
function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// HTML builders
// ---------------------------------------------------------------------------
function tileHtml(c) {
    const muted  = _s.mutes[c.channelId] !== false; // default: muted
    const isLive = !!_s.liveMap[c.channelId];
    const src    = buildEmbedUrl(c.channelId, muted, _s.nonce);

    return '<div class="wwTile" data-cid="' + esc(c.channelId) + '" draggable="true">' +
        '<div class="wwTileHeader">' +
            '<div class="wwTileName">' + esc(c.name) + '</div>' +
            '<div class="wwTileActions">' +
                '<a class="wwMiniLink" href="https://www.youtube.com/channel/' + esc(c.channelId) + '/live"' +
                   ' target="_blank" rel="noreferrer" title="Open live on YouTube">Open</a>' +
                '<button class="wwMiniBtn" data-ww="full"   data-cid="' + esc(c.channelId) + '" title="Fullscreen">Full</button>' +
                '<button class="wwMiniBtn" data-ww="reload" data-cid="' + esc(c.channelId) + '" title="Reload tile">Reload</button>' +
                '<button class="wwMiniBtn' + (!muted ? ' wwMiniBtnOn' : '') + '"' +
                        ' data-ww="mute" data-cid="' + esc(c.channelId) + '"' +
                        ' title="' + (muted ? 'Unmute' : 'Mute') + '">' + (muted ? 'Unmute' : 'Mute') + '</button>' +
                '<span class="wwDragHandle" title="Drag to reorder">⠿</span>' +
            '</div>' +
        '</div>' +
        '<div class="wwTileFrameWrap">' +
            '<iframe class="wwTileFrame" src="' + esc(src) + '" title="' + esc(c.name) + '"' +
                ' frameborder="0" allow="autoplay; encrypted-media; picture-in-picture"' +
                ' allowfullscreen loading="lazy"></iframe>' +
            (isLive ? '' : '<div class="wwOfflineOverlay">Not Currently Live</div>') +
        '</div>' +
        '<div class="wwTileFooter">' +
            (isLive ? '<div class="wwLivePill"><span class="wwLiveDot"></span>LIVE</div>' : '') +
        '</div>' +
    '</div>';
}

function controlsHtml(visCount) {
    const p = _s.prefs;
    return '<div class="wwBar">' +
        '<div class="wwBarLeft">' +
            '<span class="wwBarTitle">Live Watch</span>' +
            '<span class="wwBarSub">' + visCount + ' of ' + _s.chasers.length + ' streamers</span>' +
        '</div>' +
        '<div class="wwBarRight">' +
            '<input class="wwSearchInput" id="wwSearch" type="search" placeholder="Search streamers..."' +
                   ' value="' + esc(_s.query) + '">' +
            '<label class="wwToggle"><input type="checkbox" id="wwLiveOnly"' + (p.liveOnly ? ' checked' : '') + '> Live only</label>' +
            '<label class="wwToggle"><input type="checkbox" id="wwCompact"'  + (p.compact  ? ' checked' : '') + '> Compact</label>' +
            '<select class="wwSelect" id="wwSize">' +
                '<option value="sm"' + (p.size === 'sm' ? ' selected' : '') + '>Small tiles</option>' +
                '<option value="md"' + (p.size === 'md' ? ' selected' : '') + '>Medium tiles</option>' +
                '<option value="lg"' + (p.size === 'lg' ? ' selected' : '') + '>Large tiles</option>' +
            '</select>' +
            '<select class="wwSelect" id="wwCols">' +
                '<option value="auto"' + (_s.prefs.cols === 'auto' ? ' selected' : '') + '>Auto cols</option>' +
                '<option value="1"'    + (_s.prefs.cols === 1      ? ' selected' : '') + '>1 column</option>' +
                '<option value="2"'    + (_s.prefs.cols === 2      ? ' selected' : '') + '>2 columns</option>' +
                '<option value="3"'    + (_s.prefs.cols === 3      ? ' selected' : '') + '>3 columns</option>' +
                '<option value="4"'    + (_s.prefs.cols === 4      ? ' selected' : '') + '>4 columns</option>' +
            '</select>' +
            '<button class="wwBtn" id="wwReloadAll">Reload all</button>' +
            '<button class="wwBtn" id="wwLivePanel">Live panel</button>' +
            '<button class="wwBtn" id="wwManageBtn">Manage</button>' +
        '</div>' +
    '</div>';
}

function gridHtml() {
    const p       = _s.prefs;
    const visible = visibleChasers();
    const sizeMap = { sm: ['26vw', '360px'], md: ['32vw', '420px'], lg: ['38vw', '520px'] };
    const sz      = sizeMap[p.size] || sizeMap.md;
    const colVar  = p.cols !== 'auto' ? '--ww-cols: ' + p.cols + '; ' : '';
    const style   = '--ww-tile-w: ' + sz[0] + '; --ww-tile-max: ' + sz[1] + '; ' + colVar;

    const classes = 'wwGridWrap' + (p.scroll ? ' wwScroll' : '') + (p.compact ? ' wwCompact' : '');
    const empty   = visible.length === 0
        ? '<div class="wwEmpty"><div class="wwEmptyTitle">No streams match</div>' +
          '<div class="wwEmptySub">Try clearing the search or disabling live-only.</div></div>'
        : '';

    return controlsHtml(visible.length) +
        '<div class="' + classes + '" style="' + style + '">' +
            '<div class="wwGrid">' + visible.map(tileHtml).join('') + '</div>' +
            empty +
        '</div>';
}

function fullscreenHtml(c) {
    const muted = _s.mutes[c.channelId] !== false;
    const src   = buildEmbedUrl(c.channelId, muted, _s.nonce);
    return '<div class="wwFullscreen">' +
        '<div class="wwFullBar">' +
            '<button class="wwBtn" id="wwFullBack">← Back to grid</button>' +
            '<button class="wwBtn" id="wwFullPrev">Prev</button>' +
            '<button class="wwBtn" id="wwFullNext">Next</button>' +
            '<a class="wwBtn" href="https://www.youtube.com/channel/' + esc(c.channelId) + '/live"' +
               ' target="_blank" rel="noreferrer">Open on YouTube</a>' +
            '<button class="wwBtn" id="wwFullReload">Reload</button>' +
            '<span class="wwFullTitle">' + esc(c.name) + '</span>' +
        '</div>' +
        '<div class="wwFullFrameWrap">' +
            '<iframe class="wwFullFrame" src="' + esc(src) + '" title="' + esc(c.name) + '"' +
                ' frameborder="0" allow="autoplay; encrypted-media; picture-in-picture"' +
                ' allowfullscreen></iframe>' +
        '</div>' +
    '</div>';
}

function managePanelHtml() {
    const rows = _s.chasers.map(function(c, i) {
        return '<div class="wwManageRow" data-idx="' + i + '">' +
            '<span class="wwManageName">' + esc(c.name) + '</span>' +
            '<span class="wwManageCid">' + esc(c.channelId) + '</span>' +
            '<button class="wwMiniBtn" data-ww="removeChaser" data-idx="' + i + '">Remove</button>' +
        '</div>';
    }).join('');

    return '<div class="wwManage">' +
        '<div class="wwManageTopbar">' +
            '<strong class="wwManageHeading">Manage Chasers</strong>' +
            '<button class="wwBtn" id="wwManageClose">← Back</button>' +
        '</div>' +
        '<div class="wwManageList">' + rows + '</div>' +
        '<div class="wwManageAddRow">' +
            '<input class="wwSearchInput" id="wwAddName" placeholder="Chaser name">' +
            '<input class="wwSearchInput" id="wwAddCid"  placeholder="YouTube Channel ID">' +
            '<button class="wwBtn" id="wwAddChaser">Add chaser</button>' +
            '<button class="wwBtn wwBtnSecondary" id="wwResetChasers">Reset to defaults</button>' +
        '</div>' +
    '</div>';
}

function livePanelHtml() {
    const rows = _s.chasers.map(function(c) {
        const live = !!_s.liveMap[c.channelId];
        return '<label class="wwLivePanelRow">' +
            '<input type="checkbox" data-ww="liveToggle" data-cid="' + esc(c.channelId) + '"' + (live ? ' checked' : '') + '>' +
            '<span class="wwLivePanelName">' + esc(c.name) + '</span>' +
            '<span class="wwLivePanelStatus">' + (live ? 'LIVE' : 'Offline') + '</span>' +
        '</label>';
    }).join('');

    return '<div class="wwManage">' +
        '<div class="wwManageTopbar">' +
            '<strong class="wwManageHeading">Live Control Panel</strong>' +
            '<button class="wwBtn" id="wwLivePanelClose">← Back</button>' +
        '</div>' +
        '<div class="wwLivePanelList">' + rows + '</div>' +
        '<div class="wwManageAddRow">' +
            '<button class="wwBtn wwBtnSecondary" id="wwClearLive">Clear all</button>' +
            '<button class="wwBtn" id="wwMarkAllLive">Mark all live</button>' +
        '</div>' +
    '</div>';
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
function render() {
    if (!_s.container) return;
    const $c = $(_s.container);
    $c.off('.ww');

    if (_s.view === 'full' && _s.selected) {
        $c.html(fullscreenHtml(_s.selected));
        bindFullscreenEvents($c);
    } else if (_s.view === 'manage') {
        $c.html(managePanelHtml());
        bindManageEvents($c);
    } else if (_s.view === 'live') {
        $c.html(livePanelHtml());
        bindLiveEvents($c);
    } else {
        $c.html(gridHtml());
        bindGridEvents($c);
    }
}

// ---------------------------------------------------------------------------
// Event binding
// ---------------------------------------------------------------------------
function bindGridEvents($c) {
    $c.on('input.ww', '#wwSearch', function() {
        _s.query = $(this).val();
        render();
    });
    $c.on('change.ww', '#wwLiveOnly', function() {
        _s.prefs.liveOnly = $(this).is(':checked');
        lsSet(LS_PREFS, _s.prefs);
        render();
    });
    $c.on('change.ww', '#wwCompact', function() {
        _s.prefs.compact = $(this).is(':checked');
        lsSet(LS_PREFS, _s.prefs);
        render();
    });
    $c.on('change.ww', '#wwSize', function() {
        _s.prefs.size = $(this).val();
        lsSet(LS_PREFS, _s.prefs);
        render();
    });
    $c.on('change.ww', '#wwCols', function() {
        var v = $(this).val();
        _s.prefs.cols = v === 'auto' ? 'auto' : Number(v);
        lsSet(LS_PREFS, _s.prefs);
        render();
    });
    $c.on('click.ww', '#wwReloadAll', function() {
        _s.nonce = Date.now();
        render();
    });
    $c.on('click.ww', '#wwLivePanel', function() {
        _s.view = 'live';
        render();
    });
    $c.on('click.ww', '#wwManageBtn', function() {
        _s.view = 'manage';
        render();
    });

    // Tile: fullscreen
    $c.on('click.ww', '[data-ww="full"]', function(e) {
        e.stopPropagation();
        var cid = $(this).data('cid');
        _s.selected = _s.chasers.find(function(c) { return c.channelId === cid; }) || null;
        if (_s.selected) { _s.view = 'full'; render(); }
    });

    // Tile: reload single
    $c.on('click.ww', '[data-ww="reload"]', function(e) {
        e.stopPropagation();
        var cid    = String($(this).data('cid'));
        var muted  = _s.mutes[cid] !== false;
        var iframe = $(this).closest('.wwTile').find('.wwTileFrame');
        iframe.attr('src', buildEmbedUrl(cid, muted, Date.now()));
    });

    // Tile: mute toggle (no full re-render for perf)
    $c.on('click.ww', '[data-ww="mute"]', function(e) {
        e.stopPropagation();
        var cid   = String($(this).data('cid'));
        var wasMuted = _s.mutes[cid] !== false;
        _s.mutes[cid] = !wasMuted; // true = unmuted in our map; false = muted
        // Normalise: "not muted" = explicit false; "muted" = true (or absent)
        // Simpler: use false for unmuted, delete key for muted
        if (wasMuted) {
            _s.mutes[cid] = false; // unmute
        } else {
            delete _s.mutes[cid]; // back to default (muted)
        }
        lsSet(LS_MUTES, _s.mutes);
        var nowMuted = _s.mutes[cid] !== false;
        var $btn = $(this);
        $btn.text(nowMuted ? 'Unmute' : 'Mute').toggleClass('wwMiniBtnOn', !nowMuted);
        var iframe = $btn.closest('.wwTile').find('.wwTileFrame');
        iframe.attr('src', buildEmbedUrl(cid, nowMuted, _s.nonce));
    });

    // Drag/drop reordering
    $c.on('dragstart.ww', '.wwTile', function(e) {
        _s.dragFrom = String($(this).data('cid'));
        e.originalEvent.dataTransfer.effectAllowed = 'move';
        e.originalEvent.dataTransfer.setData('text/plain', _s.dragFrom);
        $(this).addClass('wwDragging');
    });
    $c.on('dragend.ww', '.wwTile', function() {
        _s.dragFrom = null;
        $('.wwTile').removeClass('wwDragging wwDragOver');
    });
    $c.on('dragover.ww', '.wwTile', function(e) {
        e.preventDefault();
        if (!_s.dragFrom) return;
        var cid = String($(this).data('cid'));
        if (cid !== _s.dragFrom) {
            $('.wwTile').removeClass('wwDragOver');
            $(this).addClass('wwDragOver');
        }
    });
    $c.on('dragleave.ww', '.wwTile', function() {
        $(this).removeClass('wwDragOver');
    });
    $c.on('drop.ww', '.wwTile', function(e) {
        e.preventDefault();
        var from = _s.dragFrom || e.originalEvent.dataTransfer.getData('text/plain');
        var to   = String($(this).data('cid'));
        if (from && to && from !== to) {
            var fi = _s.chasers.findIndex(function(c) { return c.channelId === from; });
            var ti = _s.chasers.findIndex(function(c) { return c.channelId === to; });
            if (fi >= 0 && ti >= 0) {
                var item = _s.chasers.splice(fi, 1)[0];
                _s.chasers.splice(ti, 0, item);
                lsSet(LS_CHASERS, _s.chasers);
                render();
            }
        }
        _s.dragFrom = null;
    });
}

function bindFullscreenEvents($c) {
    $c.on('click.ww', '#wwFullBack', function() {
        _s.view = 'grid';
        _s.selected = null;
        render();
    });
    $c.on('click.ww', '#wwFullPrev', function() {
        var cur = _s.chasers.findIndex(function(c) { return c.channelId === _s.selected.channelId; });
        _s.selected = _s.chasers[(cur - 1 + _s.chasers.length) % _s.chasers.length];
        render();
    });
    $c.on('click.ww', '#wwFullNext', function() {
        var cur = _s.chasers.findIndex(function(c) { return c.channelId === _s.selected.channelId; });
        _s.selected = _s.chasers[(cur + 1) % _s.chasers.length];
        render();
    });
    $c.on('click.ww', '#wwFullReload', function() {
        var muted = _s.mutes[_s.selected.channelId] !== false;
        $c.find('.wwFullFrame').attr('src', buildEmbedUrl(_s.selected.channelId, muted, Date.now()));
    });
}

function bindManageEvents($c) {
    $c.on('click.ww', '#wwManageClose', function() {
        _s.view = 'grid';
        render();
    });
    $c.on('click.ww', '[data-ww="removeChaser"]', function() {
        var idx = Number($(this).data('idx'));
        _s.chasers.splice(idx, 1);
        lsSet(LS_CHASERS, _s.chasers);
        render(); // re-render manage view
        _s.view = 'manage';
        render();
    });
    $c.on('click.ww', '#wwAddChaser', function() {
        var name = $('#wwAddName').val().trim();
        var cid  = $('#wwAddCid').val().trim();
        if (!name || !cid) return;
        if (_s.chasers.some(function(c) { return c.channelId === cid; })) return;
        _s.chasers.push({ name: name, channelId: cid });
        lsSet(LS_CHASERS, _s.chasers);
        _s.view = 'manage';
        render();
    });
    $c.on('click.ww', '#wwResetChasers', function() {
        _s.chasers = DEFAULT_CHASERS.slice();
        lsSet(LS_CHASERS, _s.chasers);
        _s.view = 'manage';
        render();
    });
}

function bindLiveEvents($c) {
    $c.on('click.ww', '#wwLivePanelClose', function() {
        _s.view = 'grid';
        render();
    });
    $c.on('change.ww', '[data-ww="liveToggle"]', function() {
        var cid = String($(this).data('cid'));
        if ($(this).is(':checked')) {
            _s.liveMap[cid] = true;
        } else {
            delete _s.liveMap[cid];
        }
        lsSet(LS_LIVE, _s.liveMap);
        // Update status label inline
        var $row = $(this).closest('.wwLivePanelRow');
        $row.find('.wwLivePanelStatus').text(_s.liveMap[cid] ? 'LIVE' : 'Offline');
    });
    $c.on('click.ww', '#wwClearLive', function() {
        _s.liveMap = {};
        lsSet(LS_LIVE, _s.liveMap);
        render();
        _s.view = 'live';
        render();
    });
    $c.on('click.ww', '#wwMarkAllLive', function() {
        _s.chasers.forEach(function(c) { _s.liveMap[c.channelId] = true; });
        lsSet(LS_LIVE, _s.liveMap);
        render();
        _s.view = 'live';
        render();
    });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
function mount(container) {
    ensureState();
    _s.container = container;
    _s.view      = _s.view || 'grid'; // preserve view across mounts
    render();
}

function unmount() {
    if (_s.container) {
        $(_s.container).off('.ww');
    }
    _s.container = null;
}

module.exports = { mount: mount, unmount: unmount };
