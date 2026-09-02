# Traffic tracking

Live visitor tracking is wired into the demo so you can see exactly when the
client opens the link — and follow up while it is still on their screen.

## Setup

1. Open the [Supabase SQL editor](https://app.supabase.com/project/_/sql).
2. Run the contents of [`supabase_traffic.sql`](./supabase_traffic.sql).
3. Set these env vars on the deployment:

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

The dashboard is at **`/traffic`** — it is unlinked from the main navigation.

## Behaviour before setup

Everything degrades quietly. With no Supabase env vars, or before the table
exists, `/api/traffic` returns `{ data: [], configured: false }` and the
dashboard renders its empty state. The Postgres `42P01` / "schema cache" error
is caught explicitly — it never surfaces as a crash to a visitor.

## What gets logged

Path, IP address, city / region / country (resolved server-side via
`ip-api.com`), user agent, timestamp. One row per path per session.

## Excluding yourself

So your own testing doesn't pollute the numbers, run this in the browser
console and reload:

```javascript
localStorage.setItem('disable_tracking', 'true')
```

To start tracking yourself again:

```javascript
localStorage.removeItem('disable_tracking')
```

The check runs before any network call, so a disabled browser sends nothing at
all — not a filtered-out row.
