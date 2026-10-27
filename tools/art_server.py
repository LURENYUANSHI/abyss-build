"""本地美术接收服务（仅 127.0.0.1）：ChatGPT 页面里的生图脚本把处理好的 PNG POST 过来，写进 art/。
GET  /jobs        -> 任务列表（已存在的文件标记 done）
POST /save?name=x -> body 为 PNG 的 base64（可带 data: 前缀），写入 art/x.png
只接受来自 https://chatgpt.com 的跨域请求；文件名只允许 [a-z0-9_]。"""
import base64, json, os, re
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART, ORIGIN = os.path.join(ROOT, 'art'), 'https://chatgpt.com'
class H(BaseHTTPRequestHandler):
    def cors(self):
        if self.headers.get('Origin') == ORIGIN:
            self.send_header('Access-Control-Allow-Origin', ORIGIN)
            self.send_header('Access-Control-Allow-Private-Network', 'true')
            self.send_header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    def reply(self, code, obj):
        b = json.dumps(obj, ensure_ascii=False).encode(); self.send_response(code); self.cors()
        self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b)
    def do_OPTIONS(self): self.send_response(204); self.cors(); self.end_headers()
    def do_GET(self):
        if urlparse(self.path).path != '/jobs': return self.reply(404, {'err': 'not found'})
        jobs = json.load(open(os.path.join(ROOT, 'tools', 'art_jobs.json'), encoding='utf-8'))
        for j in jobs: j['done'] = os.path.exists(os.path.join(ART, j['name'] + '.png'))
        self.reply(200, jobs)
    def do_POST(self):
        u = urlparse(self.path); name = (parse_qs(u.query).get('name') or [''])[0]
        if u.path != '/save' or not re.fullmatch(r'[a-z0-9_]{1,40}', name): return self.reply(400, {'err': 'bad name'})
        if self.headers.get('Origin') not in (ORIGIN, None): return self.reply(403, {'err': 'origin'})
        n = int(self.headers.get('Content-Length') or 0)
        if n <= 0 or n > 20_000_000: return self.reply(400, {'err': 'size'})
        data = self.rfile.read(n).decode().split(',')[-1]
        png = base64.b64decode(data)
        if png[:8] != b'\x89PNG\r\n\x1a\n': return self.reply(400, {'err': 'not png'})
        open(os.path.join(ART, name + '.png'), 'wb').write(png)
        print('saved', name, len(png), flush=True); self.reply(200, {'ok': True, 'bytes': len(png)})
    def log_message(self, *a): pass
ThreadingHTTPServer(('127.0.0.1', 8766), H).serve_forever()
