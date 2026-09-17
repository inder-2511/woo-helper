/**
 * Turn an axios error from a WooCommerce call into something a user can act on.
 * Returns { kind, retriable, status, title, message, action }.
 */
export function classifyError(err) {
  if (!err.response) {
    if (err.message?.includes("Network Error")) {
      return {
        kind: "network",
        retriable: true,
        status: null,
        title: "Can't reach the backend",
        message: err.message,
        action:
          "The backend may be waking up (Render's free tier sleeps after 15 min idle) — retry in ~30s. If it persists, check the API URL in Settings, and that FRONTEND_ORIGIN on the backend allows this site.",
      };
    }
    if (err.code === "ECONNABORTED") {
      return {
        kind: "timeout",
        retriable: true,
        status: null,
        title: "Request timed out",
        message: err.message,
        action:
          "Bulk actions against a slow store can exceed the timeout. Try a smaller count.",
      };
    }
    return {
      kind: "network",
      retriable: true,
      status: null,
      title: "Network error",
      message: err.message ?? "No response from server",
      action: "Check your connection, then retry.",
    };
  }

  const status = err.response.status;
  const body = err.response.data;
  const detail =
    body?.message ??
    (typeof body === "string" ? body : JSON.stringify(body ?? {}));

  if (status === 400) {
    return {
      kind: "validation",
      retriable: false,
      status,
      title: "Request rejected",
      message: detail,
      action:
        "Check the values you entered — WooCommerce refused the payload. Retrying unchanged won't help.",
    };
  }

  if (status === 401) {
    return {
      kind: "auth",
      retriable: false,
      status,
      title: "Store credentials rejected",
      message: detail,
      action:
        "The consumer key/secret are wrong, or the store URL isn't the one they belong to. Fix them in Settings. Note WooCommerce also rejects keys when the site forces HTTP Basic auth or strips the Authorization header.",
    };
  }

  if (status === 403) {
    return {
      kind: "forbidden",
      retriable: false,
      status,
      title: "Not permitted",
      message: detail,
      action:
        "The API key is probably Read-only. Regenerate it with Read/Write permission in WooCommerce → Settings → Advanced → REST API.",
    };
  }

  if (status === 404) {
    return {
      kind: "not_found",
      retriable: false,
      status,
      title: "Not found",
      message: detail,
      action:
        "Check the ID you entered. If every request 404s, the store URL may be missing /wp-json support or permalinks are set to Plain.",
    };
  }

  if (status === 429) {
    return {
      kind: "rate_limit",
      retriable: true,
      status,
      title: "Rate limited",
      message: detail,
      action: "The store is throttling requests. Wait a moment and retry.",
    };
  }

  if (status >= 500) {
    return {
      kind: "server",
      retriable: true,
      status,
      title: `Server error (${status})`,
      message: detail,
      action:
        "Either the backend or the WooCommerce store errored. Retry; if it repeats, check the store's PHP error log.",
    };
  }

  return {
    kind: "unknown",
    retriable: false,
    status,
    title: `Request failed (${status})`,
    message: detail,
    action: "Check the payload and try again.",
  };
}
