/**
 * Cloudflare Pages Middleware
 * Handles SPA routing by serving index.html for all non-file requests
 */
export function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  // If it's a file request (has extension like .js, .css, .jpg, etc.), serve it normally
  if (url.pathname.match(/\.[\w]+$/)) {
    return next();
  }
  
  // For all other routes (SPA routes), serve index.html
  // This allows React Router to handle client-side routing
  return next(new Request(new URL('/index.html', request.url), request));
}
