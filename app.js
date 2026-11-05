const footer = document.querySelector('.changing-footer');
const launcher = document.querySelector('.launcher');
const workspace = document.querySelector('.workspace');
const workspaceContent = document.querySelector('#workspace-content');
const messages = ['inspired by x8rs cherri', 'do ur wprk boi', 'this is so tuffy', 'ohio sigma mode acitviated'];
const themes = ['catpuccin', 'minecraft', 'cyberpunk', 'lobotomy', 'alt', 'interstellar', 'matrix'];
const themeSounds = {
  catpuccin: { start: 392, end: 523, wave: 'sine' },
  minecraft: { start: 196, end: 262, wave: 'square' },
  cyberpunk: { start: 110, end: 880, wave: 'sawtooth' },
  lobotomy: { start: 220, end: 220, wave: 'triangle' },
  alt: { start: 146, end: 73, wave: 'sawtooth' },
  interstellar: { start: 174, end: 349, wave: 'sine' },
  matrix: { start: 330, end: 660, wave: 'square' }
};
let audioContext;
let messageIndex = 0;

const savedTheme = localStorage.getItem('c3-theme');
if (themes.includes(savedTheme)) document.body.dataset.theme = savedTheme;

function playThemeSound(theme = document.body.dataset.theme || 'catpuccin') {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  audioContext ??= new AudioContext();
  if (audioContext.state === 'suspended') audioContext.resume();
  const sound = themeSounds[theme] || themeSounds.catpuccin;
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
  if (view === 'settings') setupSettings();
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
  browser: () => `<div class="view-header"><div><p class="kicker">Scramjet browser</p><h1>C3 browse</h1></div><form class="address-row" id="address-form"><button type="button" class="browser-control" id="browser-back" aria-label="Go back">‹</button><button type="button" class="browser-control" id="browser-forward" aria-label="Go forward">›</button><input id="address-input" type="url" placeholder="https://example.com" autocomplete="url" /><button class="action-button">Go</button></form></div><div class="browser-status"><span class="status-dot"></span><span id="browser-status-text">Scramjet browser shell ready</span><a href="https://github.com/MercuryWorkshop/scramjet" target="_blank" rel="noreferrer">Scramjet source</a></div><iframe class="proxy-frame" id="proxy-frame" title="C3 browser" src="https://scramjet.mercurywork.shop"></iframe>`,
  games: () => `<div class="view-header"><div><p class="kicker">gmshelf catalog</p><h1>Game shelf</h1></div><label class="source-select">Source <select id="game-source">${Object.keys(shelves).map((name) => `<option value="${name}">${name}</option>`).join('')}</select></label></div><div class="game-groups" id="game-groups"><p class="notice">Loading game shelf...</p></div><div class="game-player" id="game-player" hidden><div class="player-bar"><strong id="game-player-title">Loading game</strong><button id="game-player-close" class="player-close" aria-label="Close game">×</button></div><iframe id="game-frame" title="Game player"></iframe></div>`,
  music: () => `<div class="view-header"><div><p class="kicker">Anchor player</p><h1>Music</h1></div><a class="action-button" href="https://viroda1.github.io/anchor/app-spotify.html" target="_blank" rel="noreferrer">Open separately</a></div><iframe class="music-frame" title="C3 music player" src="https://viroda1.github.io/anchor/app-spotify.html"></iframe>`,
  settings: () => `<div class="view-header"><div><p class="kicker">Personalize C3</p><h1>Settings</h1></div></div><p class="notice">Choose a visual theme and the game shelf used by the Games tab. Changes are saved in this browser.</p><h2 class="settings-heading">Themes</h2><div class="theme-grid">${themes.map((theme) => `<button class="theme-button" data-theme="${theme}"><span></span><strong>${theme}</strong></button>`).join('')}</div><h2 class="settings-heading">Game source</h2><div class="source-grid">${Object.keys(shelves).map((name) => `<button class="source-button" data-source="${name}"><strong>${name}</strong><small>${shelves[name].label}</small></button>`).join('')}</div>`
};

function setupBrowser() {
  document.querySelector('#address-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.querySelector('#address-input');
    let url = input.value.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    document.querySelector('#proxy-frame').src = `https://scramjet.mercurywork.shop/?url=${encodeURIComponent(url)}`;
    document.querySelector('#browser-status-text').textContent = `Loading ${url}`;
  });
  document.querySelector('#browser-back').addEventListener('click', () => document.querySelector('#proxy-frame').contentWindow?.history.back());
  document.querySelector('#browser-forward').addEventListener('click', () => document.querySelector('#proxy-frame').contentWindow?.history.forward());
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
function playGame(url, name) { document.querySelector('#game-player-title').textContent = name; document.querySelector('#game-frame').src = url; document.querySelector('#game-player').hidden = false; }

function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]); }

function setupSettings() {
  const currentTheme = document.body.dataset.theme || themes[0];
  document.querySelectorAll('.theme-button').forEach((button) => {
    button.classList.toggle('selected', button.dataset.theme === currentTheme);
    button.addEventListener('click', () => {
      document.body.dataset.theme = button.dataset.theme;
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
