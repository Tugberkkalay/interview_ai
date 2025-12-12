/**
 * Cloudflare Workers Middleware for SPA Routing
 * 
 * This middleware handles client-side routing by serving index.html
 * for all routes that are not static assets.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // If the request is for a static file (has extension), serve it as-is
    // Examples: .js, .css, .png, .svg, .ico, etc.
    if (url.pathname.match(/\.\w+$/)) {
      return env.ASSETS.fetch(request);
    }
    
    // For all other routes (e.g., /dashboard, /login, /interview/xxx),
    // serve index.html to enable client-side routing
    const indexUrl = new URL('/index.html', url.origin);
    return env.ASSETS.fetch(new Request(indexUrl, request));
  }
}

