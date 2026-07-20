# CES Manager Agent Notes

## Tooling
- Match CI's Node.js `14.15.4`; install dependencies with `npm ci`.
- Run the Electron app from the repository root with `npm start`.
- Rebuild the native SQLite module after dependency or Electron changes with `npm run rebuild`.
- Lint changed JavaScript with `npm run lint -- path/to/file.js`; CI only lints changed `*.js` files using Airbnb Base ESLint rules.
- `npm test` runs Jest, but no test files currently exist.

## Architecture and Data
- `main.js` loads `src/index.html` and registers all main-process IPC handlers through `src/handlers/ipcEventHandler.js`.
- Renderer scripts in `src/renderers/` communicate with `src/handlers/ipcHandlers/`; handlers delegate to `src/services/`, which use Knex and `src/models/`. Keep IPC request and response channel names aligned across both sides.
- HTML partials in `src/views/` are loaded dynamically and include their matching renderer scripts; update the view and renderer together.
- `src/services/config.json` is the source of truth for table/column constants, SQLite lookup paths, and dynamically required model/service paths.
- `db/ces.db` is a tracked runtime database despite being ignored for new files. Do not replace or remove it unintentionally; `DbContext` looks for it first, then `resources/app/db/ces.db` in packaged builds.
