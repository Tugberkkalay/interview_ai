/**
 * Cloudflare Pages Middleware
 * Handles SPA routing by serving index.html for all non-file requests
 */
export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  // If it's a file request (has extension like .js, .css, .jpg, etc.), serve it normally
  if (url.pathname.match(/\.[\w]+$/)) {
    return next();
  }
  
  // If it's already index.html, serve it normally
  if (url.pathname === '/index.html' || url.pathname === '/') {
    return next();
  }
  
  // For all other routes (SPA routes), serve index.html
  // This allows React Router to handle client-side routing
  const indexUrl = new URL('/index.html', request.url);
  return next(new Request(indexUrl, request));
}
