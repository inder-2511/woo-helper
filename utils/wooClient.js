const axios = require("axios");
const config = require("./config");

/**
 * Normalise whatever the user typed into a store base URL.
 *   "mystore.com"          -> "https://mystore.com"
 *   "https://mystore.com/" -> "https://mystore.com"
 */
function normalizeBaseUrl(raw) {
  if (!raw) return "";
  let v = String(raw).trim();
  if (!v) return "";
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  return v.replace(/\/+$/, "");
}

/**
 * Axios instance pointed at a store's WooCommerce v3 REST API.
 * Every service takes one of these so the same code serves the CLI
 * (env credentials) and the API (per-request credentials).
 */
function createWooClient({ baseUrl, key, secret }) {
  const normalized = normalizeBaseUrl(baseUrl);

  if (!normalized || !key || !secret) {
    const err = new Error(
      "Missing store credentials. Provide a store URL, consumer key and consumer secret.",
    );
    err.status = 400;
    throw err;
  }

  const client = axios.create({
    baseURL: `${normalized}/wp-json/wc/v3`,
    auth: { username: key, password: secret },
    timeout: Number(process.env.WOO_TIMEOUT_MS) || 60000,
  });

  attachRetry(client);
  return client;
}

const TRANSIENT_CODES = new Set([
  "ECONNRESET",
  "ECONNABORTED",
  "ETIMEDOUT",
  "EPIPE",
  "EAI_AGAIN",
]);
const TRANSIENT_STATUSES = new Set([502, 503, 504]);

/**
 * Shared WooCommerce hosting drops connections under load ("socket hang up").
 * Retry those, but only for GET — replaying a POST would create duplicate
 * products or orders, which is worse than surfacing the error.
 */
function attachRetry(client, { retries = 2, baseDelayMs = 400 } = {}) {
  client.interceptors.response.use(undefined, async (err) => {
    const cfg = err.config;
    if (!cfg || String(cfg.method).toLowerCase() !== "get") throw err;

    const transient =
      TRANSIENT_CODES.has(err.code) ||
      /socket hang up|ECONNRESET/i.test(err.message || "") ||
      TRANSIENT_STATUSES.has(err.response?.status);

    if (!transient) throw err;

    cfg.__retryCount = (cfg.__retryCount || 0) + 1;
    if (cfg.__retryCount > retries) throw err;

    const delay = baseDelayMs * 2 ** (cfg.__retryCount - 1);
    console.log(
      ` > > > Transient error (${err.code || err.response?.status}) on GET ${cfg.url} — retry ${cfg.__retryCount}/${retries} in ${delay}ms`,
    );
    await new Promise((r) => setTimeout(r, delay));
    return client.request(cfg);
  });
}

/** Client built from the server's own .env — used by the CLI. */
function envClient() {
  return createWooClient({
    baseUrl: config.baseUrl,
    key: config.key,
    secret: config.secret,
  });
}

function hasEnvCredentials() {
  return Boolean(config.baseUrl && config.key && config.secret);
}

module.exports = {
  createWooClient,
  envClient,
  hasEnvCredentials,
  normalizeBaseUrl,
};
