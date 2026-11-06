const footer = document.querySelector('.changing-footer');
const launcher = document.querySelector('.launcher');
const workspace = document.querySelector('.workspace');
const workspaceContent = document.querySelector('#workspace-content');
v2const messages = ['inspired by x8rs cherri', 'do ur work boi', 'this is so tuffy', 'ohio sigma mode acitviated', 'brooklyn do your work now.', '#aizhirisabum', '#howualive??', 'c3 is a work in progress', 'scramjet is a work in progress', 'website looking so tuff', 'thanks to lyra.zip for the anime streaming', 'thanks to gmshelf for the games', 'im goated, really goated'];
const themes = ['nature', 'cozy', 'cyberpunk', 'lobotomy', 'alt', 'interstellar', 'matrix', 'hunt'];
const themeBackgrounds = {
  nature: 'nature.mp4',
  cozy: 'minecraft.mp4',
  cyberpunk: 'cyberpunk.mp4',
  lobotomy: 'lobotomy.mp4',
  alt: 'alt.mp4',
  interstellar: 'interstellar.mp4',
  matrix: 'matrix.mp4',
  hunt: 'Hunt.mp4'
};
const themeSounds = {
  nature: { start: 392, end: 523, wave: 'sine' },
  cozy: { start: 196, end: 262, wave: 'square' },
  cyberpunk: { start: 110, end: 880, wave: 'sawtooth' },
  lobotomy: { start: 220, end: 220, wave: 'triangle' },
  alt: { start: 146, end: 73, wave: 'sawtooth' },
  interstellar: { start: 174, end: 349, wave: 'sine' },
  matrix: { start: 330, end: 660, wave: 'square' },
  hunt: { start: 98, end: 147, wave: 'triangle' }
};
let audioContext;
let messageIndex = 0;
const themeBackground = document.querySelector('#theme-background');
const themeLogo = document.querySelector('#theme-logo');

const savedTheme = localStorage.getItem('c3-theme');
if (themes.includes(savedTheme)) document.body.dataset.theme = savedTheme;
setTheme(document.body.dataset.theme || themes[0]);

function setTheme(theme) {
  document.body.dataset.theme = theme;
  setThemeBackground(theme);
  setThemeLogo(theme);
}

function setThemeBackground(theme) {
  const filename = themeBackgrounds[theme];
  themeBackground.classList.toggle('active', Boolean(filename));
  themeBackground.src = `assets/videos/${filename}`;
  themeBackground.load();
  themeBackground.play().catch(() => {});
}

function setThemeLogo(theme) {
  themeLogo.src = `assets/theme-logos/${theme}.png`;
  themeLogo.onerror = () => {
    themeLogo.onerror = null;
    themeLogo.src = 'assets/logo.png';
  };
}

function formatThemeName(theme) {
  return theme.charAt(0).toUpperCase() + theme.slice(1);
}

function playThemeSound(theme = document.body.dataset.theme || 'nature') {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  audioContext ??= new AudioContext();
  if (audioContext.state === 'suspended') audioContext.resume();
  const sound = themeSounds[theme] || themeSounds.nature;
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = sound.wave;
  oscillator.frequency.setValueAtTime(sound.start, now);
  oscillator.frequency.exponentialRampToValueAtTime(sound.end, now + 0.12);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.055, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.17);
}

window.setInterval(() => {
  footer.classList.add('fade');
  window.setTimeout(() => {
    messageIndex = (messageIndex + 1) % messages.length;
    footer.textContent = messages[messageIndex];
    footer.classList.remove('fade');
  }, 220);
}, 2600);

function openWorkspace(view) {
  workspaceContent.innerHTML = views[view]();
  workspace.classList.add('open');
  launcher.classList.add('blurred');
  if (view === 'games') loadGames(getGameSource());
  if (view === 'browser') setupBrowser();
  if (view === 'anime') setupAnime();
  if (view === 'settings') setupSettings();
  if (view === 'music') setupMusic();
}

function closeWorkspace() {
  workspace.classList.remove('open');
  launcher.classList.remove('blurred');
  workspaceContent.replaceChildren();
}

document.querySelector('.workspace-close').addEventListener('click', closeWorkspace);

document.querySelectorAll('.tool').forEach((tool) => {
  tool.addEventListener('click', () => {
    playThemeSound();
    document.querySelector('.tool.active')?.classList.remove('active');
    tool.classList.add('active');
    const view = tool.dataset.view;
    if (view === 'home') closeWorkspace();
    else openWorkspace(view);
  });
});

const views = {
  browser: () => `<div class="view-header"><div><p class="kicker">Local Scramjet browser</p><h1>C3 browse</h1></div><form class="address-row" id="address-form"><button type="button" class="browser-control" id="browser-back" aria-label="Go back">‹</button><button type="button" class="browser-control" id="browser-forward" aria-label="Go forward">›</button><input id="address-input" type="url" placeholder="https://example.com" autocomplete="url" /><button class="action-button">Go</button></form></div><div class="browser-status"><span class="status-dot"></span><span id="browser-status-text">Starting local Scramjet...</span><a href="https://github.com/MercuryWorkshop/scramjet" target="_blank" rel="noreferrer">Runtime source</a></div><div class="proxy-frame" id="proxy-frame" title="C3 local Scramjet browser"></div>`,
  games: () => `<div class="view-header"><div><p class="kicker">gmshelf catalog</p><h1>Game shelf</h1></div><label class="source-select">Source <select id="game-source">${Object.keys(shelves).map((name) => `<option value="${name}">${name}</option>`).join('')}</select></label></div><div class="game-groups" id="game-groups"><p class="notice">Loading game shelf...</p></div><div class="game-player" id="game-player" hidden><div class="player-bar"><strong id="game-player-title">Loading game</strong><button id="game-player-close" class="player-close" aria-label="Close game">×</button></div><iframe id="game-frame" title="Game player"></iframe></div>`,
  anime: () => `<div class="view-header"><div><p class="kicker">AniList catalog · Lyra streams</p><h1>Anime</h1></div><form class="address-row" id="anime-search-form"><input id="anime-query" placeholder="Search anime" value="One Piece" /><button class="action-button">Search</button></form></div><div class="anime-layout"><section><div id="anime-results" class="anime-results"><p class="notice">Loading AniList...</p></div></section><section class="anime-player"><div class="player-bar"><strong id="anime-player-title">Choose a show</strong><span class="kicker">Lyra HLS</span></div><video id="anime-video" class="anime-video" controls playsinline></video><div id="anime-episodes" class="anime-episodes"><p class="notice">Select a show to see episodes.</p></div><p id="anime-player-status" class="player-status">Lyra direct stream is ready when you choose an episode.</p></section></div>`,
  music: () => `<div class="view-header"><div><p class="kicker">C3 music</p><h1>Listen</h1></div><a class="action-button" href="https://github.com/cherriunblocked/svg/tree/main/b" target="_blank" rel="noreferrer">Source reference</a></div><div class="music-layout"><section class="music-player"><div class="album-art" id="album-art">C3</div><div class="now-playing"><p class="kicker">Now playing</p><h2 id="now-playing-title">Choose a track</h2><p id="now-playing-artist">Search for an artist or song</p></div><audio id="audio-player" controls></audio></section><section class="music-search"><form class="search-row" id="music-search-form"><input id="music-query" placeholder="Search songs or artists" value="lofi" /><button class="action-button">Search</button></form><div id="music-results" class="music-results"><p class="notice">Search to load playable previews.</p></div></section></div>`,
  settings: () => `<div class="view-header"><div><p class="kicker">Personalize C3</p><h1>Settings</h1></div></div><p class="notice">Choose a visual theme and the game shelf used by the Games tab. Changes are saved in this browser.</p><h2 class="settings-heading">Themes</h2><div class="theme-grid">${themes.map((theme) => `<button class="theme-button" data-theme="${theme}"><span></span><strong>${formatThemeName(theme)}</strong></button>`).join('')}</div><h2 class="settings-heading">Game source</h2><div class="source-grid">${Object.keys(shelves).map((name) => `<button class="source-button" data-source="${name}"><strong>${name}</strong><small>${shelves[name].label}</small></button>`).join('')}</div>`
};

function setupBrowser() {
  const stage = document.querySelector('#proxy-frame');
  let scramFrame;
  window.C3ScramjetBrowser?.then(({ controller }) => {
    scramFrame = controller.createFrame();
    scramFrame.frame.className = 'scramjet-frame';
    stage.replaceChildren(scramFrame.frame);
    scramFrame.go('https://example.com');
    document.querySelector('#browser-status-text').textContent = 'Local Scramjet ready';
  }).catch((error) => { document.querySelector('#browser-status-text').textContent = `Scramjet failed: ${error.message}`; });
  document.querySelector('#address-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.querySelector('#address-input');
    let url = input.value.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    if (scramFrame) scramFrame.go(url);
    document.querySelector('#browser-status-text').textContent = `Loading ${url}`;
  });
  document.querySelector('#browser-back').addEventListener('click', () => scramFrame?.back());
  document.querySelector('#browser-forward').addEventListener('click', () => scramFrame?.forward());
}

const shelves = {
  CKV: { json: 'https://cdn.jsdelivr.net/gh/gmshelf/ckv/ckv.json', base: 'https://cdn.jsdelivr.net/gh/gmshelf', label: 'large curated catalog' },
  Seraph: { json: 'https://cdn.jsdelivr.net/gh/gmshelf/seraph/seraph.json', base: 'https://cdn.jsdelivr.net/gh/gmshelf', label: 'arcade and classics' },
  Truffled: { json: 'https://cdn.jsdelivr.net/gh/gmshelf/truffled/truffled.json', base: 'https://cdn.jsdelivr.net/gh/gmshelf', label: 'big mixed collection' },
  UGS: { json: 'https://cdn.jsdelivr.net/gh/gmshelf/ugs/ugs.json', base: 'https://cdn.jsdelivr.net/gh/gmshelf', label: 'quick browser games' }
};

function getGameSource() { return localStorage.getItem('c3-game-source') || 'CKV'; }

async function loadGames(sourceName) {
  const groups = document.querySelector('#game-groups');
  const shelf = shelves[sourceName];
  document.querySelector('#game-source').value = sourceName;
  try {
    const response = await fetch(shelf.json);
    if (!response.ok) throw new Error('Shelf unavailable');
    const payload = await response.json();
    const games = Array.isArray(payload) ? payload : (payload.games ?? []);
    groups.innerHTML = `<section class="game-group"><h2>${sourceName} <span class="kicker">${games.length} games</span></h2><div class="game-list">${games.map((game) => { const gameUrl = resolveGameUrl(game.url, shelf.base); const imageUrl = game.img ? resolveGameUrl(game.img, shelf.base) : ''; return `<article class="game-card">${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="" loading="lazy">` : '<div class="game-art">C3</div>'}<strong>${escapeHtml(game.name || 'Untitled game')}</strong><button data-game-url="${escapeHtml(gameUrl)}" data-game-name="${escapeHtml(game.name || 'Untitled game')}">Play here</button></article>`; }).join('')}</div></section>`;
    groups.querySelectorAll('[data-game-url]').forEach((button) => button.addEventListener('click', () => playGame(button.dataset.gameUrl, button.dataset.gameName)));
    document.querySelector('#game-player-close').addEventListener('click', () => { document.querySelector('#game-player').hidden = true; document.querySelector('#game-frame').src = 'about:blank'; });
  } catch (error) {
    groups.innerHTML = '<p class="notice">This shelf could not load. Check the connection and try again.</p>';
  }
  document.querySelector('#game-source').addEventListener('change', (event) => { localStorage.setItem('c3-game-source', event.target.value); loadGames(event.target.value); });
}

function resolveGameUrl(path, base) { return path?.startsWith('/') ? `${base}${path}` : new URL(path || '', `${base}/`).href; }
async function playGame(url, name) {
  const frame = document.querySelector('#game-frame');
  document.querySelector('#game-player-title').textContent = name;
  document.querySelector('#game-player').hidden = false;
  frame.src = 'about:blank';
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Game returned ${response.status}`);
    const html = await response.text();
    const documentUrl = new URL(url);
    const rewritten = html.replace(/(src|href)=(['"])(?!data:|https?:|\/\/|#)([^'"]+)\2/gi, (match, attribute, quote, path) => `${attribute}=${quote}${new URL(path, documentUrl).href}${quote}`);
    frame.src = URL.createObjectURL(new Blob([rewritten], { type: 'text/html' }));
  } catch (error) {
    frame.srcdoc = `<main style="font:16px monospace;padding:24px">Could not load ${escapeHtml(name)}.<br><small>${escapeHtml(error.message)}</small></main>`;
  }
}

async function setupMusic() {
  const form = document.querySelector('#music-search-form');
  const results = document.querySelector('#music-results');
  const audio = document.querySelector('#audio-player');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = document.querySelector('#music-query').value.trim();
    if (!query) return;
    results.innerHTML = '<p class="notice">Searching...</p>';
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=24`);
      const data = await response.json();
      results.innerHTML = data.results.filter((track) => track.previewUrl).map((track) => `<button class="track" data-preview="${escapeHtml(track.previewUrl)}" data-title="${escapeHtml(track.trackName)}" data-artist="${escapeHtml(track.artistName)}"><img src="${escapeHtml(track.artworkUrl100)}" alt=""><span><strong>${escapeHtml(track.trackName)}</strong><small>${escapeHtml(track.artistName)}</small></span><b>Play</b></button>`).join('') || '<p class="notice">No playable previews found.</p>';
      results.querySelectorAll('.track').forEach((track) => track.addEventListener('click', () => {
        audio.src = track.dataset.preview;
        document.querySelector('#now-playing-title').textContent = track.dataset.title;
        document.querySelector('#now-playing-artist').textContent = track.dataset.artist;
        document.querySelector('#album-art').innerHTML = `<img src="${track.querySelector('img').src}" alt="">`;
        audio.play().catch(() => {});
      }));
    } catch (error) {
      results.innerHTML = '<p class="notice">Music search is unavailable right now.</p>';
    }
  });
  form.requestSubmit();
}

async function setupAnime() {
  const form = document.querySelector('#anime-search-form');
  const results = document.querySelector('#anime-results');
  const queryAnime = async (term) => {
    results.innerHTML = '<p class="notice">Searching AniList...</p>';
    const response = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: `query ($search: String) { Page(perPage: 24) { media(search: $search, type: ANIME, sort: POPULARITY_DESC) { id title { romaji english native } coverImage { large medium } episodes season seasonYear format averageScore description } } }`, variables: { search: term } }) });
    if (!response.ok) throw new Error(`AniList returned ${response.status}`);
    const data = await response.json();
    const anime = data.data?.Page?.media || [];
    results.innerHTML = anime.map((item) => `<button class="anime-card" data-anime='${escapeHtml(JSON.stringify(item))}'><img src="${escapeHtml(item.coverImage.large || item.coverImage.medium)}" alt=""><span><strong>${escapeHtml(item.title.english || item.title.romaji || item.title.native)}</strong><small>${item.seasonYear || 'Anime'} · ${item.episodes || '?'} episodes</small></span></button>`).join('') || '<p class="notice">No anime found.</p>';
    results.querySelectorAll('.anime-card').forEach((card) => card.addEventListener('click', () => selectAnime(JSON.parse(card.dataset.anime))));
  };
  form.addEventListener('submit', (event) => { event.preventDefault(); queryAnime(document.querySelector('#anime-query').value.trim()).catch(() => { results.innerHTML = '<p class="notice">AniList is unavailable right now.</p>'; }); });
  queryAnime(document.querySelector('#anime-query').value).catch(() => { results.innerHTML = '<p class="notice">AniList is unavailable right now.</p>'; });
}

function selectAnime(anime) {
  const title = anime.title.english || anime.title.romaji || anime.title.native || 'Anime';
  document.querySelector('#anime-player-title').textContent = title;
  const count = Math.min(Math.max(anime.episodes || 12, 1), 200);
  const episodes = document.querySelector('#anime-episodes');
  episodes.innerHTML = `<p class="kicker">Episodes</p><div class="episode-grid">${Array.from({ length: count }, (_, index) => `<button class="episode-button" data-episode="${index + 1}">E${index + 1}</button>`).join('')}</div>`;
  episodes.querySelectorAll('.episode-button').forEach((button) => button.addEventListener('click', () => {
    const episode = Number(button.dataset.episode);
    const params = new URLSearchParams({ title, poster: anime.coverImage.large || anime.coverImage.medium, episode: String(episode), episodeName: `E${episode}`, language: 'sub', anilist_id: String(anime.id), season: '1' });
    if (anime.episodes) params.set('episode_count', String(anime.episodes));
    playAnimeStream(params, title, episode);
  }));
}

let animeHls;
async function playAnimeStream(params, title, episode) {
  const video = document.querySelector('#anime-video');
  const status = document.querySelector('#anime-player-status');
  const session = crypto.randomUUID();
  params.set('session', session);
  const streamUrl = `https://lyra.zip/stream/anikoto?${new URLSearchParams({ episode: params.get('episode'), language: 'sub', session, anilist_id: params.get('anilist_id') })}`;
  document.querySelector('#anime-player-title').textContent = `${title} · E${episode}`;
  status.textContent = 'Resolving Lyra stream...';
  video.poster = params.get('poster');
  animeHls?.destroy();
  if (window.Hls?.isSupported()) {
    animeHls = new window.Hls();
    animeHls.loadSource(streamUrl);
    animeHls.attachMedia(video);
    animeHls.on(window.Hls.Events.MANIFEST_PARSED, () => { status.textContent = 'Playing from Lyra'; video.play().catch(() => {}); });
    animeHls.on(window.Hls.Events.ERROR, (_, data) => { if (data.fatal) status.textContent = 'Lyra could not load this episode.'; });
  } else {
    video.src = streamUrl;
    video.addEventListener('loadedmetadata', () => { status.textContent = 'Playing from Lyra'; video.play().catch(() => {}); }, { once: true });
  }
}

function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]); }

function setupSettings() {
  const currentTheme = document.body.dataset.theme || themes[0];
  document.querySelectorAll('.theme-button').forEach((button) => {
    button.classList.toggle('selected', button.dataset.theme === currentTheme);
    button.addEventListener('click', () => {
      setTheme(button.dataset.theme);
      localStorage.setItem('c3-theme', button.dataset.theme);
      document.querySelectorAll('.theme-button').forEach((item) => item.classList.remove('selected'));
      button.classList.add('selected');
      playThemeSound(button.dataset.theme);
    });
  });
  document.querySelectorAll('.source-button').forEach((button) => {
    button.classList.toggle('selected', button.dataset.source === getGameSource());
    button.addEventListener('click', () => { localStorage.setItem('c3-game-source', button.dataset.source); document.querySelectorAll('.source-button').forEach((item) => item.classList.remove('selected')); button.classList.add('selected'); });
  });
}
