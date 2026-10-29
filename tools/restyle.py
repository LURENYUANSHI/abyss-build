# 坎公风格全量重画（第 1~5 章首领 / 小怪 / 召唤物 + 9 个职业）
# 用法：
#   python3 -I tools/restyle.py refs    生成参考网格到 ref/style/（需推到 Pages，出图接口按网址取参考图）
#   python3 -I tools/restyle.py jobs    写任务清单 _raw/restyle/jobs.json（之后：python3 -I tools/wuyin.py _raw/restyle/jobs.json _raw/restyle <尺寸> 跑出原图）
#   python3 -I tools/restyle.py apply   原图 → procraw 切格 → fitsheet 按原图对齐写回 art/，4/3 帧旧表从新动作表挑帧，最后 png8
# 首领只重画 12 帧动作表（<表>z），旧 4 帧表取 [待机,走路,出手,施法]=[0,2,7,9]；小怪只重画 6 帧表（<表>x），旧 3 帧表取 [0,1,4]。
import json, os, struct, subprocess, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
ART, REF, RAW = (os.path.join(ROOT, p) for p in ('art', 'ref/style', '_raw/restyle'))
BIN = '/private/tmp/claude-501/fit'
CH = ('mc', 'ony', 'bwl', 'zg', 'aq20')
CLS = ('sword', 'mage', 'archer', 'brawler', 'assassin', 'eng', 'ninja', 'bard', 'paladin')

STYLE = ('Redraw this sprite sheet in a clean, cute modern mobile chibi-RPG pixel art style (like popular chibi action RPGs): '
         'crisp readable pixel art, slightly larger and rounder heads, clean dark outlines, flat soft shading with 2-3 tones, '
         'bright saturated but harmonious colors, less noisy detail, friendly and polished look. ')
SINGLE = ('Keep EVERYTHING else identical to the reference: same character design and colors, same equipment, same pose and facing in every cell, '
          'same number of cells in the SAME strict grid ({c} columns x {r} rows, square cells), one frame per cell, centered, '
          'feet at the same height in every cell, nothing crossing cell borders. Do NOT make the character thinner. ')
MULTI = ('Each cell holds a DIFFERENT subject: redraw every cell\'s own subject keeping its design, colors, pose and facing, '
         'in the SAME strict grid ({c} columns x {r} rows, square cells), one subject per cell, centered, nothing crossing cell borders. '
         'Do NOT make anything thinner. ')
TAIL = 'Background: solid pure green #00FF00 everywhere outside the subjects. No text, no labels, no grid lines.'
SIZE = {(4, 3): '3:2', (3, 2): '3:2', (6, 3): '3:2', (4, 2): '16:9', (4, 4): '1:1', (3, 3): '1:1', (2, 2): '1:1', (1, 1): '1:1'}
# 小样已经出过的原图直接沿用
PILOT = {'bosses_mc_1z_0': 'sty_lucifron', 'mobs_mc_1x_0': 'sty_core_hound', 'walk_sword_0': 'sty_walk_sword'}

def frames(sheet):
    w, h = struct.unpack('>II', open(os.path.join(ART, sheet + '.png'), 'rb').read(24)[16:24])
    return w // h

def grid(n):
    return {12: (4, 3), 6: (3, 2), 18: (6, 3), 8: (4, 2), 16: (4, 4), 9: (3, 3), 5: (3, 2), 3: (2, 2), 1: (1, 1)}[n]

def plan():
    """每项：(任务名, 图集, 起始格, 帧数, 单角色?, 派生旧表)"""
    J = []
    for f in sorted(os.listdir(ART)):
        n = f[:-4]
        if not f.endswith('.png') or not any(n.startswith(p + c) for p in ('bosses_', 'mobs_', 'adds_') for c in CH):
            continue
        if n.startswith('bosses_') and n.endswith('z'):
            for k in range(frames(n) // 12):
                J.append((f'{n}_{k}', n, k * 12, 12, True, (n[:-1], k * 4, 4, '0,2,7,9')))
        elif n.startswith('mobs_') and n.endswith('x'):
            for k in range(frames(n) // 6):
                J.append((f'{n}_{k}', n, k * 6, 6, True, (n[:-1], k * 3, 3, '0,1,4')))
        elif n.startswith('adds_'):
            m = frames(n)
            for s in range(0, m, 12):
                J.append((f'{n}_{s // 12}', n, s, min(12, m - s), False, None))
    for c in CLS:
        for p in ('walk', 'anim', 'combo', 'dir'):
            J.append((f'{p}_{c}_0', f'{p}_{c}', 0, frames(f'{p}_{c}'), True, None))
    J += [('heroes_0', 'heroes', 0, 9, False, None), ('anime_0', 'anime', 0, 9, False, None)]
    return J

def run(*a):
    subprocess.run([str(x) for x in a], check=True)

if __name__ == '__main__':
    J, cmd = plan(), sys.argv[1]
    if cmd == 'refs':
        os.makedirs(REF, exist_ok=True)
        for name, sheet, s, n, *_ in J:
            c, r = grid(n)
            run(f'{BIN}/gridref', os.path.join(ART, sheet + '.png'), os.path.join(REF, name + '.png'), s, n, c, 2)
        print(len(J), '张参考图')
    elif cmd == 'jobs':
        os.makedirs(RAW, exist_ok=True)
        out = {}
        for name, sheet, s, n, single, _ in J:
            if name in PILOT:
                src = os.path.join(ROOT, '_raw/style', PILOT[name] + '.png')
                if os.path.exists(src) and not os.path.exists(os.path.join(RAW, name + '.png')):
                    run('cp', src, os.path.join(RAW, name + '.png'))
            c, r = grid(n)
            p = STYLE + (SINGLE if single else MULTI).format(c=c, r=r) + TAIL
            out.setdefault(SIZE[(c, r)], []).append([name, 'k', c, r, n, n if single else 1, p, f'ref/style/{name}.png'])
        for sz, js in out.items():
            json.dump(js, open(os.path.join(RAW, f'jobs_{sz.replace(":", "x")}.json'), 'w'), ensure_ascii=False)
            print(sz, len(js))
    elif cmd == 'apply':
        touched = set()
        for name, sheet, s, n, single, der in J:
            raw = os.path.join(RAW, name + '.png')
            if not os.path.exists(raw):
                print('缺原图', name); continue
            S = struct.unpack('>II', open(os.path.join(ART, sheet + '.png'), 'rb').read(24)[16:24])[1]
            c, r = grid(n)
            strip = os.path.join(RAW, name + '_strip.png')
            run(f'{BIN}/procraw', raw, strip, c, r, n, n if single else 1, S)
            dst = os.path.join(ART, sheet + '.png')
            fp = 6 if sheet.startswith('walk_') else 4 if sheet.startswith('dir_') else n if single else 1   # 走路按正/背/侧每行、四向图按每 4 帧各自对齐原图身高
            run(f'{BIN}/fitsheet', dst, strip, dst, s, fp)
            touched.add(dst)
            if der:
                old, off, per, idx = der
                d2 = os.path.join(ART, old + '.png')
                if os.path.exists(d2):
                    run(f'{BIN}/fitsheet', d2, strip, d2, off, per, idx); touched.add(d2)
        for t in sorted(touched):
            run(f'{BIN}/png8', t)
        print('写回', len(touched), '张图集')
