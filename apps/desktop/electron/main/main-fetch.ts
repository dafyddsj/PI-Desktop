/**
 * The main process's global `fetch` is Electron `net.fetch` so it honors the
 * network proxy (see network-proxy.ts). Chromium stamps its browser
 * User-Agent on every request, but the code calling global `fetch` here
 * (pi-ai's OAuth login and token refresh) is written for Node's fetch.
 * Anthropic's token endpoint answers a browser User-Agent with a 429
 * `rate_limit_error` before the request reaches the OAuth server, so a
 * request without its own User-Agent gets Node's default instead.
 */

/** What Node's built-in fetch (undici) sends when the caller sets none. */
export const NODE_FETCH_USER_AGENT = "node";

export function withNodeFetchUserAgent(inner: typeof fetch): typeof fetch {
  return ((input, init) => {
    const headers = new Headers(
      init?.headers ?? (input instanceof Request ? input.headers : undefined),
    );
    if (headers.has("user-agent")) return inner(input, init);
    headers.set("user-agent", NODE_FETCH_USER_AGENT);
    return inner(input, { ...init, headers });
  }) as typeof fetch;
}
