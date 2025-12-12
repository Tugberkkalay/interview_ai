export function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // API calls - let them pass through (backend handles these)
  if (pathname.startsWith('/api')) {
    return next();
  }

  // Static assets (files with extensions like .js, .css, .png, etc.)
  // Let them be served normally
  const hasExtension = /\.\w+$/.test(pathname);
  if (hasExtension) {
    return next();
  }

  // All other routes (app routes like /dashboard, /register, etc.)
  // Serve index.html so React Router can handle routing
  const indexUrl = new URL('/index.html', url.origin);
  return next(new Request(indexUrl, request));
}

