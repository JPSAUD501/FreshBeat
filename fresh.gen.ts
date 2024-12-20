// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from './routes/_404.tsx'
import * as $_app from './routes/_app.tsx'
import * as $api_go from './routes/api/go.tsx'
import * as $api_lastfm_callback from './routes/api/lastfm/callback.tsx'
import * as $api_telegram_webhook from './routes/api/telegram/webhook.ts'
import * as $index from './routes/index.tsx'
import * as $MiniappCallback from './islands/MiniappCallback.tsx'
import * as $Redirect from './islands/Redirect.tsx'
import type { Manifest } from '$fresh/server.ts'

const manifest = {
  routes: {
    './routes/_404.tsx': $_404,
    './routes/_app.tsx': $_app,
    './routes/api/go.tsx': $api_go,
    './routes/api/lastfm/callback.tsx': $api_lastfm_callback,
    './routes/api/telegram/webhook.ts': $api_telegram_webhook,
    './routes/index.tsx': $index,
  },
  islands: {
    './islands/MiniappCallback.tsx': $MiniappCallback,
    './islands/Redirect.tsx': $Redirect,
  },
  baseUrl: import.meta.url,
} satisfies Manifest

export default manifest
