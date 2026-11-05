# C3 Scramjet

This folder isolates the browser runtime. The main C3 browser view follows the Scramjet controller/BareMux layout used by the referenced StaticSJv2 and x8rr template.

- Scramjet: https://github.com/MercuryWorkshop/scramjet
- Template reference: https://github.com/Destroyed12121/staticsjv2
- Music reference: https://raw.githubusercontent.com/viroda1/anchor/refs/heads/main/app-spotify.html

`scramjet.js` registers the local service-worker entry and initializes `ScramjetController` against the published bundle and WASM URLs. A compatible Wisp transport and the full interception worker are still required for production proxying. Do not treat the browser iframe as a security boundary.
