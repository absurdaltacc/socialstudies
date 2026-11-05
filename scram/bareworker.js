/* BareMux worker entry point reserved for the selected Wisp transport. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));