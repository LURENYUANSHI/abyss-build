# ChatGPT 网页端不可用时的备用出图：无印科技 image_gpt 异步接口。
# 用法：python3 tools/wuyin.py <任务 json：[[name, ..., prompt], ...]> <输出目录> [尺寸，默认 3:2]
# 密钥从仓库根目录 .env 读取（已 gitignore，别提交）。出来的原图还要走页面里的抠图切格（__procJob），再 artprep / png8。
import json, os, sys, time, urllib.request, urllib.parse

def env():
    d = {}
    for line in open(os.path.join(os.path.dirname(__file__), '..', '.env')):
        if '=' in line:
            k, v = line.strip().split('=', 1); d[k] = v
    return d

E = env(); KEY = E['IMAGE_WUYIN_API_KEY']
# 默认的 Python-urllib UA 会被对方防火墙 403
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36'

def call(url, body=None):
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body else None,
                                 headers={'Content-Type': 'application/json', 'Authorization': KEY, 'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())

def gen(prompt, size):
    r = call(E['IMAGE_WUYIN_SUBMIT_URL'], {'key': KEY, 'prompt': prompt, 'size': size})
    tid = (r.get('data') or {}).get('id')
    if not tid:
        raise RuntimeError(f'提交失败: {r.get("code")} {r.get("msg")}')
    for _ in range(120):
        time.sleep(5)
        d = call(E['IMAGE_WUYIN_DETAIL_URL'] + '?' + urllib.parse.urlencode({'id': tid, 'key': KEY})).get('data') or {}
        if d.get('status') == 2:
            return d['result'][0]
        if d.get('status') == 3:
            raise RuntimeError(f'生成失败: {d.get("message")}')
    raise RuntimeError('超时')

if __name__ == '__main__':
    jobs, out = json.load(open(sys.argv[1])), sys.argv[2]
    size = sys.argv[3] if len(sys.argv) > 3 else '3:2'
    os.makedirs(out, exist_ok=True)
    for j in jobs:
        name, prompt = j[0], j[-1]
        dst = os.path.join(out, name + '.png')
        if os.path.exists(dst):
            continue
        try:
            url = gen(prompt, size)
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=120) as r:
                open(dst, 'wb').write(r.read())
            print('完成', name, flush=True)
        except Exception as e:
            print('失败', name, e, flush=True)
