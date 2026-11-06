# C3 Scramjet

This folder isolates the browser runtime. The main C3 browser view follows the lightweight browser shell and Scramjet/BareMux layout used by the previous Absent and Canc3r projects.

- Scramjet: https://github.com/MercuryWorkshop/scramjet
- Previous browser shell: https://github.com/absurdaltacc/absent
- Previous C3 browser design: https://github.com/UnblockableMan/canc3r
- Music reference: https://raw.githubusercontent.com/viroda1/anchor/refs/heads/main/app-spotify.html

`scramjet.js` registers the local service-worker entry and initializes `ScramjetController` against the published bundle and WASM URLs. A compatible Wisp transport and the full interception worker are still required for production proxying. Do not treat the browser iframe as a security boundary.
