const PAGE_DEFS = [
    { key: 'watch', label: 'Watch', title: 'Weather Watch', tier: 'core', body: 'Storm Chaser Grid uses this as a live TV wall for storm chaser streams. In AtticRadar, this can grow into a future watch wall or a launch point for external storm coverage.', actions: [{ label: 'Open YouTube Live', href: 'https://www.youtube.com/live' }, { label: 'Open Grid Preview', action: 'preview' }] },
    { key: 'premium', label: 'Premium', title: 'Premium', tier: 'secondary', body: 'The grid app uses this page for premium nowcast and model tools. AtticRadar now has a matching page slot for future model guidance, forecast summaries, or private tools.', actions: [{ label: 'Open Radar Workspace', action: 'close-pages' }] },
    { key: 'ai', label: 'AI', title: 'WeatherWatch AI', tier: 'secondary', body: 'In Storm Chaser Grid this page hosts an AI weather assistant with location context and chat. This AtticRadar page gives it a dedicated destination without touching the radar page.', actions: [{ label: 'Open ChatGPT', href: 'https://chat.openai.com/' }] },
    { key: 'radar', label: 'Radar Workspace', title: 'Radar Workspace', tier: 'core', body: 'The Grid Preview radar shell is now the permanent radar experience inside AtticRadar. Storm Chaser Grid continues to supply the non-radar pages, while Radar routes into the new imported shell instead of the legacy radar UI.', actions: [{ label: 'Open Radar Workspace', action: 'native-radar' }] },
    { key: 'fronts', label: 'Fronts', title: 'Fronts', tier: 'core', body: 'The grid app has a dedicated fronts page with search, overlays, and local weather context. This Attic page now acts as the dedicated home for fronts-related work.', actions: [{ label: 'Toggle Surface Fronts', action: 'fronts' }] },
    { key: 'risk', label: 'Risk', title: 'Local Risk', tier: 'core', body: 'Storm Chaser Grid includes a local severe risk page focused on SPC-style outlook context. This page slot is now present in AtticRadar for future local threat tools.', actions: [{ label: 'Open SPC Outlooks Menu', action: 'spc' }] },
    { key: 'lightning', label: 'Lightning', title: 'Lightning', tier: 'secondary', body: 'The grid app provides a standalone lightning page with map overlays and controls. This gives AtticRadar the same page-level destination even before a full lightning port.', actions: [{ label: 'Open Settings Menu', action: 'settings' }] },
    { key: 'alerts', label: 'Alerts', title: 'Alerts', tier: 'core', body: 'Storm Chaser Grid separates alerts into their own page. This Attic version is now a dedicated page shell backed by the real existing warning controls.', actions: [{ label: 'Toggle Alerts', action: 'alerts' }, { label: 'Toggle Warning Polygons', action: 'warnings' }] },
    { key: 'reports', label: 'Reports', title: 'Reports', tier: 'core', body: 'The grid app includes storm report filtering, searching, and map interaction on its reports page. AtticRadar now has a matching page destination for future LSR work.', actions: [{ label: 'Open Storm Events Database', href: 'https://www.ncei.noaa.gov/access/search/service/search' }] },
    { key: 'timezones', label: 'Time', title: 'Timezones', tier: 'tertiary', body: 'Storm Chaser Grid includes a full time utility page with stopwatch, countdown, and UTC conversion. This page slot is now reserved in AtticRadar for that utility-style workflow.', actions: [{ label: 'Open time.is', href: 'https://time.is/UTC' }] },
    { key: 'chase', label: 'Chase', title: 'Chase Tools', tier: 'tertiary', body: 'The grid app has chase routing and trip-planning helpers. This page gives AtticRadar a dedicated chase-tools destination separate from the radar controls.', actions: [{ label: 'Open Google Maps', href: 'https://www.google.com/maps' }] },
    { key: 'outlooks', label: 'Outlooks', title: 'Outlooks', tier: 'tertiary', body: 'Storm Chaser Grid uses a standalone outlooks page for SPC-centric planning. This now has its own page inside AtticRadar as well.', actions: [{ label: 'Open SPC Outlooks', href: 'https://www.spc.noaa.gov/products/outlook/' }, { label: 'Open SPC Menu', action: 'spc' }] },
    { key: 'websites', label: 'Websites', title: 'Weather Websites', tier: 'tertiary', body: 'The grid app keeps a curated weather links page including Pivotal Weather, Tropical Tidbits, SPC, and more. AtticRadar now has a matching page for that resource list.', links: [
        { label: 'Pivotal Weather', href: 'https://www.pivotalweather.com' },
        { label: 'Tropical Tidbits', href: 'https://www.tropicaltidbits.com/' },
        { label: 'SPC Outlooks', href: 'https://www.spc.noaa.gov/products/outlook/' },
        { label: 'WeatherWise', href: 'https://weatherwise.app' },
        { label: 'Attic Radar', href: 'https://steepatticstairs.github.io/AtticRadar/' },
    ] },
    { key: 'xweather', label: 'Xweather', title: 'Xweather MapsGL', tier: 'secondary', body: 'Storm Chaser Grid includes a dedicated Xweather page for MapsGL layers and timeline control. This page placeholder gives AtticRadar the same top-level structure.', actions: [{ label: 'Open Xweather', href: 'https://www.xweather.com/' }] },
    { key: 'hazcams', label: 'Hazcams', title: 'Hazcams (WXLogic)', tier: 'secondary', body: 'The grid app embeds Hazcams in its own page. AtticRadar now has a corresponding page destination for hazard camera tools or future embed work.', actions: [{ label: 'Open Hazcams', href: 'https://www.wxlogic.com/hazcams/' }] },
    { key: 'updates', label: 'Updates', title: 'Updates / Changelog', tier: 'tertiary', body: 'Storm Chaser Grid ships with a running changelog page. This Attic page can serve the same role as the migration continues.', actions: [{ label: 'Open Grid Preview', action: 'preview' }] },
    { key: 'about', label: 'About', title: 'About Me', tier: 'tertiary', body: 'The grid app includes an about page explaining the project direction and mission. AtticRadar now has a matching standalone page destination.', actions: [{ label: 'Open AtticRadar Site', href: 'https://steepatticstairs.github.io/AtticRadar/' }] },
    { key: 'instructions', label: 'Help', title: 'Instructions', tier: 'tertiary', body: 'Storm Chaser Grid has a full instructions page that explains how each tab works. This page gives AtticRadar a dedicated help destination in the same structure.', actions: [{ label: 'Open Settings Menu', action: 'settings' }] },
];

let activeKey = 'watch';
let moreOpen = false;
const MORE_TAB_KEYS = new Set(['xweather', 'hazcams', 'updates', 'about', 'instructions']);
const MAIN_TABS = PAGE_DEFS.filter((page) => !MORE_TAB_KEYS.has(page.key));
const MORE_TABS = PAGE_DEFS.filter((page) => MORE_TAB_KEYS.has(page.key));
function buildEmbedSrc(pageKey) {
    return `./storm-grid-app/index.html?tab=${encodeURIComponent(pageKey)}`;
}

function triggerAction(action) {
    if (action === 'preview') {
        $('#stormGridPreviewToggle').trigger('click');
    } else if (action === 'close-pages') {
        $('#stormPagesClose').trigger('click');
    } else if (action === 'settings') {
        $('#settingsItemClass').trigger('click');
    } else if (action === 'alerts') {
        $('#alertMenuItemIcon').trigger('click');
    } else if (action === 'fronts') {
        $('#armrSurfaceFrontsBtnSwitchElem').trigger('click');
    } else if (action === 'warnings') {
        $('#armrWarningsBtnSwitchElem').trigger('click');
    } else if (action === 'toggle-radar') {
        $('#armrRadarVisBtnSwitchElem').trigger('click');
    } else if (action === 'native-radar') {
        closePages();
        if (!$('#stormGridPreview').is(':visible')) {
            setTimeout(() => $('#stormGridPreviewToggle').trigger('click'), 60);
        }
    } else if (action === 'spc') {
        $('#settingsItemClass').trigger('click');
        setTimeout(() => $('#armrSPCOutlooksBtn').trigger('click'), 50);
    }
}

function renderNav() {
    const mainTabsHtml = MAIN_TABS.map((page) => (
        `<button class="stormPagesNavBtn ${page.key === activeKey ? 'is-active' : ''}" type="button" data-storm-page-key="${page.key}">${page.label}</button>`
    )).join('');

    const moreIsActive = MORE_TAB_KEYS.has(activeKey);
    const moreMenuHtml = MORE_TABS.map((page) => (
        `<button class="stormPagesMoreItem ${page.key === activeKey ? 'is-active' : ''}" type="button" data-storm-page-key="${page.key}">${page.title}</button>`
    )).join('');

    $('#stormPagesNav').html(
        mainTabsHtml +
        `<div class="stormPagesMoreWrap">
            <button class="stormPagesNavBtn ${moreIsActive ? 'is-active' : ''}" type="button" id="stormPagesMoreToggle" aria-haspopup="menu" aria-expanded="${moreOpen ? 'true' : 'false'}">More</button>
            ${moreOpen ? `<div class="stormPagesMoreMenu" role="menu" aria-label="More pages">${moreMenuHtml}</div>` : ''}
        </div>`
    );
}

function renderContent() {
    const page = PAGE_DEFS.find((item) => item.key === activeKey) || PAGE_DEFS[0];
    $('#stormPagesNow').text(`Now: ${page.title}`);
    const $panel = $('#stormPagesShell .stormPagesPanel');

    const actions = (page.actions || []).map((item) => {
        if (item.href) {
            return `<a class="stormPagesActionBtn" href="${item.href}" target="_blank" rel="noreferrer">${item.label}</a>`;
        }
        return `<button class="stormPagesActionBtn" type="button" data-storm-page-action="${item.action}">${item.label}</button>`;
    }).join('');

    const links = (page.links || []).map((item) => (
        `<a class="stormPagesLinkCard" href="${item.href}" target="_blank" rel="noreferrer">${item.label}</a>`
    )).join('');

    const shouldEmbedGrid = page.key !== 'radar';
    $panel.toggleClass('stormPagesGridMode', shouldEmbedGrid);

    $('#stormPagesContent').html(shouldEmbedGrid ? `
        <section class="stormPagesStage">
            <iframe
                class="stormPagesEmbedFrame"
                src="${buildEmbedSrc(page.key)}"
                title="${page.title}"
                loading="lazy"
                referrerpolicy="no-referrer"
            ></iframe>
        </section>
    ` : `
        <section class="stormPagesCompactBar">
            <div class="stormPagesCompactTitle">${page.title}</div>
            <div class="stormPagesCompactActions">${actions}${links}</div>
        </section>
        <section class="stormPagesStage stormPagesNativeRadarStage">
            <div class="stormPagesNativeRadarCard">
                <div class="stormPagesNativeRadarTitle">Permanent Radar</div>
                <div class="stormPagesNativeRadarText">
                    Radar lives in the imported Attic radar workspace. Use the control above to jump straight into that radar page while everything else keeps the Grid layout.
                </div>
            </div>
        </section>
    `);
}

function renderPages() {
    renderNav();
    renderContent();
}

function openPages() {
    renderPages();
    $('#stormPagesShell').fadeIn(150);
    $('body').addClass('stormPagesOpen');
    $('body').addClass('stormPagesPrimaryApp');
}

function closePages() {
    $('#stormPagesShell').fadeOut(150);
    $('body').removeClass('stormPagesOpen');
    $('body').removeClass('stormPagesPrimaryApp');
}

$('#stormPagesToggle').on('click', openPages);
$('#stormPagesClose, .stormPagesBackdrop').on('click', closePages);

$(document).on('click', '[data-storm-page-key]', function () {
    activeKey = $(this).attr('data-storm-page-key');
    moreOpen = false;
    renderPages();
});

$(document).on('click', '[data-storm-page-action]', function () {
    triggerAction($(this).attr('data-storm-page-action'));
});

$(document).on('click', '#stormPagesMoreToggle', function (event) {
    event.stopPropagation();
    moreOpen = !moreOpen;
    renderNav();
});

$(document).on('click', function (event) {
    if (!moreOpen) return;
    if ($(event.target).closest('.stormPagesMoreWrap').length) return;
    moreOpen = false;
    renderNav();
});

window.addEventListener('message', function (event) {
    if (event.origin !== window.location.origin) return;
    if (!event.data || event.data.type !== 'storm-grid-open-radar') return;
    triggerAction('native-radar');
});

setTimeout(openPages, 160);

module.exports = {
    openPages,
    closePages,
};
