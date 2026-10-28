# 生成分件骨骼的映射（content/rigs.js）和 GPT 生图任务（tools/rig_jobs.json）
# 用法：python3 tools/rig_jobs.py <首领描述 b8.json> <小怪描述 m6.json>
import json,re,sys,subprocess
B=json.load(open(sys.argv[1]));M=json.load(open(sys.argv[2]))
data=json.loads(subprocess.check_output(['node','-e',"global.window={};eval(require('fs').readFileSync('content/raids_data.js','utf8'));console.log(JSON.stringify(window.RAID_DATA))"]))
PARTS={
 'humanoid':['head','torso','pelvis','farUp','farLow','nearUp','nearLow','farLeg','nearLeg','weapon','slash','spark'],
 'quad':['head','body','tail','fFar','fNear','bFar','bNear','fx','spark'],
 'dragon':['head','body','tail','wFar','wNear','fFar','fNear','bFar','bNear','fx','spark'],
 'floater':['head','torso','lower','farUp','farLow','nearUp','nearLow','item','fx','spark'],
 'insect':['head','body','abd','legF1','legF2','legF3','legN1','legN2','legN3','fx','spark'],
 'serpent':['head','neck','seg1','seg2','tail','fx','spark'],
 'front':['head','torso','pelvis','lUp','lLow','rUp','rLow','lLeg','rLeg','weapon','slash','spark'],
 'ffront':['head','torso','lower','lUp','lLow','rUp','rLow','item','fx','spark'],
}
DESC={
 'humanoid':['head (neck stub at bottom)','torso / chest without arms, head or legs','pelvis / waist with belt','far arm upper part (shoulder + upper arm), hanging down','far forearm with hand, hanging down','near arm upper part (shoulder + upper arm), hanging down','near forearm with hand gripping, hanging down','far leg (thigh + shin + foot), straight','near leg (thigh + shin + foot), straight','main weapon or held item alone, horizontal, pointing right (if none: a glowing magic orb)','attack effect arc matching its element','small spark particle matching its element'],
 'quad':['head with neck, mouth slightly open, facing right','body / torso without legs, head or tail','tail','front far leg, straight','front near leg, straight','back far leg, straight','back near leg, straight','attack effect (claw slash or bite flash)','small spark particle'],
 'dragon':['head with long neck, facing right','body / torso without legs, wings, neck or tail','tail','far wing, folded up','near wing, spread','front far leg','front near leg','back far leg','back near leg','breath effect cone pointing right','small spark particle'],
 'floater':['head','torso / chest without arms or head','floating lower body (flames, smoke, robe hem or serpent tail) tapering downward','far arm upper part, hanging down','far forearm with hand, hanging down','near arm upper part, hanging down','near forearm with hand, hanging down','held item or weapon alone, horizontal (if none: a glowing orb)','aura effect matching its element','small spark particle'],
 'insect':['head with mandibles or fangs, facing right','thorax / front body without legs','abdomen / rear body','far front leg','far middle leg','far back leg','near front leg','near middle leg','near back leg','attack effect (venom spit or slash)','small spark particle'],
 'serpent':['head with jaws, facing right','neck segment','body segment','body segment (slightly thinner)','tail tip','attack effect (bite or spit)','small spark particle'],
 'front':['head (neck stub at bottom), facing the viewer','torso / chest without arms, head or legs, front view','pelvis / waist with belt, front view','left-side arm upper part (shoulder + upper arm), hanging down','left-side forearm with hand, hanging down','right-side arm upper part (shoulder + upper arm), hanging down','right-side forearm with hand gripping, hanging down','left leg (thigh + shin + foot), straight, front view','right leg (thigh + shin + foot), straight, front view','main weapon or held item alone, horizontal, pointing right (if none: a glowing magic orb)','attack effect arc matching its element','small spark particle matching its element'],
 'ffront':['head, facing the viewer','torso / chest without arms or head, front view','floating lower body (flames, smoke, robe hem or serpent tail) tapering downward, front view','left-side arm upper part, hanging down','left-side forearm with hand, hanging down','right-side arm upper part, hanging down','right-side forearm with hand, hanging down','held item or weapon alone, horizontal (if none: a glowing orb)','aura effect matching its element','small spark particle']
}
def plan(d):
    t=d.lower()
    if re.search(r'slime|ooze|\bblob\b|\bglob\b',t):return None
    if re.search(r'\bnaga\b',t):return 'floater'                      # 娜迦：上半身 + 蛇尾
    if re.search(r'humanoid|dragonkin|dragonspawn|cultist|drakonid|half-dragon|lich king|death knight|demon hunter|\brider\b|riding|priest|general|satyr|warlock|\btroll\b(?! (war paint|ornaments))|qiraji (lord|prophet|emperor|battleguard)|four arms',t):return 'humanoid'
    if re.search(r'silithid|spider|scarab|beetle|scorpion-bug|crypt lord|carapace|\bwasp\b|nerubian(?! warrior)',t) and not re.search(r'hound',t):return 'insect'
    if re.search(r'hound|wolf|tiger|panther|lynx|boar|raptor|\bhorse\b|charger|felhound|\bdog\b|yeti|\bbear\b|\bcat\b|stalker',t) and not re.search(r'avatar|troll (warlord|priest|warrior)|\borc\b|knight|keeper|pelt',t):return 'quad'
    if re.search(r'\b(dragon|drake|wyrm|whelp|phoenix|dragonhawk|proto-drake)\b(?!-bone|killer| emblem|-skull| bone)',t) and not re.search(r'dragonkiller|dragon emblem|dragon-skull|dragon-bone|bat wings',t):return 'dragon'
    if re.search(r'serpent|snake|cobra|sandworm|\bworm\b|tentacle|jormungar',t):return 'serpent'
    if re.search(r'elemental|ghost|spectral|spirit|wraith|\bshade\b|floating|eye stalk|eye phase|single eye|essence|wisp|naaru|\bimp\b|fiend|anomaly|flame of|\blich\b',t) and not re.search(r'lich-king|lich king',t):return 'floater'
    return 'humanoid'
def prompt(desc,pl,view='side view facing RIGHT'):
    n=len(PARTS[pl]);rows=3 if n>8 else 2;cols=4
    lines='\n'.join(f'{i+1}. {x}' for i,x in enumerate(DESC[pl]))
    return pl,cols,rows,n,("CHARACTER PARTS SHEET for 2D cutout/skeletal animation (like Spine). The character: "+desc+
      ". Draw the SAME character split into separate body parts, all at the SAME scale as if cut from one sprite, "+view+", each part drawn complete (no missing pixels where it overlaps other parts, joints rounded so they overlap cleanly when rotated). "
      f"Strict grid of square cells, {cols} columns x {rows} rows, each cell 256x256 px, one part per cell, centered, fully inside its cell with margin, no text, no labels, no ground shadow. Read left-to-right then top-to-bottom:\n"+lines+
      "\nBackground: solid pure green #00FF00 everywhere outside the parts (for chroma key; never use green inside parts).")
subj={n:s for n,s in B};mob={n:s for n,s in M}
rmap={'boss':{},'trash':{}};jobs=[];fronts=[];seen=set()
def add(kind,key,desc,sheet):
    pl=plan(desc)
    if not pl:return
    rmap[kind][key]={'plan':pl,'sheet':sheet}
    if sheet in seen:return
    seen.add(sheet);p,c,r,n,txt=prompt(desc,pl);jobs.append([sheet,'k',c,r,n,n,txt])
    # 首领里的人形 / 漂浮体型再出一张正面分件图（玩家在下方时用）
    if kind=='boss' and pl in('humanoid','floater'):
        f='rigf_'+sheet[4:];rmap[kind][key]['front']=f;fp='front' if pl=='humanoid' else 'ffront'
        p,c,r,n,txt=prompt(desc,fp,'FRONT view facing the viewer (symmetric, full body, like a JRPG battle sprite)');fronts.append([f,'k',c,r,n,n,txt])
for R in data['raids']:
    for b in R['bosses']:
        for x in [b]+b.get('multi',[]):
            a=x.get('art')
            if not a or a[0] not in subj or a[1]>=len(subj[a[0]]):continue
            add('boss',x['n'],subj[a[0]][a[1]],'rig_'+a[0][len('bosses_'):]+'_'+str(a[1]))
    for k,t in R.get('trash',{}).items():
        a=t.get('art')
        if not a or a[0] not in mob or a[1]>=len(mob[a[0]]):continue
        add('trash',k,mob[a[0]][a[1]][0],'rigm_'+a[0][len('mobs_'):]+'_'+str(a[1]))
js="// 自动生成（tools/rig_jobs.py）：分件骨骼的部件顺序与实体映射\nwindow.RIG_PARTS="+json.dumps(PARTS)+";\nwindow.RIG_MAP="+json.dumps(rmap,ensure_ascii=False)+";\n"
open('content/rigs.js','w').write(js);json.dump(jobs+fronts,open('tools/rig_jobs.json','w'),ensure_ascii=False)
from collections import Counter
print('jobs',len(jobs),'front',len(fronts),'boss',len(rmap['boss']),'trash',len(rmap['trash']))
print(Counter(v['plan'] for k in rmap for v in rmap[k].values()))
