export default {
  /**
   * Cloudflare Worker for SPA routing + static assets
   *
   * - Serves static assets from the bound ASSETS bucket
   * - If a route is not found (404) and looks like an app route
   *   (no file extension, not an API call), it falls back to index.html
   *   so that React Router can handle the route client-side.
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // First, try to serve the requested asset as-is
    let response = await env.ASSETS.fetch(request);

    // If asset not found and it's a GET request to an app route,
    // fall back to index.html for SPA routing
    const isGet = request.method === 'GET';
    const hasExtension = /\.[a-zA-Z0-9]+$/.test(url.pathname);
    const isApi = url.pathname.startsWith('/api');

    if (response.status === 404 && isGet && !hasExtension && !isApi) {
      const indexUrl = new URL('/index.html', url.origin);
      response = await env.ASSETS.fetch(new Request(indexUrl, request));
    }

    return response;
  },
};


