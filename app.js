const footer = document.querySelector('.changing-footer');
const launcher = document.querySelector('.launcher');
const workspace = document.querySelector('.workspace');
const workspaceContent = document.querySelector('#workspace-content');
const messages = ['inspired by x8rs cherri', 'do ur work boi', 'this is so tuffy', 'ohio sigma mode acitviated', 'brooklyn do your work now.', '#aizhirisabum', '#howualive??', 'c3 is a work in progress', 's', 'website looking so tuff', 'thanks to lyra.zip for the anime streaming', 'thanks to Lyra for the games', 'im goated, really goated', 'gg friggn ezy', 'vibe coders will all dissapear', 'lamo lmao lmao'];
const themes = ['default', 'nature', 'cozy', 'cyberpunk', 'lobotomy', 'alt', 'interstellar', 'matrix', 'hunt'];
const DEFAULT_THEME = 'default';
const themeBackgrounds = {
  default: '',
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
  default: { start: 261, end: 261, wave: 'sine' },
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
let gamesRequestController;
let animeSearchController;
let activeGameDocumentUrl;
let animeHls;
const themeBackground = document.querySelector('#theme-background');
const themeLogo = document.querySelector('#theme-logo');

const savedTheme = localStorage.getItem('c3-theme');
const initialTheme = themes.includes(savedTheme) ? savedTheme : DEFAULT_THEME;
setTheme(initialTheme);

function setTheme(theme) {
  document.body.dataset.theme = theme;
  setThemeBackground(theme);
  setThemeLogo(theme);
}

function setThemeBackground(theme) {
  const filename = themeBackgrounds[theme];
  if (!filename) {
    themeBackground.classList.remove('active');
    themeBackground.removeAttribute('src');
    themeBackground.load();
    return;
  }
  themeBackground.classList.toggle('active', true);
  themeBackground.src = `assets/videos/${filename}`;
  themeBackground.load();
  themeBackground.play().catch(() => {});
}

function setThemeLogo(theme) {
  if (theme === DEFAULT_THEME) {
    themeLogo.src = 'assets/toolbar-icons/logo.png';
    return;
  }
  themeLogo.src = `assets/theme-logos/${theme}.png`;
  themeLogo.onerror = () => {
    themeLogo.onerror = null;
    themeLogo.src = 'assets/toolbar-icons/logo.png';
  };
}

function formatThemeName(theme) {
  return theme.charAt(0).toUpperCase() + theme.slice(1);
}

function playThemeSound(theme = document.body.dataset.theme || DEFAULT_THEME) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  audioContext ??= new AudioContext();
  if (audioContext.state === 'suspended') audioContext.resume();
  const sound = themeSounds[theme] || themeSounds[DEFAULT_THEME];
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
  cleanupWorkspace();
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
  cleanupWorkspace();
  workspace.classList.remove('open');
  launcher.classList.remove('blurred');
  workspaceContent.replaceChildren();
}

function cleanupWorkspace() {
  gamesRequestController?.abort();
  gamesRequestController = null;
  animeSearchController?.abort();
  animeSearchController = null;
  animeHls?.destroy();
  animeHls = null;
  const video = document.querySelector('#anime-video');
  if (video) {
    video.pause();
    video.removeAttribute('src');
    video.load();
  }
  const audio = document.querySelector('#audio-player');
  if (audio) {
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
  }
  if (activeGameDocumentUrl) {
    URL.revokeObjectURL(activeGameDocumentUrl);
    activeGameDocumentUrl = null;
  }
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
  browser: () => `<div class="browser-shell"><header class="browser-toolbar"><div class="browser-nav"><button type="button" class="browser-control" id="browser-back" aria-label="Go back">‹</button><button type="button" class="browser-control" id="browser-forward" aria-label="Go forward">›</button><button type="button" class="browser-control" id="browser-home" aria-label="Open Brave start page">⌂</button></div><form class="address-row" id="address-form"><input id="address-input" type="text" placeholder="Search or enter a web address" autocomplete="off" /><button class="action-button">Go</button></form><span class="browser-brand">brave</span></header><div class="browser-status"><span class="status-dot"></span><span id="browser-status-text">Brave start page</span><a href="https://github.com/absurdaltacc/absent" target="_blank" rel="noreferrer">Runtime source</a></div><div class="proxy-frame" id="proxy-frame" title="C3 browser"><section class="brave-start" id="brave-start"><div class="brave-mark">B</div><h1>Brave</h1><p>Private, fast, and built for the open web.</p><form class="brave-search" id="brave-search"><input type="search" placeholder="Search the web" aria-label="Search the web" /><button aria-label="Search">⌕</button></form><div class="brave-links"><button data-url="https://brave.com">Brave</button><button data-url="https://search.brave.com">Brave Search</button><button data-url="https://github.com">GitHub</button></div></section></div></div>`,
  games: () => `<div class="view-header"><div><p class="kicker">Lyra game catalog</p><h1>Game shelf</h1></div><label class="source-select">Source <select id="game-source">${Object.keys(shelves).map((name) => `<option value="${name}">${name}</option>`).join('')}</select></label></div><div class="game-groups" id="game-groups"><p class="notice">Loading game shelf...</p></div><div class="game-player" id="game-player" hidden><div class="player-bar"><strong id="game-player-title">Loading game</strong><button id="game-player-close" class="player-close" aria-label="Close game">×</button></div><iframe id="game-frame" title="Game player"></iframe></div>`,
  anime: () => `<div class="view-header"><div><p class="kicker">AniList catalog · Lyra streams</p><h1>Anime</h1></div><form class="address-row" id="anime-search-form"><input id="anime-query" placeholder="Search anime" value="One Piece" /><button class="action-button">Search</button></form></div><div class="anime-layout"><section><div id="anime-results" class="anime-results"><p class="notice">Loading AniList...</p></div></section><section class="anime-player"><div class="player-bar"><strong id="anime-player-title">Choose a show</strong><span class="kicker">Lyra HLS</span></div><div class="media-stage"><video id="anime-video" class="anime-video" controls playsinline></video><div class="media-loading" id="anime-loading" hidden>Resolving stream...</div></div><div id="anime-episodes" class="anime-episodes"><p class="notice">Select a show to see episodes.</p></div><div class="media-actions"><a id="anime-download" class="media-action" target="_blank" rel="noreferrer" hidden>Download</a><p id="anime-player-status" class="player-status">Lyra direct stream is ready when you choose an episode.</p></div></section></div>`,
  music: () => `<div class="view-header"><div><p class="kicker">C3 music</p><h1>Listen</h1></div><a class="action-button" href="https://github.com/cherriunblocked/svg/tree/main/b" target="_blank" rel="noreferrer">Source reference</a></div><div class="music-layout"><section class="music-player"><div class="album-art" id="album-art">C3</div><div class="now-playing"><p class="kicker">Now playing</p><h2 id="now-playing-title">Choose a track</h2><p id="now-playing-artist">Search for an artist or song</p></div><audio id="audio-player" controls></audio><div class="media-actions"><a id="music-download" class="media-action" download hidden>Download preview</a></div></section><section class="music-search"><form class="search-row" id="music-search-form"><input id="music-query" placeholder="Search songs or artists" value="lofi" /><button class="action-button">Search</button></form><div id="music-results" class="music-results"><p class="notice">Search to load playable previews.</p></div></section></div>`,
  settings: () => `<div class="view-header"><div><p class="kicker">Personalize C3</p><h1>Settings</h1></div></div><p class="notice">Choose a visual theme and the game shelf used by the Games tab. Changes are saved in this browser.</p><h2 class="settings-heading">Themes</h2><div class="theme-grid">${themes.map((theme) => `<button class="theme-button" data-theme="${theme}"><span></span><strong>${formatThemeName(theme)}</strong></button>`).join('')}</div><h2 class="settings-heading">Game source</h2><div class="source-grid">${Object.keys(shelves).map((name) => `<button class="source-button" data-source="${name}"><strong>${name}</strong><small>${shelves[name].label}</small></button>`).join('')}</div>`
};

function setupBrowser() {
  const stage = document.querySelector('#proxy-frame');
  let scramFrame;
  let runtimePromise;
  let pendingUrl;
  const status = document.querySelector('#browser-status-text');
  const startPage = document.querySelector('#brave-start');
  const loadRuntime = () => {
    if (runtimePromise) return runtimePromise;
    status.textContent = 'Starting private browser runtime...';
    const createBrowser = window.C3ScramjetBrowser;
    if (typeof createBrowser !== 'function') {
      const error = new Error('Browser runtime is unavailable.');
      status.textContent = error.message;
      return Promise.reject(error);
    }
    runtimePromise = createBrowser().then(({ controller }) => {
      scramFrame = controller.createFrame();
      scramFrame.frame.className = 'scramjet-frame';
      stage.replaceChildren(scramFrame.frame);
      status.textContent = 'Brave runtime ready';
      return scramFrame;
    }).catch((error) => {
      runtimePromise = null;
      status.textContent = `Browser failed: ${error.message}`;
      throw error;
    });
    return runtimePromise;
  };
  const navigate = (rawValue) => {
    const value = rawValue.trim();
    const url = value
      ? (/^https?:\/\//i.test(value) ? value : (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(value) ? `https://${value}` : `https://search.brave.com/search?q=${encodeURIComponent(value)}`))
      : 'https://brave.com/';
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('Only HTTP and HTTPS URLs are supported.');
      pendingUrl = parsedUrl.href;
      startPage.hidden = true;
      status.textContent = `Loading ${pendingUrl}`;
      loadRuntime().then((frame) => frame.go(pendingUrl)).catch(() => {});
    } catch (error) {
      status.textContent = error.message;
    }
  };
  document.querySelector('#address-form').addEventListener('submit', (event) => {
    event.preventDefault();
    navigate(document.querySelector('#address-input').value);
  });
  document.querySelector('#browser-back').addEventListener('click', () => scramFrame?.back());
  document.querySelector('#browser-forward').addEventListener('click', () => scramFrame?.forward());
  document.querySelector('#browser-home').addEventListener('click', () => {
    pendingUrl = null;
    startPage.hidden = false;
    status.textContent = 'Brave start page';
    if (scramFrame) stage.replaceChildren(startPage);
  });
  document.querySelector('#brave-search').addEventListener('submit', (event) => {
    event.preventDefault();
    navigate(event.currentTarget.querySelector('input').value);
  });
  document.querySelectorAll('.brave-links [data-url]').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.url)));
}

const shelves = {
  Selenite: { json: 'https://selenite.cc/resources/games.json', base: 'https://selenite.cc', label: 'curated games and Lyra assets', parse: parseSeleniteGames },
  'GN Math': { json: 'https://cdn.jsdelivr.net/gh/freebuisness/assets@latest/zones.json', base: 'https://gn-math.dev', label: 'games and tools catalog', parse: parseGnMathGames },
  'Wasm.rip': { json: 'https://wasm.rip/games.json', base: 'https://wasm.rip', label: 'web assembly games', parse: parseWasmGames }
};

function getGameSource() {
  const savedSource = localStorage.getItem('c3-game-source');
  return savedSource && shelves[savedSource] ? savedSource : 'Selenite';
}

async function loadGames(sourceName) {
  const groups = document.querySelector('#game-groups');
  const selectedSource = shelves[sourceName] ? sourceName : 'Selenite';
  const shelf = shelves[selectedSource];
  gamesRequestController?.abort();
  gamesRequestController = new AbortController();
  document.querySelector('#game-source').value = selectedSource;
  try {
    const response = await fetch(shelf.json, { signal: gamesRequestController.signal });
    if (!response.ok) throw new Error('Shelf unavailable');
    const payload = await response.json();
    const games = shelf.parse(payload);
    groups.innerHTML = `<section class="game-group"><h2>${escapeHtml(selectedSource)} <span class="kicker">${games.length} games</span></h2><div class="game-list">${games.map((game) => { let gameUrl; let imageUrl = ''; try { gameUrl = resolveGameUrl(game.url, shelf.base); imageUrl = game.img ? resolveGameUrl(game.img, shelf.base) : ''; } catch { return ''; } return `<article class="game-card">${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="" loading="lazy">` : '<div class="game-art">C3</div>'}<strong>${escapeHtml(game.name || 'Untitled game')}</strong><button data-game-url="${escapeHtml(gameUrl)}" data-game-name="${escapeHtml(game.name || 'Untitled game')}">Play here</button></article>`; }).join('')}</div></section>`;
    groups.querySelectorAll('[data-game-url]').forEach((button) => button.addEventListener('click', () => playGame(button.dataset.gameUrl, button.dataset.gameName)));
    document.querySelector('#game-player-close').addEventListener('click', () => { document.querySelector('#game-player').hidden = true; document.querySelector('#game-frame').src = 'about:blank'; if (activeGameDocumentUrl) { URL.revokeObjectURL(activeGameDocumentUrl); activeGameDocumentUrl = null; } });
  } catch (error) {
    if (error.name === 'AbortError') return;
    groups.innerHTML = '<p class="notice">This shelf could not load. Check the connection and try again.</p>';
  }
  const sourceSelect = document.querySelector('#game-source');
  sourceSelect.onchange = (event) => { localStorage.setItem('c3-game-source', event.target.value); loadGames(event.target.value); };
}

function parseSeleniteGames(payload) {
  if (!Array.isArray(payload)) return [];
  return payload.map((game) => {
    const directory = String(game.directory || '').trim();
    const image = game.cover || game.image;
    return {
      name: game.name,
      url: directory ? `https://selenite.cc/resources/semag/${encodeURIComponent(directory)}` : '',
      img: image && directory ? new URL(image, `https://selenite.cc/resources/semag/${encodeURIComponent(directory)}/`).href : ''
    };
  }).filter((game) => game.name && game.url);
}

function parseGnMathGames(payload) {
  if (!Array.isArray(payload)) return [];
  return payload.map((game) => {
    const id = String(game.id || '').trim();
    const gameUrl = game.url && !String(game.url).includes('{HTML_URL}')
      ? new URL(game.url, 'https://gn-math.dev').href
      : id ? `https://gn-math.dev/?id=${encodeURIComponent(id)}` : '';
    const cover = String(game.cover || '').replace('{COVER_URL}', 'https://cdn.jsdelivr.net/gh/freebuisness/covers@main').replace('{HTML_URL}', 'https://gn-math.dev');
    return { name: game.name, url: gameUrl, img: cover ? new URL(cover, 'https://gn-math.dev').href : '' };
  }).filter((game) => game.name && game.url && !String(game.name).includes('[!]'));
}

function parseWasmGames(payload) {
  if (!Array.isArray(payload)) return [];
  return payload.map((game) => ({ name: game.name, url: game.gameUrl, img: game.imageUrl })).filter((game) => game.name && game.url);
}

function resolveGameUrl(path, base) {
  const url = new URL(path || '', `${base}/`);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported game resource URL');
  return url.href;
}
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
    if (activeGameDocumentUrl) URL.revokeObjectURL(activeGameDocumentUrl);
    activeGameDocumentUrl = URL.createObjectURL(new Blob([rewritten], { type: 'text/html' }));
    frame.setAttribute('sandbox', 'allow-forms allow-pointer-lock allow-scripts');
    frame.src = activeGameDocumentUrl;
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
      if (!response.ok) throw new Error(`Music search returned ${response.status}`);
      const data = await response.json();
      const tracks = Array.isArray(data.results) ? data.results.filter((track) => track.previewUrl) : [];
      results.innerHTML = tracks.map((track) => `<button class="track" data-preview="${escapeHtml(track.previewUrl)}" data-title="${escapeHtml(track.trackName)}" data-artist="${escapeHtml(track.artistName)}"><img src="${escapeHtml(track.artworkUrl100 || '')}" alt="" loading="lazy"><span><strong>${escapeHtml(track.trackName)}</strong><small>${escapeHtml(track.artistName)}</small></span><b>Play</b></button>`).join('') || '<p class="notice">No playable previews found.</p>';
      results.querySelectorAll('.track').forEach((track) => track.addEventListener('click', () => {
        audio.src = track.dataset.preview;
        const download = document.querySelector('#music-download');
        download.href = track.dataset.preview;
        download.download = `${track.dataset.title} - ${track.dataset.artist}.mp3`;
        download.hidden = false;
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
    const search = term.trim();
    if (!search) {
      results.innerHTML = '<p class="notice">Enter a title to search.</p>';
      return;
    }
    animeSearchController?.abort();
    animeSearchController = new AbortController();
    results.innerHTML = '<p class="notice">Searching AniList...</p>';
    const response = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: `query ($search: String) { Page(perPage: 24) { media(search: $search, type: ANIME, sort: POPULARITY_DESC) { id title { romaji english native } coverImage { large medium } episodes season seasonYear format averageScore description } } }`, variables: { search } }), signal: animeSearchController.signal });
    if (!response.ok) throw new Error(`AniList returned ${response.status}`);
    const data = await response.json();
    if (Array.isArray(data.errors) && data.errors.length) throw new Error(data.errors[0].message);
    const anime = data.data?.Page?.media || [];
    results.innerHTML = anime.map((item) => `<button class="anime-card" data-anime='${escapeHtml(JSON.stringify(item))}'><img src="${escapeHtml(item.coverImage?.large || item.coverImage?.medium || 'assets/toolbar-icons/anime.png')}" alt="" loading="lazy"><span><strong>${escapeHtml(item.title.english || item.title.romaji || item.title.native || 'Untitled')}</strong><small>${item.seasonYear || 'Anime'} · ${item.episodes || '?'} episodes</small></span></button>`).join('') || '<p class="notice">No anime found.</p>';
    results.querySelectorAll('.anime-card').forEach((card) => card.addEventListener('click', () => selectAnime(JSON.parse(card.dataset.anime))));
  };
  form.addEventListener('submit', (event) => { event.preventDefault(); queryAnime(document.querySelector('#anime-query').value.trim()).catch((error) => { if (error.name !== 'AbortError') results.innerHTML = '<p class="notice">AniList is unavailable right now.</p>'; }); });
  queryAnime(document.querySelector('#anime-query').value).catch((error) => { if (error.name !== 'AbortError') results.innerHTML = '<p class="notice">AniList is unavailable right now.</p>'; });
}

function selectAnime(anime) {
  const title = anime.title.english || anime.title.romaji || anime.title.native || 'Anime';
  document.querySelector('#anime-player-title').textContent = title;
  const count = Math.min(Math.max(anime.episodes || 1, 1), 200);
  const episodes = document.querySelector('#anime-episodes');
  episodes.innerHTML = `<p class="kicker">Episodes</p><div class="episode-grid">${Array.from({ length: count }, (_, index) => `<button class="episode-button" data-episode="${index + 1}">E${index + 1}</button>`).join('')}</div>`;
  episodes.querySelectorAll('.episode-button').forEach((button) => button.addEventListener('click', () => {
    const episode = Number(button.dataset.episode);
    const params = new URLSearchParams({ title, poster: anime.coverImage?.large || anime.coverImage?.medium || '', episode: String(episode), episodeName: `E${episode}`, language: 'sub', anilist_id: String(anime.id), season: '1' });
    if (anime.episodes) params.set('episode_count', String(anime.episodes));
    playAnimeStream(params, title, episode);
  }));
}

async function playAnimeStream(params, title, episode) {
  const video = document.querySelector('#anime-video');
  const status = document.querySelector('#anime-player-status');
  const loading = document.querySelector('#anime-loading');
  const download = document.querySelector('#anime-download');
  const session = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  params.set('session', session);
  const streamUrl = `https://lyra.zip/stream/anikoto?${new URLSearchParams({ episode: params.get('episode'), language: 'sub', session, anilist_id: params.get('anilist_id') })}`;
  document.querySelector('#anime-player-title').textContent = `${title} · E${episode}`;
  status.textContent = 'Resolving Lyra stream...';
  loading.hidden = false;
  download.hidden = false;
  download.href = streamUrl;
  download.setAttribute('download', `${title} - E${episode}.m3u8`);
  video.pause();
  video.removeAttribute('src');
  video.load();
  video.poster = params.get('poster') || '';
  animeHls?.destroy();
  if (window.Hls?.isSupported()) {
    animeHls = new window.Hls();
    animeHls.loadSource(streamUrl);
    animeHls.attachMedia(video);
    animeHls.on(window.Hls.Events.MANIFEST_PARSED, () => { loading.hidden = true; status.textContent = 'Playing from Lyra'; video.play().catch(() => {}); });
    animeHls.on(window.Hls.Events.ERROR, (_, data) => { if (data.fatal) { loading.hidden = true; status.textContent = 'Lyra could not load this episode.'; } });
  } else {
    video.src = streamUrl;
    video.addEventListener('loadedmetadata', () => { loading.hidden = true; status.textContent = 'Playing from Lyra'; video.play().catch(() => {}); }, { once: true });
    video.addEventListener('error', () => { loading.hidden = true; status.textContent = 'Lyra could not load this episode.'; }, { once: true });
  }
}

function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]); }

function setupSettings() {
  const currentTheme = document.body.dataset.theme || DEFAULT_THEME;
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
