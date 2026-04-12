const ACADEMY_TRACKS = [
    { title: 'Lesson 1: What Radar Actually Does', status: 'Live now', state: 'active' },
    { title: 'Lesson 2: Reading Reflectivity With Confidence', status: 'Coming next', state: 'next' },
    { title: 'Lesson 3: Velocity And Storm Motion', status: 'Locked', state: 'locked' },
    { title: 'Lesson 4: Rotation And Tornado Clues', status: 'Locked', state: 'locked' },
    { title: 'Lesson 5: Correlation Coefficient And Debris', status: 'Locked', state: 'locked' },
    { title: 'Lesson 6: Real-World Radar Case Studies', status: 'Locked', state: 'locked' },
];

const ACADEMY_QUIZ = [
    'What does reflectivity measure?',
    'Why does radar distance matter when viewing a storm?',
    'What does a higher dBZ usually mean?',
    'Does red on radar automatically mean a tornado?',
    'Why can reflectivity alone not tell the full story of a storm?',
];

const PAGE_DEFS = [
    { key: 'watch', label: 'Watch', title: 'Weather Watch', tier: 'core', body: 'Storm Chaser Grid uses this as a live TV wall for storm chaser streams. In AtticRadar, this can grow into a future watch wall or a launch point for external storm coverage.', actions: [{ label: 'Open YouTube Live', href: 'https://www.youtube.com/live' }, { label: 'Open Grid Preview', action: 'preview' }] },
    { key: 'premium', label: 'Academy', title: 'WeatherWatch Academy', tier: 'secondary', body: 'Premium lessons teach users how to read radar and models like a meteorologist, directly inside WeatherWatch.', actions: [{ label: 'Open Radar Workspace', action: 'native-radar' }] },
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
    return `./storm-grid-app/index.html?tab=${encodeURIComponent(pageKey)}&embedded=1`;
}

function triggerAction(action) {
    if (action === 'preview') {
        $(document).trigger('storm-grid-preview:show');
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
        setTimeout(() => $(document).trigger('storm-grid-preview:show'), 80);
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

function renderPremiumAcademy() {
    const lessonRail = ACADEMY_TRACKS.map((lesson) => `
        <div class="wwAcademyLessonRailItem ${lesson.state === 'active' ? 'is-active' : ''} ${lesson.state === 'locked' ? 'is-locked' : ''}">
            <div class="wwAcademyLessonRailTitle">${lesson.title}</div>
            <div class="wwAcademyLessonRailMeta">${lesson.status}</div>
        </div>
    `).join('');

    const quizItems = ACADEMY_QUIZ.map((question, index) => `
        <div class="wwAcademyQuizItem">
            <span class="wwAcademyQuizNumber">${index + 1}</span>
            <span>${question}</span>
        </div>
    `).join('');

    return `
        <section class="stormPagesCompactBar">
            <div class="stormPagesCompactTitle">WeatherWatch Academy</div>
            <div class="stormPagesCompactActions">
                <button class="stormPagesActionBtn" type="button" data-storm-page-key="radar">Open Radar Workspace</button>
                <button class="stormPagesActionBtn" type="button" data-storm-page-key="ai">Open AI Coach</button>
            </div>
        </section>
        <section class="wwAcademyWrap">
            <div class="wwAcademyGrid">
                <aside class="wwAcademySidebar">
                    <div class="wwAcademySidebarCard wwAcademySidebarHero">
                        <div class="wwAcademyEyebrow">Premium Course</div>
                        <div class="wwAcademySidebarTitle">How To Read Radar Like A Meteorologist</div>
                        <div class="wwAcademySidebarCopy">Built for WeatherWatch users who want guided training, meteorologist-style thinking, and lessons that connect directly to the live radar workspace.</div>
                        <div class="wwAcademyChipRow">
                            <span class="wwAcademyChip">Lesson 1 live</span>
                            <span class="wwAcademyChip">Radar foundations</span>
                            <span class="wwAcademyChip">Interactive practice</span>
                        </div>
                    </div>
                    <div class="wwAcademySidebarCard">
                        <div class="wwAcademySectionTitle">Course Path</div>
                        <div class="wwAcademyLessonRail">${lessonRail}</div>
                    </div>
                    <div class="wwAcademySidebarCard">
                        <div class="wwAcademySectionTitle">This Lesson Covers</div>
                        <div class="wwAcademyChecklist">
                            <div class="wwAcademyChecklistItem">What radar is actually showing</div>
                            <div class="wwAcademyChecklistItem">What reflectivity means</div>
                            <div class="wwAcademyChecklistItem">What dBZ means at a beginner level</div>
                            <div class="wwAcademyChecklistItem">What radar can and cannot tell you</div>
                            <div class="wwAcademyChecklistItem">Why distance from radar matters</div>
                        </div>
                    </div>
                </aside>
                <div class="wwAcademyMain">
                    <section class="wwAcademyHeroCard">
                        <div class="wwAcademyEyebrow">Lesson 1</div>
                        <div class="wwAcademyTitle">What Radar Actually Does</div>
                        <div class="wwAcademyLead">Before you can read storms like a meteorologist, you need to understand what radar is actually showing you. Radar is not just a weather picture. It is a measuring tool, and learning how it works is the first step to reading storms correctly.</div>
                        <div class="wwAcademyMetaRow">
                            <div class="wwAcademyMiniStat">
                                <div class="wwAcademyMiniStatLabel">Lesson Goal</div>
                                <div class="wwAcademyMiniStatValue">Understand what radar shows, what reflectivity means, what dBZ means, and why distance from radar matters.</div>
                            </div>
                            <div class="wwAcademyMiniStat">
                                <div class="wwAcademyMiniStatLabel">Lesson Type</div>
                                <div class="wwAcademyMiniStatValue">Premium guided tutorial</div>
                            </div>
                        </div>
                    </section>

                    <section class="wwAcademyContentGrid">
                        <article class="wwAcademyCard">
                            <div class="wwAcademyCardTitle">What Is Radar?</div>
                            <div class="wwAcademyCardBody">Many people believe that radar is just a weather picture. It isn’t. Radar is a tool that meteorologists use to measure weather at a professional level. It sends out energy signals, and when that energy comes back, the radar tower is able to gather information about storms. That information is then turned into a live radar display for everyone to see. This may sound complicated at first, but we will break it all down in this lesson.</div>
                        </article>
                        <article class="wwAcademyCard">
                            <div class="wwAcademyCardTitle">What Radar Does</div>
                            <div class="wwAcademyCardBody">A radar sends out a beam of energy called radio waves. These radio waves travel through the air until they reach rain, hail, snow, debris, or other things in the atmosphere. Once the beam hits something, some of that energy bounces back to the radar. The radar measures how much energy returns and places that information onto a colored display map. So when you look at radar, you are not just looking at colors, you are looking at data gathered by radio waves.</div>
                        </article>
                        <article class="wwAcademyCalloutCard">
                            <div class="wwAcademyCalloutLabel">Key Takeaway</div>
                            <div class="wwAcademyCalloutText">Radar does not see storms the way your eyes do. It measures returned energy and turns that information into a display.</div>
                        </article>
                    </section>

                    <section class="wwAcademyStack">
                        <article class="wwAcademyCard">
                            <div class="wwAcademyCardTitle">What Reflectivity Means</div>
                            <div class="wwAcademyCardBody">Reflectivity is the heart of radar and is what many people think of when they picture a radar image. Reflectivity is the display with the green, yellow, red, and sometimes purple colors. Reflectivity measures how much energy comes back to the radar after the beam hits something in the air. The more energy that comes back, the stronger the return. Stronger returns often indicate heavier precipitation and can sometimes suggest hail. What reflectivity does not do by itself is show tornadoes or confirm rotation inside a storm.</div>
                        </article>
                        <article class="wwAcademyCard">
                            <div class="wwAcademyCardTitle">What dBZ Means</div>
                            <div class="wwAcademyCardBody">dBZ is the scale used to measure reflectivity strength. For example, 20 dBZ usually shows light rain showers and often appears green on a reflectivity radar. Around 50 dBZ usually shows stronger rain and heavier downpours, often appearing red on the scale. Anything above 60 dBZ can indicate a very intense storm core and may suggest hail, especially when other storm characteristics support it. In simple terms, higher dBZ means a stronger return to the radar.</div>
                        </article>
                        <article class="wwAcademyCalloutCard wwAcademyCalloutCard-blue">
                            <div class="wwAcademyCalloutLabel">Pro Tip</div>
                            <div class="wwAcademyCalloutText">You do not need to memorize every dBZ number right away. At this stage, just remember this: higher dBZ usually means a stronger return.</div>
                        </article>
                        <article class="wwAcademyCard">
                            <div class="wwAcademyCardTitle">What The Colors Mean</div>
                            <div class="wwAcademyCardBody">Earlier in the lesson, we touched on radar colors, but there is more to it than just green, yellow, red, and purple. On radar, lighter or cooler colors usually signal weaker returns, while warmer and deeper colors usually signal stronger returns back to the tower. Color tables and legends can change depending on the radar and the display style. One important thing to remember is that red does not automatically mean a tornado. The colors represent dBZ values, and darker or more intense colors usually mean higher reflectivity.</div>
                        </article>
                        <article class="wwAcademyCalloutCard wwAcademyCalloutCard-red">
                            <div class="wwAcademyCalloutLabel">Myth vs Truth</div>
                            <div class="wwAcademyCalloutText"><strong>Myth:</strong> Red on radar means tornado.<br><strong>Truth:</strong> Red on radar usually means a stronger reflectivity return. Tornado confirmation requires more information than reflectivity alone.</div>
                        </article>
                    </section>

                    <section class="wwAcademyContentGrid wwAcademyContentGrid-two">
                        <article class="wwAcademyCard">
                            <div class="wwAcademyCardTitle">What Radar Can Tell You</div>
                            <div class="wwAcademyCardBody">Radar can tell you many important things, including where storms are located, how intense the precipitation appears to be, how organized storms are, where the core of a storm is, and where important storm features may be located. Storm location is one of the most important things radar can tell you because it gives you time to prepare if a storm is moving toward your area. Radar can also help show how organized a storm has become. In many cases, more organized storms are more capable of producing severe weather than scattered, disorganized storms.</div>
                        </article>
                        <article class="wwAcademyCard">
                            <div class="wwAcademyCardTitle">What Radar Can’t Tell You Alone</div>
                            <div class="wwAcademyCardBody">Reflectivity alone does not confirm that a tornado is active. It can give clues that something important may be happening, but without another radar mode called velocity, you cannot tell the full story. Reflectivity also does not fully explain storm motion. It shows you where the storm is, but not exactly how the winds inside the storm are moving. Also, reflectivity is not a ground-level view of the storm. Radar beams are pointed upward into the atmosphere, so the radar is often scanning storms above the ground. Sometimes a storm can look less dramatic than it really is, and other times it can look stronger than expected. That is why meteorologists use multiple radar modes and warning information together.</div>
                        </article>
                    </section>

                    <section class="wwAcademyStack">
                        <article class="wwAcademyCard">
                            <div class="wwAcademyCardTitle">Why Distance From The Radar Matters</div>
                            <div class="wwAcademyCardBody">Distance matters when it comes to radar information. Because the radar beam is tilted upward, the farther away a storm is from the radar tower, the higher in the storm the radar is sampling. That means if you are looking at a storm from a radar that is far away, you may be seeing the storm higher up instead of near the ground. This can cause low-level features to be missed. Another reason radar distance matters is because the same storm can look different depending on which radar location is viewing it.</div>
                        </article>
                        <article class="wwAcademyPracticeCard">
                            <div class="wwAcademyCardTitle">Try It In WeatherWatch</div>
                            <div class="wwAcademyChecklist">
                                <div class="wwAcademyChecklistItem">Find an area with light precipitation.</div>
                                <div class="wwAcademyChecklistItem">Compare that area to a stronger storm core.</div>
                                <div class="wwAcademyChecklistItem">Look at the difference in dBZ values.</div>
                                <div class="wwAcademyChecklistItem">Find where the main core of the storm is located.</div>
                                <div class="wwAcademyChecklistItem">Compare storms at different distances from the radar tower.</div>
                            </div>
                            <div class="wwAcademyActionRow">
                                <button class="stormPagesActionBtn" type="button" data-storm-page-key="radar">Practice In Radar Workspace</button>
                            </div>
                        </article>
                    </section>

                    <section class="wwAcademyContentGrid wwAcademyContentGrid-two">
                        <article class="wwAcademyCard">
                            <div class="wwAcademyCardTitle">Quick Check</div>
                            <div class="wwAcademyQuizList">${quizItems}</div>
                        </article>
                        <article class="wwAcademyCard">
                            <div class="wwAcademyCardTitle">Lesson Wrap-Up</div>
                            <div class="wwAcademyCardBody">In this lesson, we learned what radar is, what it does, what reflectivity is, what dBZ means, what the colors on radar represent, what radar can and cannot tell you, and why distance matters.</div>
                            <div class="wwAcademyDivider"></div>
                            <div class="wwAcademyCardTitle">What Comes Next</div>
                            <div class="wwAcademyCardBody">Get ready for Lesson 2, where you will learn how to read reflectivity with more confidence and how to better identify storm systems.</div>
                        </article>
                    </section>
                </div>
            </div>
        </section>
    `;
}

function renderContent() {
    const page = PAGE_DEFS.find((item) => item.key === activeKey) || PAGE_DEFS[0];
    $('#stormPagesNow').text(`Now: ${page.title}`);
    const $panel = $('#stormPagesShell .stormPagesPanel');
    const $topbar = $('#stormPagesShell .stormPagesTopbar');
    const $tabbar = $('#stormPagesShell .stormPagesTabbar');

    const actions = (page.actions || []).map((item) => {
        if (item.href) {
            return `<a class="stormPagesActionBtn" href="${item.href}" target="_blank" rel="noreferrer">${item.label}</a>`;
        }
        return `<button class="stormPagesActionBtn" type="button" data-storm-page-action="${item.action}">${item.label}</button>`;
    }).join('');

    const links = (page.links || []).map((item) => (
        `<a class="stormPagesLinkCard" href="${item.href}" target="_blank" rel="noreferrer">${item.label}</a>`
    )).join('');

    const isNativeRadar = page.key === 'radar';
    const isNativeAcademy = page.key === 'premium';
    const shouldEmbedGrid = !isNativeRadar && !isNativeAcademy;
    $panel.toggleClass('stormPagesGridMode', shouldEmbedGrid);
    $topbar.show();
    $tabbar.show();

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
    ` : isNativeAcademy ? renderPremiumAcademy() : `
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

function setActivePage(nextKey, options = {}) {
    const { open = true, immediate = true } = options;
    if (!nextKey) return;
    if (nextKey === 'radar') {
        triggerAction('native-radar');
        return;
    }

    const pageExists = PAGE_DEFS.some((page) => page.key === nextKey);
    if (!pageExists) return;

    activeKey = nextKey;
    moreOpen = false;
    renderPages();

    if (open) {
        openPages(immediate);
    }
}

function openPages(immediate = false) {
    renderPages();
    $(document).trigger('storm-grid-preview:hide');
    $('body').addClass('stormPagesOpen');
    $('body').addClass('stormPagesPrimaryApp');
    const shell = $('#stormPagesShell').stop(true, true);
    if (immediate) {
        shell.show();
    } else {
        shell.fadeIn(150);
    }
    setTimeout(() => {
        if (window.map && window.map.resize) {
            window.map.resize();
        }
    }, immediate ? 0 : 170);
}

function closePages() {
    $('#stormPagesShell').stop(true, true).fadeOut(150);
    $('body').removeClass('stormPagesOpen');
    $('body').removeClass('stormPagesPrimaryApp');
    setTimeout(() => {
        if (window.map && window.map.resize) {
            window.map.resize();
        }
    }, 170);
}

$('#stormPagesToggle').on('click', openPages);
$('#radarHeaderPagesBtn').on('click', openPages);
$('#stormPagesClose, .stormPagesBackdrop').on('click', closePages);

$(document).on('click', '[data-storm-page-key]', function () {
    const nextKey = $(this).attr('data-storm-page-key');
    if (nextKey === 'radar') {
        moreOpen = false;
        renderNav();
        triggerAction('native-radar');
        return;
    }
    setActivePage(nextKey, { open: false });
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

$(document).on('weatherwatch:navigate', function (_, detail = {}) {
    const target = detail.target || detail.key || 'watch';
    if (target === 'radar') {
        triggerAction('native-radar');
        return;
    }
    setActivePage(target, { open: true, immediate: true });
});

openPages(true);

module.exports = {
    openPages,
    closePages,
    setActivePage,
    triggerAction,
};
