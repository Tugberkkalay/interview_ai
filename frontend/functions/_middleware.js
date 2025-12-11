/**
 * Cloudflare Pages Middleware
 * Handles SPA routing by redirecting all routes to index.html
 */
export function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  // If it's a file request (has extension), serve it normally
  if (url.pathname.match(/\.[\w]+$/)) {
    return next();
  }
  
  // For all other routes, serve index.html (SPA routing)
  return next(new Request(new URL('/index.html', request.url), request));
}

