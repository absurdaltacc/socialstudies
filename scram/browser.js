import * as BareMux from 'https://cdn.jsdelivr.net/npm/@mercuryworkshop/bare-mux/dist/index.mjs';

const runtimeBase = new URL('.', import.meta.url).pathname;
const runtimeFiles = {
  wasm: 'https://cdn.jsdelivr.net/gh/x8rr/scramjet-templates@main/templates/html/2.0.67-alpha.1/scramjet/scramjet.wasm',
  all: 'https://cdn.jsdelivr.net/gh/Destroyed12121/Staticsj@main/JS/scramjet.all.js',
  sync: 'https://cdn.jsdelivr.net/gh/Destroyed12121/Staticsj@main/JS/scramjet.sync.js'
};

window.C3ScramjetBrowser = (async () => {
  if (!('serviceWorker' in navigator)) throw new Error('Service workers are unavailable.');
  await navigator.serviceWorker.register(`${runtimeBase}sw.js`, { scope: runtimeBase, updateViaCache: 'none' });
  const connection = new BareMux.BareMuxConnection(`${runtimeBase}bareworker.js`);
  await connection.setTransport('epoxy', [{ wisp: 'wss://glseries.net/wisp/' }]);
  const { ScramjetController } = window.$scramjetLoadController();
  const controller = new ScramjetController({ prefix: `${runtimeBase}runtime/`, files: runtimeFiles });
  await controller.init();
  return { controller, connection };
})();