"""Serve generated production responses on loopback for the installed Minion adapter."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import threading
import browser_worker
from browser_plan import validate_plan

routes = json.loads(Path('routes.json').read_text())
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        response = routes.get(self.path, {'status': 404, 'headers': {'Content-Type': 'text/plain'}, 'body': 'Fixture not supplied'})
        self.send_response(response['status'])
        body = response['body'].encode()
        for key, value in response['headers'].items():
            self.send_header(key, value)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, *args):
        pass
server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
thread = threading.Thread(target=server.serve_forever, daemon=True)
thread.start()
plan = json.loads(Path('fixture-plan.json').read_text())
for step in plan['steps']:
    if step['action'] == 'open':
        step['url'] = 'http://127.0.0.1:' + str(server.server_port) + step['url']
try:
    result = browser_worker.run(browser_worker.owned_workspace(), Path(os.environ['MINION_OUTPUT_DIR']), validate_plan(plan))
finally:
    server.shutdown()
    server.server_close()
    thread.join(timeout=5)
raise SystemExit(result)
