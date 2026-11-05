/*
 * Same-origin registration point for C3's Scramjet runtime.
 * The full interception worker is supplied by the pinned Scramjet template
 * runtime; keeping this entry local gives the browser a stable registration
 * path and prevents cross-origin service-worker registration failures.
 */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));