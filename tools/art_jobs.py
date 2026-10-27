"""从 design/art_todo.md 提取 GPT 生图任务列表 -> tools/art_jobs.json（文件名、提示词、网格、抠图方式、每个主体几格）"""
import re, json, sys
md = open('design/art_todo.md', encoding='utf-8').read()
jobs = []
for m in re.finditer(r"^### \d+\. `([^`]+)\.png` — ([^\n]*)\n+```\n(.*?)\n```", md, re.S | re.M):
    name, title, prompt = m.group(1), m.group(2), m.group(3).strip()
    g = re.search(r"(\d+) columns x (\d+) rows", prompt)
    cols, rows = (int(g.group(1)), int(g.group(2))) if g else (4, 4)
    used = re.search(r"(\d+) cells used", prompt)
    kind = 'tiles' if name.startswith('tiles') else 'lum' if '#000000' in prompt and '#00FF00' not in prompt else 'key'
    per = 4 if name.startswith('bosses') else 3 if name.startswith('mobs') else 2 if name.startswith('props') else 1
    jobs.append(dict(name=name, title=title, cols=cols, rows=rows, used=int(used.group(1)) if used else cols * rows,
                     kind=kind, per=per, prompt="Image generator only (no code, no files, show the image in chat). " + prompt))
json.dump(jobs, open('tools/art_jobs.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(jobs), 'jobs;', {k: sum(j['kind'] == k for j in jobs) for k in ('tiles', 'key', 'lum')})
assert all(j['cols'] * j['rows'] >= j['used'] for j in jobs)
