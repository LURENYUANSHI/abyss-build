# 人物页高清立绘：9 职业 × 4 档外观（0 初始 / 1 精良 / 2 史诗 / 3 传说）
# 用法：
#   python3 -I tools/portrait.py refs   由 art/anime.png 切出各职业参考 → ref/style/portrait/<职业>.png（推到 Pages）
#   python3 -I tools/portrait.py jobs0  第一步：初始外观 _raw/portrait/jobs0.json（定长相）
#   python3 -I tools/portrait.py pub0   把第一步结果缩小放进 ref/style/portrait/<职业>_t0.png（推到 Pages）
#   python3 -I tools/portrait.py jobs1  第二步：三档换装，参考 = 初始立绘 + 该档游戏内小人
#   python3 -I tools/portrait.py apply  原图 → tools/portrait.swift 抠图 → Pillow 转带透明 WebP → art/hero_<职业>_t<档>.webp
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from restyle import ROOT, ART, BIN, CLS, run
from tiers import TIER

REF, RAW = os.path.join(ROOT, 'ref/style/portrait'), os.path.join(ROOT, '_raw/portrait')
BASE = ('High-resolution anime character illustration: full-body hero splash art like a mobile gacha RPG hero detail page '
        '(Guardian Tales / Epic Seven style hero illustration), normal anime proportions (NOT chibi, NOT pixel art). '
        'Clean crisp line art, vivid cel shading, rich costume detail, dynamic but relaxed heroic standing pose, slightly turned three-quarter view, '
        'the WHOLE body visible from the top of the head (and hat/weapon) down to the feet with a small margin, feet near the bottom, centered. '
        'Background: solid flat pure green #00FF00 everywhere, no floor, no shadow, no scenery, no text, no frame, no border.')
T0 = 'Draw THIS character from the reference (a small chibi portrait): same class, gender, age, face, hair, colors, outfit and weapon. '
T1 = ('Draw the SAME person as the first reference image (same face, hair, body, pose, framing and art style), '
      'but wearing the upgraded equipment shown on the small sprite in the second reference: {t}. ')

def jobs(tiers):
    J = []
    for c in CLS:
        for t in tiers:
            if t == 0:
                J.append([f'hero_{c}_t0', 'k', 1, 1, 1, 1, T0 + BASE, [f'ref/style/portrait/{c}.png']])
            else:
                J.append([f'hero_{c}_t{t}', 'k', 1, 1, 1, 1, T1.format(t=TIER[t]) + BASE,
                          [f'ref/style/portrait/{c}_t0.jpg', f'ref/style/tier/anim_{c}_t{t}.png']])
    return J

if __name__ == '__main__':
    cmd = sys.argv[1]
    os.makedirs(REF, exist_ok=True); os.makedirs(RAW, exist_ok=True)
    if cmd == 'refs':
        for i, c in enumerate(CLS):
            run(f'{BIN}/gridref', os.path.join(ART, 'anime.png'), os.path.join(REF, c + '.png'), i, 1, 1, 2)
    elif cmd in ('jobs0', 'jobs1'):
        J = jobs([0] if cmd == 'jobs0' else [1, 2, 3])
        json.dump(J, open(os.path.join(RAW, cmd + '.json'), 'w'), ensure_ascii=False); print(len(J))
    elif cmd == 'pub0':
        for c in CLS:
            run('sips', '-s', 'format', 'jpeg', '-Z', '768', os.path.join(RAW, f'hero_{c}_t0.png'), '--out', os.path.join(REF, f'{c}_t0.jpg'))
    elif cmd == 'apply':
        n = 0
        for c in CLS:
            for t in range(4):
                raw = os.path.join(RAW, f'hero_{c}_t{t}.png')
                if os.path.exists(raw) and os.path.getsize(raw) > 1000:
                    tmp = os.path.join(RAW, f'hero_{c}_t{t}_key.png'); run(f'{BIN}/portrait', raw, tmp)
                    from PIL import Image
                    Image.open(tmp).save(os.path.join(ART, f'hero_{c}_t{t}.webp'), 'WEBP', quality=86, method=6); n += 1
        print('写出', n)
