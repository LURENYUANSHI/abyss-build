"""把任务提示词压缩成 [name,kind,cols,rows,used,per,head,[[描述,[姿势...]],...],tail]，页面里再还原成完全相同的提示词"""
import json, re, sys
o = json.load(open('tools/art_jobs_compact.json', encoding='utf-8'))
def pack(j):
    name, k, c, r, u, p, body = j
    m = re.match(r"(.*?read left-to-right then top-to-bottom:\n)(.*?)(\nBackground:.*)$", body, re.S)
    if not m: return j[:6] + [body, [], '']
    head, items, tail = m.groups(); subj = []
    for line in items.split('\n'):
        mm = re.match(r"\d+\. (.*) — (.*)$", line)
        d, pose = (mm.group(1), mm.group(2)) if mm else (line.split('. ', 1)[-1], '')
        if subj and subj[-1][0] == d: subj[-1][1].append(pose)
        else: subj.append([d, [pose]])
    return [name, k, c, r, u, p, head, subj, tail]
def unpack(x):
    if not x[7]: return x[6]
    lines = []; n = 1
    for d, poses in x[7]:
        for ps in poses: lines.append(f"{n}. {d} — {ps}" if ps else f"{n}. {d}"); n += 1
    return x[6] + '\n'.join(lines) + x[8]
packed = [pack(j) for j in o]
bad = [j[0] for j, x in zip(o, packed) if unpack(x) != j[6] and x[7]]
assert not bad, bad
a, b = int(sys.argv[1]), int(sys.argv[2])
s = json.dumps(packed[a:b], ensure_ascii=False, separators=(',', ':'))
print(s)
