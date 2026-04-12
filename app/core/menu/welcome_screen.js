const WELCOME_OPTIONS = [
    {
        key: 'watch',
        eyebrow: 'Live Storm Coverage',
        title: 'Watch active storms unfold in real time',
        copy: 'Best when you want immediate storm coverage, live chaser feeds, and the fastest visual read on what is happening right now.',
        persona: 'Best for live event tracking',
        opens: 'Opens Watch with the live wall and stream tools',
        outcome: 'You get instant access to chasers, stream filtering, and live situational awareness',
        accent: 'cyan',
        cta: 'Open Live Watch',
    },
    {
        key: 'radar',
        eyebrow: 'Radar Analysis',
        title: 'Work a storm like a serious radar operator',
        copy: 'Best when you want to inspect storm structure, change radar products, compare towers, and manually analyze what the atmosphere is doing.',
        persona: 'Best for storm analysis',
        opens: 'Opens Radar Workspace with products, towers, and controls',
        outcome: 'You get the full WeatherWatch radar environment for hands-on storm breakdowns',
        accent: 'split',
        cta: 'Open Radar Workspace',
    },
    {
        key: 'premium',
        eyebrow: 'WeatherWatch Academy',
        title: 'Train yourself to read radar and models correctly',
        copy: 'Best when you want guided lessons, clear explanations, and a structured path to understanding weather the way a meteorologist would.',
        persona: 'Best for learning and training',
        opens: 'Opens Academy and starts with guided lesson content',
        outcome: 'You get step-by-step training instead of raw tools first',
        accent: 'amber',
        cta: 'Start Learning',
    },
    {
        key: 'alerts',
        eyebrow: 'Warnings and Hazards',
        title: 'Check what is active, urgent, and nearby',
        copy: 'Best when severe weather is already underway and you need a fast list of alerts, warning types, and active hazard information.',
        persona: 'Best for urgent weather checks',
        opens: 'Opens Alerts with active warning information',
        outcome: 'You get a quicker hazard-focused view when timing matters',
        accent: 'red',
        cta: 'Open Alerts',
    },
    {
        key: 'outlooks',
        eyebrow: 'Forecast Planning',
        title: 'See the bigger setup before storms fire',
        copy: 'Best when you want the broader forecast picture, shifting risk zones, and an idea of what may matter later today or over the next few days.',
        persona: 'Best for planning ahead',
        opens: 'Opens Outlooks and broader forecast guidance',
        outcome: 'You get the strategic view instead of only the live moment',
        accent: 'violet',
        cta: 'Open Outlooks',
    },
    {
        key: 'ai',
        eyebrow: 'Guided Help',
        title: 'Let WeatherWatch help you decide where to go',
        copy: 'Best when you are not fully sure what tool you need and want guided help interpreting conditions, next steps, or the right part of the app to use.',
        persona: 'Best for questions and guidance',
        opens: 'Opens the AI experience for guided help',
        outcome: 'You get a faster starting point when you need direction',
        accent: 'blue',
        cta: 'Open AI Guide',
    },
];

function renderWelcomeOptions() {
    const cardsHtml = WELCOME_OPTIONS.map((option) => `
        <button class="weatherWatchWelcomeCard weatherWatchWelcomeCard-${option.accent}" type="button" data-weatherwatch-welcome="${option.key}">
            <span class="weatherWatchWelcomeCardGlow" aria-hidden="true"></span>
            <span class="weatherWatchWelcomeCardEyebrow">${option.eyebrow}</span>
            <span class="weatherWatchWelcomeCardTitle">${option.title}</span>
            <span class="weatherWatchWelcomeCardCopy">${option.copy}</span>
            <span class="weatherWatchWelcomeCardMeta">
                <span class="weatherWatchWelcomeCardTag">${option.persona}</span>
                <span class="weatherWatchWelcomeCardDetail">${option.opens}</span>
                <span class="weatherWatchWelcomeCardDetail">${option.outcome}</span>
            </span>
            <span class="weatherWatchWelcomeCardCta">${option.cta}</span>
        </button>
    `).join('');

    $('#weatherWatchWelcomeBody').html(cardsHtml);
}

function showWelcomeScreen() {
    renderWelcomeOptions();
    $('body').addClass('weatherWatchWelcomeOpen');
    $('#weatherWatchWelcome').stop(true, true).fadeIn(180);
}

function hideWelcomeScreen() {
    $('#weatherWatchWelcome').stop(true, true).fadeOut(160);
    $('body').removeClass('weatherWatchWelcomeOpen');
}

function routeWelcomeChoice(target) {
    hideWelcomeScreen();
    $(document).trigger('weatherwatch:navigate', [{ target }]);
}

$(document).on('click', '[data-weatherwatch-welcome]', function () {
    routeWelcomeChoice($(this).attr('data-weatherwatch-welcome'));
});

$('#weatherWatchGuideBtn').on('click', showWelcomeScreen);
$('#weatherWatchWelcomeClose, .weatherWatchWelcomeBackdrop').on('click', function () {
    hideWelcomeScreen();
});
$('#weatherWatchWelcomeExplore').on('click', function () {
    routeWelcomeChoice('watch');
});

$(document).on('weatherwatch:show-welcome', showWelcomeScreen);

window.addEventListener('message', function (event) {
    if (event.origin !== window.location.origin) return;
    if (!event.data || event.data.type !== 'storm-grid-open-guide') return;
    showWelcomeScreen();
});

showWelcomeScreen();

module.exports = {
    showWelcomeScreen,
    hideWelcomeScreen,
};
