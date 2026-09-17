const {
  createWooClient,
  hasEnvCredentials,
  normalizeBaseUrl,
} = require("../../utils/wooClient");
const config = require("../../utils/config");

/**
 * Attaches `req.woo` (an axios client) and `req.storeUrl`.
 *
 * Credentials are read from request headers first so the dashboard can
 * target any store without the server holding keys:
 *
 *   x-woo-url      https://store.com
 *   x-woo-key      ck_...
 *   x-woo-secret   cs_...
 *
 * When the headers are absent it falls back to the server's own .env,
 * which is what the CLI and a single-store local setup rely on. Set
 * REQUIRE_STORE_CREDENTIALS=true (recommended on a public deploy) to turn
 * that fallback off so the hosted API can't write to the owner's store.
 */
function resolveStore(req, res, next) {
  const headerUrl = req.get("x-woo-url");
  const headerKey = req.get("x-woo-key");
  const headerSecret = req.get("x-woo-secret");

  const usingHeaders = Boolean(headerUrl && headerKey && headerSecret);
  const requireHeaders = process.env.REQUIRE_STORE_CREDENTIALS === "true";

  if (!usingHeaders && requireHeaders) {
    return res.status(401).json({
      success: false,
      message:
        "This server requires store credentials with every request. Add your store URL and API keys in Settings.",
    });
  }

  if (!usingHeaders && !hasEnvCredentials()) {
    return res.status(400).json({
      success: false,
      message:
        "No store configured. Add your store URL and API keys in Settings, or set BASE_URL / CONSUMER_KEY / CONSUMER_SECRET on the server.",
    });
  }

  try {
    req.woo = createWooClient(
      usingHeaders
        ? { baseUrl: headerUrl, key: headerKey, secret: headerSecret }
        : { baseUrl: config.baseUrl, key: config.key, secret: config.secret },
    );
    req.storeUrl = normalizeBaseUrl(usingHeaders ? headerUrl : config.baseUrl);
    req.usingRequestCredentials = usingHeaders;
    next();
  } catch (err) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
}

module.exports = { resolveStore };
