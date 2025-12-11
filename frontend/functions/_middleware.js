/**
 * Cloudflare Pages Middleware
 * TEMPORARILY DISABLED - Simple passthrough to fix timeout issue
 */
export async function onRequest(context) {
  // Simple passthrough - let Cloudflare Pages handle routing
  return context.next();
}
