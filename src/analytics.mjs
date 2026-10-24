// Fixed route families keep disclosure payloads and visitor data out of events.
export function routeFamily(path) {
  if (path === '/') return 'home';
  if (path === '/explore') return 'explore';
  if (path === '/lookup') return 'lookup';
  if (path.startsWith('/qr/')) return 'qr';
  if (/^\/1\/[0-9A-Za-z_-]+\.json\/?$/.test(path)) return 'citation_json';
  if (/^\/1\/[0-9A-Za-z_-]+\/?$/.test(path)) return 'citation';
  if (path.startsWith('/assets/')) return 'asset';
  if (path.startsWith('/blog/')) return 'blog';
  if (path === '/v1' || path === '/v1/categories.json') return 'vocabulary';
  if (path === '/about') return 'about';
  if (path === '/health') return 'health';
  return 'other';
}

export function recordRequest(request, response, env, elapsedMs) {
  if (!env?.ANALYTICS?.writeDataPoint) return;
  try {
    env.ANALYTICS.writeDataPoint({
      blobs: [routeFamily(new URL(request.url).pathname), request.method, String(response.status)],
      doubles: [1, Math.max(0, elapsedMs)],
    });
  } catch {
    // Telemetry must never alter the citation response.
  }
}
