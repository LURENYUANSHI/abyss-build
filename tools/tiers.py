# 外观分档：9 职业 × 3 档（精良 / 史诗 / 传说）的整套换装动作图，档 0 = 现有图
# 用法：
#   python3 -I tools/tiers.py refs     由现有（坎公风格）职业图生成参考网格 ref/style/tier/
#   python3 -I tools/tiers.py jobsA    第一步：每档先出 anim（造型基准）_raw/tiers/jobsA.json
#   python3 -I tools/tiers.py anchors  把第一步的原图压缩放到 ref/style/tier/（推到 Pages 后第二步用作第二张参考）
#   python3 -I tools/tiers.py jobsB    第二步：walk / combo / dir 参考自身网格 + 本档 anim 基准
#   python3 -I tools/tiers.py apply    原图 → procraw → fitsheet（以档 0 图为底按原图对齐）写成 art/<表>_t<档>.png，再 png8
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from restyle import ART, ROOT, BIN, CLS, STYLE, SINGLE, TAIL, SIZE, frames, grid, run

REF, RAW = os.path.join(ROOT, 'ref/style/tier'), os.path.join(ROOT, '_raw/tiers')
TIER = {1: 'FINE tier gear: polished steel pieces with blue trim, cleaner well-made cloth, small blue gem accents, the weapon looks sharper and better crafted',
        2: 'EPIC tier gear: ornate purple-and-gold armor or robes with engraved patterns and softly glowing violet runes, fancier head piece, small shoulder guards, a short cape, the weapon is ornate with a violet glow',
        3: 'LEGENDARY tier gear: radiant gold-and-orange armor or robes with flame-like trims, glowing orange gems, a majestic crowned or winged head piece, a flowing cape, the weapon is legendary with a bright golden-orange glow'}
KEEP = ('Upgrade ONLY the equipment/outfit to: {t}. Keep the SAME character underneath: same face, hair, skin, body shape and chibi proportions, '
        'same class and weapon TYPE (just a fancier version), same pose, facing and motion in every cell as the first reference image. ')

def jobs(sheets, anchor=False):
    J = {}
    for c in CLS:
        for p in sheets:
            sh = f'{p}_{c}'; n = frames(sh); cc, r = grid(n)
            for t in (1, 2, 3):
                pr = STYLE + KEEP.format(t=TIER[t]) + SINGLE.format(c=cc, r=r) + TAIL
                refs = [f'ref/style/tier/{sh}.png'] + ([f'ref/style/tier/anim_{c}_t{t}.png'] if anchor else [])
                if anchor:
                    pr += ' The second reference image shows this exact character already wearing the upgraded gear: match that outfit design and colors exactly.'
                J.setdefault(SIZE[(cc, r)], []).append([f'{sh}_t{t}', 'k', cc, r, n, n, pr, refs])
    return J

def dump(J, tag):
    os.makedirs(RAW, exist_ok=True)
    for sz, js in J.items():
        json.dump(js, open(os.path.join(RAW, f'jobs{tag}_{sz.replace(":", "x")}.json'), 'w'), ensure_ascii=False); print(tag, sz, len(js))

if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'refs':
        os.makedirs(REF, exist_ok=True)
        for c in CLS:
            for p in ('walk', 'anim', 'combo', 'dir'):
                sh = f'{p}_{c}'; n = frames(sh); cc, r = grid(n)
                run(f'{BIN}/gridref', os.path.join(ART, sh + '.png'), os.path.join(REF, sh + '.png'), 0, n, cc, 2)
        run(f'{BIN}/png8', *[os.path.join(REF, f) for f in os.listdir(REF)])
    elif cmd == 'jobsA':
        dump(jobs(['anim']), 'A')
    elif cmd == 'anchors':
        fs = []
        for c in CLS:
            for t in (1, 2, 3):
                src = os.path.join(RAW, f'anim_{c}_t{t}.png')
                if os.path.exists(src):
                    dst = os.path.join(REF, f'anim_{c}_t{t}.png'); run('sips', '-Z', '1200', src, '--out', dst); fs.append(dst)
        run(f'{BIN}/png8', *fs)
    elif cmd == 'jobsB':
        dump(jobs(['walk', 'combo', 'dir'], anchor=True), 'B')
    elif cmd == 'apply':
        out = []
        for c in CLS:
            for p in ('walk', 'anim', 'combo', 'dir'):
                sh = f'{p}_{c}'; n = frames(sh); cc, r = grid(n)
                for t in (1, 2, 3):
                    raw = os.path.join(RAW, f'{sh}_t{t}.png')
                    if not os.path.exists(raw) or os.path.getsize(raw) < 1000:
                        print('缺原图', sh, t); continue
                    S = 96; strip = os.path.join(RAW, f'{sh}_t{t}_strip.png'); dst = os.path.join(ART, f'{sh}_t{t}.png')
                    run(f'{BIN}/procraw', raw, strip, cc, r, n, n, S)
                    if os.path.exists(dst): os.remove(dst)
                    fp = 6 if p == 'walk' else 4 if p == 'dir' else n
                    run(f'{BIN}/fitsheet', os.path.join(ART, sh + '.png'), strip, dst, 0, fp); out.append(dst)
        run(f'{BIN}/png8', *out); print('写出', len(out))
