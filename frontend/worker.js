export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // API calls - return 404 (backend handles these)
    if (pathname.startsWith('/api')) {
      return new Response('Not Found', { status: 404 });
    }

    // Static assets (files with extensions like .js, .css, .png, etc.)
    const hasExtension = /\.\w+$/.test(pathname);
    if (hasExtension) {
      return env.ASSETS.fetch(request);
    }

    // All other routes (app routes like /dashboard, /register, etc.)
    // Serve index.html so React Router can handle routing
    const indexUrl = new URL('/index.html', url.origin);
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};


