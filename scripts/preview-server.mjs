// Local preview of the packaged Worker handler. No Cloudflare credentials needed.
import http from 'node:http';
import worker from '../src/worker.mjs';

const server = http.createServer(async (request, response) => {
  try {
    const result = worker.fetch(new Request(`https://aiused.org${request.url}`, {
      method: request.method,
    }));
    response.writeHead(result.status, Object.fromEntries(result.headers));
    response.end(Buffer.from(await result.arrayBuffer()));
  } catch {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Preview failed.');
  }
});

server.listen(0, '127.0.0.1', () => {
  console.log(`http://127.0.0.1:${server.address().port}`);
});
