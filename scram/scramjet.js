import * as BareMux from 'https://cdn.jsdelivr.net/npm/@mercuryworkshop/bare-mux@2.1.9/dist/index.mjs';

const status = document.querySelector('#status');
const runtimeBase = new URL('.', import.meta.url).pathname;
const wispUrl = 'wss://glseries.net/wisp/';
const runtimeFiles = {
  wasm: 'https://cdn.jsdelivr.net/gh/x8rr/scramjet-templates@ab246887ba1003add1cd3e178d157b79e0f6a7f4/templates/html/2.0.67-alpha.1/scramjet/scramjet.wasm',
  all: 'https://cdn.jsdelivr.net/gh/Destroyed12121/Staticsj@8e96a110b95d330b3e8c698b29c7292c23dd0b85/JS/scramjet.all.js',
  sync: 'https://cdn.jsdelivr.net/gh/Destroyed12121/Staticsj@8e96a110b95d330b3e8c698b29c7292c23dd0b85/JS/scramjet.sync.js'
};

async function bootScramjet() {
  if (!('serviceWorker' in navigator)) throw new Error('Service workers are unavailable in this browser.');
  await navigator.serviceWorker.register(`${runtimeBase}sw.js`, { scope: runtimeBase, updateViaCache: 'none' });
  await navigator.serviceWorker.ready;
  const connection = new BareMux.BareMuxConnection(`${runtimeBase}bareworker.js`);
  await connection.setTransport('epoxy', [{ wisp: wispUrl }]);
  if (typeof window.$scramjetLoadController !== 'function') throw new Error('Scramjet bundle did not expose its controller loader.');
  const { ScramjetController } = window.$scramjetLoadController();
  const controller = new ScramjetController({ prefix: `${runtimeBase}runtime/`, files: runtimeFiles });
  await controller.init();
  status.className = 'status ok';
  status.textContent = 'Scramjet controller and service worker are ready.';
  window.C3Scramjet = { controller, connection, runtimeFiles, wispUrl };
  return controller;
}

bootScramjet().catch((error) => {
  status.className = 'status warn';
  status.textContent = `Scramjet needs a compatible runtime/Wisp transport: ${error.message}`;
  console.error(error);
});