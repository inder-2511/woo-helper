# Deployment

Frontend → **Vercel**, backend → **Render**. Both deploy from
`inder-2511/woo-helper` on the `main` branch.

> **Read the security note at the bottom before making the Render service
> public.** The hosted API holds one store's WooCommerce keys and has no
> authentication, so anyone who knows the URL can write to that store.

## Backend (Render)

1. New → **Web Service** → connect this repo.
2. Root directory: leave blank (repo root).
3. Build command: `npm install`
4. Start command: `node server/index.js`
5. Environment variables:

   | Key | Value |
   | --- | --- |
   | `BASE_URL` | `https://your-woocommerce-store.com` |
   | `CONSUMER_KEY` | `ck_...` |
   | `CONSUMER_SECRET` | `cs_...` |
   | `version` | `1.0.21` |
   | `FRONTEND_ORIGIN` | `https://<your-vercel-app>.vercel.app` (add after the Vercel deploy) |

   Do **not** set `PORT` — Render injects it and the server reads
   `process.env.PORT`.

6. Deploy. Note the URL, e.g. `https://woo-helper-api.onrender.com`.
7. Check `https://<service>.onrender.com/health` — it returns
   `{ "ok": true, "storeConfigured": true }` once the keys are set.

## Frontend (Vercel)

1. New Project → import this repo.
2. Root directory: `woo-ui`
3. Framework preset: **Vite** (auto-detected).
4. Environment variables:

   | Key | Value |
   | --- | --- |
   | `VITE_API_URL` | `https://<your-render-service>.onrender.com` |

5. Deploy. Then go back to Render, set `FRONTEND_ORIGIN` to the Vercel URL,
   and redeploy the backend so CORS allows it.

## Local dev

No env vars required on the frontend — it defaults to
`http://localhost:5000`. The backend needs a `.env` in the repo root; copy
`.env.example` and fill in the store keys.

```bash
npm install
npm run server          # API on http://localhost:5000
```

```bash
cd woo-ui && npm install && npm run dev   # dashboard on http://localhost:5173
```

The CLI is separate and needs no server:

```bash
npm start
```

## Free-tier note

Render's free web services sleep after ~15 minutes idle. The first request
after a sleep takes 30–60s to wake the service, so the dashboard can look
like it is hanging on the first action.

## Security note

The backend reads a single store's WooCommerce keys from its own
environment and exposes unauthenticated write endpoints
(`create-simple-product`, `create-order`, `duplicate-product`, ...). Hosted
publicly, that lets anyone who finds the Render URL create products and
orders in that store.

Before relying on this in public, do one of:

- Point `BASE_URL` at a throwaway staging store only, or
- Move store credentials out of the server and into the request, entered
  per-store in the UI (the approach `shopifyHelper` uses), or
- Put an auth check in front of the write routes.
