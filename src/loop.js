// 玩法闭环：难度阶梯、局外货币与消耗（强化 / 重铸 / 天赋 / 卡池解锁）、路线选择（战斗 / 精英 / 商店 / 事件 / 休息）、
// 海克斯升星、章中存档点、职业解锁与精通、首领图鉴、成就、每日挑战与每日首杀宝箱。
// 在 game.html 主脚本之前加载：这里只放定义，运行时才访问 PROG / G / st / pl 等全局。

// ---------- 难度阶梯 ----------
// ---------- 界面图标（art/ui_icons.png，25 格横排） ----------
const IC={gold:0,dust:1,mark:2,battle:3,elite:4,shop:5,event:6,rest:7,hex:8,refresh:9,del:10,up:11,ad:12,hp:13,chest:14,lock:15,hero:16,raid:17,bag:18,tal:19,codex:20,party:21,set:22,trophy:23,endless:24};
const icon=(n,c='')=>`<i class="ic ${c}" style="background-position:${IC[n]/24*100}% 0"></i>`;
// 文字里的货币前面自动加图标；按钮按开头的字配图标。处理过的包在 .icw 里，重复调用不会重复加
const IC_WORD={'金币':'gold','徽记':'mark','尘':'dust','战力':'trophy'},IC_BTN=[[/^(刷新|再来一次|重新)/,'refresh'],[/^看广告/,'ad'],[/^删除|^分解/,'del'],[/^(随机)?升星|^强化/,'up'],[/^离开|^返回/,'hero'],[/^复活|^休息|^疗伤/,'hp'],[/^从章首|^进入副本|^从存档/,'raid'],[/^无尽/,'endless'],[/^每日挑战|^领取/,'trophy'],[/^解锁|^🔒/,'lock'],[/^一键穿|^穿戴|^装备专武/,'bag'],[/^献祭|^打开|^赌/,'event'],[/^清空存档/,'del'],[/^重铸/,'refresh'],[/^扫荡/,'battle'],[/^重置/,'refresh'],[/^学习/,'up'],[/^带上场/,'battle'],[/^(白银|黄金|棱彩)/,'hex']];
function iconText(root){if(!root||!root.querySelectorAll)return;
  const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement&&!n.parentElement.closest('.icw,script,style,canvas,textarea,#hexV .icon')&&/金币|徽记|尘|战力|\d\s?金(?!币)/.test(n.nodeValue)?1:2}),list=[];
  while(tw.nextNode())list.push(tw.currentNode);
  for(const n of list){const f=document.createDocumentFragment();let last=0;const v=n.nodeValue,re=/(金币|徽记|尘|战力)|(\d\s?)(金)(?!币)/g;let m;
    while((m=re.exec(v))){const w=m[1]||m[3],at=m.index+(m[1]?0:m[2].length);f.append(v.slice(last,at));const sp=document.createElement('span');sp.className='icw';sp.innerHTML=icon(IC_WORD[w]||'gold')+w;f.append(sp);last=at+w.length;}
    f.append(v.slice(last));n.replaceWith(f);}
  for(const b of root.querySelectorAll('button,.b')){if(b.dataset.ic||(b.firstElementChild&&b.firstElementChild.classList.contains('ic')&&!b.firstElementChild.closest('.icw')))continue;const t=(b.innerText||'').trim();const hit=IC_BTN.find(([r])=>r.test(t));b.dataset.ic=1;
    if(hit){if(hit[1]==='lock')for(const n of b.childNodes)if(n.nodeType===3)n.nodeValue=n.nodeValue.replace('🔒','');b.insertAdjacentHTML('afterbegin',icon(hit[1]));}}}
const DIFF_T=[{n:'普通',hp:1,dmg:1,il:0,rar:0,marks:3},{n:'英雄',hp:1.9,dmg:1.4,il:8,rar:.12,marks:5},{n:'史诗',hp:3.4,dmg:1.9,il:16,rar:.24,marks:8}];
let selDiff=0;
const diffOf=()=>DIFF_T[(G&&G.diff)||0];

// ---------- 天赋树（账号每升 1 级给 1 点） ----------
// ---------- 天赋树（仿魔兽 60 级三系天赋，每个职业自己的三系）：每个天赋 1 点；某系投入 2×层数 点才解锁该系下一层 ----------
// 天赋点：账号每 2 级 1 点，上限 14 = 一系点满（9）+ 另一系一半。每系第 3 层有一个天赋技能，三系里选一个带上场（第二个技能按钮）
// 天赋节点：[层, 名字, 说明, 效果函数 或 天赋技能 id]；每系 9 个，第 3 层（t=2）有一个天赋技能
const ttTree=(n,c,list,pre)=>({n,c,nodes:list.map(([t,nm,d,f],i)=>Object.assign({id:pre+(i+1),t,n:nm,d},typeof f==='string'?{sk:f}:{f}))});
const ttHP=k=>()=>pl.maxHp=Math.round(pl.maxHp*k);
const TT={
 mage:[ttTree('奥术','#b48cff',[[0,'奥术专注','普攻伤害 +8%',()=>st.atkMul*=1.08],[0,'奥术心智','最大生命 +8%',ttHP(1.08)],[1,'奥术专精','技能冷却 -10%',()=>st.skillCd*=.9],[1,'魔法吸收','受到伤害 -6%',()=>st.dmgTaken*=.94],[2,'奥术飞弹','天赋技能：连续射出 5 枚奥术飞弹，追踪最近的敌人','missiles'],[2,'奥术冥想','每秒回复 0.8% 生命',()=>st.regen+=.008],[3,'气定神闲','技能伤害 +20%',()=>st.skillMul*=1.2],[3,'法术迅捷','攻击速度 +10%',()=>st.atkCd*=.9],[4,'奥术强化','法球伤害 +20%，爆炸范围 +30%',()=>{st.atkMul*=1.2;st.boomMul*=1.3;}]],'a'),
   ttTree('火焰','#ff8a3a',[[0,'强化火球','普攻点燃敌人（每秒 15% 普攻伤害）',()=>st.burn+=.15],[0,'灼烧','暴击伤害 +30%',()=>st.critDmg+=.3],[1,'冲击','暴击率 +5%',()=>st.crit+=.05],[1,'点燃','燃烧伤害 +40%',()=>st.burnMul*=1.4],[2,'烈焰风暴','天赋技能：在敌人最密集处降下烈焰，大范围伤害并点燃','flamestrike'],[2,'燃烧之魂','最大生命 +6%，受到伤害 -4%',()=>{ttHP(1.06)();st.dmgTaken*=.96;}],[3,'火焰强化','普攻与技能伤害 +10%',()=>{st.atkMul*=1.1;st.skillMul*=1.1;}],[3,'冲击波','每 6 秒自动释放火焰新星',()=>st.fireNova=true],[4,'燃烧','燃烧伤害 ×2，暴击率 +10%',()=>{st.burnMul*=2;st.crit+=.1;}]],'f'),
   ttTree('冰霜','#6fd0ff',[[0,'冰霜导能','普攻减速敌人',()=>st.slow+=.3],[0,'霜甲术','受到伤害 -8%',()=>st.dmgTaken*=.92],[1,'刺骨寒冰','对减速的敌人伤害 +20%',()=>st.slowBonus*=1.2],[1,'寒冰护体','最大生命 +10%',ttHP(1.1)],[2,'冰霜新星','天赋技能：冻结身边的敌人 2 秒并造成伤害','frostnova'],[2,'冰冷血脉','技能冷却 -12%',()=>st.skillCd*=.88],[3,'碎冰','冻结的敌人受到更多伤害',()=>st.shatter=true],[3,'极寒','每 5 次普攻冻结一名敌人',()=>{st.freezeEvery=st.freezeEvery?Math.max(2,st.freezeEvery-1):5;}],[4,'寒冰箭','法球伤害 +15%，减速效果加倍',()=>{st.atkMul*=1.15;st.slow*=2;}]],'i')],
 sword:[ttTree('剑气','#8fd7ff',[[0,'锋芒','普攻伤害 +8%',()=>st.atkMul*=1.08],[0,'坚毅','最大生命 +8%',ttHP(1.08)],[1,'剑气纵横','剑气每次多 1 道',()=>st.waveCount+=1],[1,'凝气','剑气伤害 +20%',()=>st.waveMul*=1.2],[2,'破空斩','天赋技能：向最近的敌人斩出一道贯穿剑气，击退沿途敌人','sw_line'],[2,'剑意','技能冷却 -10%',()=>st.skillCd*=.9],[3,'万剑','剑气伤害 +25%',()=>st.waveMul*=1.25],[3,'御剑','攻击速度 +10%',()=>st.atkCd*=.9],[4,'剑心通明','普攻与剑气伤害 +20%',()=>{st.atkMul*=1.2;st.waveMul*=1.2;}]],'s'),
   ttTree('剑阵','#c8a8ff',[[0,'剑阵·一','环身飞剑 +1',()=>st.swords+=1],[0,'护体','受到伤害 -6%',()=>st.dmgTaken*=.94],[1,'剑阵·二','飞剑伤害 +25%',()=>st.swordDmg*=1.25],[1,'剑刃风暴','剑刃风暴范围 +20%',()=>st.skR*=1.2],[2,'剑雨','天赋技能：在敌人最密集处落下剑雨','sw_rain'],[2,'不动如山','最大生命 +10%',ttHP(1.1)],[3,'剑阵·三','环身飞剑 +2',()=>st.swords+=2],[3,'风暴不息','技能伤害 +20%',()=>st.skillMul*=1.2],[4,'万剑归宗','飞剑伤害 +40%，技能冷却 -10%',()=>{st.swordDmg*=1.4;st.skillCd*=.9;}]],'z'),
   ttTree('暴击','#ff9a6a',[[0,'致命','暴击率 +5%',()=>st.crit+=.05],[0,'精准','普攻伤害 +6%',()=>st.atkMul*=1.06],[1,'重创','暴击伤害 +30%',()=>st.critDmg+=.3],[1,'猎杀','对首领伤害 +10%',()=>st.bossDmg*=1.1],[2,'致命突袭','天赋技能：瞬步到最近的敌人身后，重击并必定暴击','sw_blink'],[2,'鲜血渴望','击杀回复生命',()=>st.killHeal+=3],[3,'溅射','暴击伤害溅射周围敌人',()=>st.critSplash=true],[3,'斩首','普攻直接斩杀生命低于 20% 的小怪',()=>st.execute=Math.max(st.execute,.2)],[4,'剑圣','暴击率 +10%，暴击伤害 +40%',()=>{st.crit+=.1;st.critDmg+=.4;}]],'c')],
 brawler:[ttTree('震地','#ffb070',[[0,'铁拳','普攻伤害 +8%',()=>st.atkMul*=1.08],[0,'厚皮','最大生命 +8%',ttHP(1.08)],[1,'重压','震地范围 +20%',()=>st.skR*=1.2],[1,'碎石','技能伤害 +15%',()=>st.skillMul*=1.15],[2,'地裂冲击','天赋技能：重拳砸地，眩晕身边所有敌人','br_quake'],[2,'稳固','受到伤害 -6%',()=>st.dmgTaken*=.94],[3,'余震','震地后留下余震',()=>st.aftershock=true],[3,'山崩','技能冷却 -12%',()=>st.skillCd*=.88],[4,'崩山','技能伤害 +30%，范围 +20%',()=>{st.skillMul*=1.3;st.skR*=1.2;}]],'q'),
   ttTree('嗜血','#ff6a6a',[[0,'嗜血','吸血 +3%',()=>st.vamp+=.03],[0,'强壮','最大生命 +10%',ttHP(1.1)],[1,'血战','击杀回复生命',()=>st.killHeal+=3],[1,'愈合','每秒回复 0.6% 生命',()=>st.regen+=.006],[2,'血之狂暴','天赋技能：6 秒内暴击率 +50%，并立即回复 15% 生命','br_rage'],[2,'坚韧','受到伤害 -8%',()=>st.dmgTaken*=.92],[3,'饮血','吸血 +4%',()=>st.vamp+=.04],[3,'不屈','最大生命 +10%',ttHP(1.1)],[4,'血神','吸血 +5%，普攻伤害 +15%',()=>{st.vamp+=.05;st.atkMul*=1.15;}]],'v'),
   ttTree('狂暴','#ffd35a',[[0,'连打','攻击速度 +8%',()=>st.atkCd*=.92],[0,'怒火','普攻伤害 +6%',()=>st.atkMul*=1.06],[1,'疾风拳','攻击速度 +8%',()=>st.atkCd*=.92],[1,'暴怒','暴击率 +5%',()=>st.crit+=.05],[2,'旋风连打','天赋技能：对最近的敌人连续出拳 6 次','br_flurry'],[2,'背水','生命低于一半时攻击更快',()=>st.rage=true],[3,'猛击','暴击伤害 +30%',()=>st.critDmg+=.3],[3,'不知疲倦','攻击速度 +10%',()=>st.atkCd*=.9],[4,'狂战士','普攻伤害 +20%，攻击速度 +10%',()=>{st.atkMul*=1.2;st.atkCd*=.9;}]],'r')],
 eng:[ttTree('炮台','#9fe8a0',[[0,'加固','炮台伤害 +15%',()=>st.turretMul*=1.15],[0,'防护服','最大生命 +8%',ttHP(1.08)],[1,'扩建','炮台上限 +1',()=>st.turretMax+=1],[1,'超频','炮台射速 +20%',()=>st.turretRate*=.83],[2,'地雷阵','天赋技能：在敌人最密集处引爆地雷，击退敌人','en_mine'],[2,'快速部署','技能冷却 -12%',()=>st.skillCd*=.88],[3,'自毁程序','炮台失效时爆炸',()=>st.turretBoom=true],[3,'精工','炮台伤害 +25%',()=>st.turretMul*=1.25],[4,'炮台大师','炮台上限 +1，伤害 +30%',()=>{st.turretMax+=1;st.turretMul*=1.3;}]],'t'),
   ttTree('弹药','#ffd35a',[[0,'穿甲弹','普攻伤害 +8%',()=>st.atkMul*=1.08],[0,'战术背心','受到伤害 -6%',()=>st.dmgTaken*=.94],[1,'连射','攻击速度 +10%',()=>st.atkCd*=.9],[1,'贯穿','普攻穿透 +1',()=>st.pierce=(st.pierce||0)+1],[2,'霰弹齐射','天赋技能：对最近的敌人连续射击 8 发','en_shot'],[2,'弹药专家','暴击率 +5%',()=>st.crit+=.05],[3,'双管','普攻多发射 1 发',()=>st.multishot+=1],[3,'重弹','暴击伤害 +30%',()=>st.critDmg+=.3],[4,'火力全开','普攻伤害 +25%',()=>st.atkMul*=1.25]],'m'),
   ttTree('电能','#7fe6ff',[[0,'充能','每 4 次普攻释放闪电',()=>{st.boltEvery=st.boltEvery?Math.max(2,st.boltEvery-1):4;}],[0,'绝缘','最大生命 +8%',ttHP(1.08)],[1,'高压','闪电伤害 +25%',()=>st.boltMul*=1.25],[1,'导电','闪电多弹射 2 次',()=>st.chain+=2],[2,'电磁脉冲','天赋技能：释放电磁脉冲，眩晕身边的敌人','en_emp'],[2,'能量护盾','获得 30 点可再生护盾',()=>{st.shieldMax+=30;pl.shield=Math.max(pl.shield,st.shieldMax);}],[3,'过载','闪电更频繁',()=>{st.boltEvery=st.boltEvery?Math.max(2,st.boltEvery-1):3;}],[3,'特斯拉','闪电伤害 +30%',()=>st.boltMul*=1.3],[4,'雷霆科技','闪电伤害 ×1.5，技能伤害 +15%',()=>{st.boltMul*=1.5;st.skillMul*=1.15;}]],'e')],
 archer:[ttTree('射击','#9fe8a0',[[0,'稳固射击','普攻伤害 +8%',()=>st.atkMul*=1.08],[0,'灵巧','移动速度 +6%',()=>st.speed*=1.06],[1,'强弓','暴击率 +5%',()=>st.crit+=.05],[1,'穿透','普攻穿透 +1',()=>st.pierce=(st.pierce||0)+1],[2,'穿透射击','天赋技能：射出一支贯穿长箭，击中直线上所有敌人','ar_line'],[2,'鹰眼','暴击伤害 +30%',()=>st.critDmg+=.3],[3,'多重射击','普攻多射 1 支箭',()=>st.multishot+=1],[3,'急速射击','攻击速度 +10%',()=>st.atkCd*=.9],[4,'神射手','普攻伤害 +25%，暴击率 +5%',()=>{st.atkMul*=1.25;st.crit+=.05;}]],'h'),
   ttTree('野兽','#ffb070',[[0,'野性呼唤','狼伙伴 +1',()=>st.minions+=1],[0,'皮毛护甲','最大生命 +8%',ttHP(1.08)],[1,'狂野','伙伴伤害 +25%',()=>st.minionMul*=1.25],[1,'敏捷','伙伴攻击更快',()=>st.minionCd*=.85],[2,'群狼撕咬','天赋技能：狼群连续撕咬附近的敌人 6 次，并让你吸血','ar_pack'],[2,'坚韧','受到伤害 -6%',()=>st.dmgTaken*=.94],[3,'狼群','狼伙伴 +1',()=>st.minions+=1],[3,'野兽之怒','伙伴伤害 +30%',()=>st.minionMul*=1.3],[4,'兽王','伙伴伤害 ×1.5，狼伙伴 +1',()=>{st.minionMul*=1.5;st.minions+=1;}]],'b'),
   ttTree('毒箭','#9fff6a',[[0,'淬毒','普攻附加中毒',()=>st.poisonOnHit+=2],[0,'草药','每秒回复 0.6% 生命',()=>st.regen+=.006],[1,'剧毒','毒伤 +30%',()=>st.poisonMul*=1.3],[1,'蔓延','毒层上限 +4',()=>st.poisonCap+=4],[2,'毒雾箭','天赋技能：在敌人最密集处炸开毒雾，叠加大量毒层','ar_poison'],[2,'腐蚀','技能冷却 -10%',()=>st.skillCd*=.9],[3,'致命毒素','毒伤 +40%',()=>st.poisonMul*=1.4],[3,'毒爆','中毒的敌人死亡时爆炸',()=>st.poisonBurst=true],[4,'瘟疫','毒伤 ×2',()=>st.plague=true]],'p')],
 assassin:[ttTree('暗影','#b48cff',[[0,'潜行','移动速度 +8%',()=>st.speed*=1.08],[0,'暗影护体','受到伤害 -6%',()=>st.dmgTaken*=.94],[1,'影袭强化','技能伤害 +20%',()=>st.skillMul*=1.2],[1,'迅捷','技能冷却 -10%',()=>st.skillCd*=.9],[2,'暗影步','天赋技能：瞬步到最近的敌人身后，重击并必定暴击','as_blink'],[2,'闪避','最大生命 +8%',ttHP(1.08)],[3,'处决','普攻直接斩杀生命低于 20% 的小怪',()=>st.execute=Math.max(st.execute,.2)],[3,'暗影之舞','技能冷却 -12%',()=>st.skillCd*=.88],[4,'影之主','技能伤害 +30%，受到伤害 -8%',()=>{st.skillMul*=1.3;st.dmgTaken*=.92;}]],'d'),
   ttTree('致命','#ff6a6a',[[0,'锋刃','暴击率 +5%',()=>st.crit+=.05],[0,'精准','普攻伤害 +6%',()=>st.atkMul*=1.06],[1,'要害','暴击伤害 +30%',()=>st.critDmg+=.3],[1,'猎杀','对首领伤害 +10%',()=>st.bossDmg*=1.1],[2,'刺骨','天赋技能：6 秒内暴击率 +50%，并回复 10% 生命','as_rage'],[2,'嗜血','击杀回复生命',()=>st.killHeal+=3],[3,'溅血','暴击伤害溅射周围敌人',()=>st.critSplash=true],[3,'冷血','暴击伤害 +30%',()=>st.critDmg+=.3],[4,'刺杀大师','暴击率 +10%，对首领伤害 +15%',()=>{st.crit+=.1;st.bossDmg*=1.15;}]],'k'),
   ttTree('毒伤','#9fff6a',[[0,'淬毒刃','普攻附加中毒',()=>st.poisonOnHit+=2],[0,'抗毒','最大生命 +8%',ttHP(1.08)],[1,'剧毒','毒伤 +30%',()=>st.poisonMul*=1.3],[1,'毒囊','毒层上限 +4',()=>st.poisonCap+=4],[2,'毒刃风暴','天赋技能：旋身挥出毒刃，让身边所有敌人中毒','as_poison'],[2,'恢复','每秒回复 0.6% 生命',()=>st.regen+=.006],[3,'致命毒药','毒伤 +40%',()=>st.poisonMul*=1.4],[3,'毒爆','中毒的敌人死亡时爆炸',()=>st.poisonBurst=true],[4,'毒王','毒伤 ×2',()=>st.plague=true]],'o')],
 ninja:[ttTree('影遁','#b48cff',[[0,'分身强化','分身伤害 +20%',()=>st.cloneMul*=1.2],[0,'身法','移动速度 +8%',()=>st.speed*=1.08],[1,'残影','受到伤害 -6%',()=>st.dmgTaken*=.94],[1,'影分身','技能冷却 -10%',()=>st.skillCd*=.9],[2,'替身术','天赋技能：获得相当于 25% 生命的护盾，并加速 3 秒','nj_sub'],[2,'忍耐','最大生命 +8%',ttHP(1.08)],[3,'多重影分身','分身伤害 +30%',()=>st.cloneMul*=1.3],[3,'隐忍','技能冷却 -12%',()=>st.skillCd*=.88],[4,'影之极意','分身伤害 ×1.4，技能伤害 +15%',()=>{st.cloneMul*=1.4;st.skillMul*=1.15;}]],'y'),
   ttTree('手里剑','#c8c0ff',[[0,'利刃','普攻伤害 +8%',()=>st.atkMul*=1.08],[0,'轻装','移动速度 +6%',()=>st.speed*=1.06],[1,'连投','攻击速度 +10%',()=>st.atkCd*=.9],[1,'弹射','手里剑弹射 +1',()=>st.bounce=(st.bounce||0)+1],[2,'千本手里剑','天赋技能：对附近的敌人连续投出 8 枚手里剑','nj_storm'],[2,'精准','暴击率 +5%',()=>st.crit+=.05],[3,'双投','普攻多投 1 枚',()=>st.multishot+=1],[3,'致命飞镖','暴击伤害 +30%',()=>st.critDmg+=.3],[4,'风魔','普攻伤害 +25%，攻击速度 +10%',()=>{st.atkMul*=1.25;st.atkCd*=.9;}]],'u'),
   ttTree('雷遁','#7fe6ff',[[0,'雷光','每 4 次普攻释放闪电',()=>{st.boltEvery=st.boltEvery?Math.max(2,st.boltEvery-1):4;}],[0,'雷甲','最大生命 +8%',ttHP(1.08)],[1,'雷击','闪电伤害 +25%',()=>st.boltMul*=1.25],[1,'雷链','闪电多弹射 2 次',()=>st.chain+=2],[2,'雷遁·落雷','天赋技能：在敌人最密集处降下落雷，眩晕敌人','nj_thunder'],[2,'雷神之速','技能冷却 -10%',()=>st.skillCd*=.9],[3,'雷暴','闪电更频繁',()=>{st.boltEvery=st.boltEvery?Math.max(2,st.boltEvery-1):3;}],[3,'千鸟','闪电伤害 +30%',()=>st.boltMul*=1.3],[4,'麒麟','闪电伤害 ×1.5，技能伤害 +15%',()=>{st.boltMul*=1.5;st.skillMul*=1.15;}]],'n')],
 bard:[ttTree('战歌','#ffd35a',[[0,'激昂','战歌攻击加成 +15%',()=>st.songAtk*=1.15],[0,'嘹亮','最大生命 +8%',ttHP(1.08)],[1,'高歌','战歌期间暴击率 +20%',()=>st.songCrit+=.2],[1,'余音','技能冷却 -10%',()=>st.skillCd*=.9],[2,'激昂乐章','天赋技能：立刻进入战歌状态 6 秒，并回复 10% 生命','bd_song'],[2,'鼓舞','普攻伤害 +8%',()=>st.atkMul*=1.08],[3,'史诗乐章','战歌期间伤害 ×1.5 并持续回血',()=>st.epicSong=true],[3,'回响','战歌治疗 +30%',()=>st.songHeal*=1.3],[4,'终焉','战歌攻击加成 +30%，技能伤害 +15%',()=>{st.songAtk*=1.3;st.skillMul*=1.15;}]],'g'),
   ttTree('乐灵','#c8a8ff',[[0,'乐灵','乐灵 +1',()=>st.minions+=1],[0,'灵动','移动速度 +6%',()=>st.speed*=1.06],[1,'和声','乐灵伤害 +25%',()=>st.minionMul*=1.25],[1,'节拍','乐灵攻击更快',()=>st.minionCd*=.85],[2,'乐灵合奏','天赋技能：乐灵对附近的敌人连续演奏 6 次','bd_choir'],[2,'共鸣','受到伤害 -6%',()=>st.dmgTaken*=.94],[3,'合唱团','乐灵 +1',()=>st.minions+=1],[3,'强音','乐灵伤害 +30%',()=>st.minionMul*=1.3],[4,'交响','乐灵伤害 ×1.5，乐灵 +1',()=>{st.minionMul*=1.5;st.minions+=1;}]],'l'),
   ttTree('守护','#9fe8ff',[[0,'护盾之歌','获得 30 点可再生护盾',()=>{st.shieldMax+=30;pl.shield=Math.max(pl.shield,st.shieldMax);}],[0,'安抚','每秒回复 0.6% 生命',()=>st.regen+=.006],[1,'坚定','受到伤害 -8%',()=>st.dmgTaken*=.92],[1,'回复','护盾恢复更快',()=>st.shieldRegen*=1.5],[2,'守护和弦','天赋技能：获得相当于 30% 生命的护盾，并回复 10% 生命','bd_guard'],[2,'厚实','最大生命 +10%',ttHP(1.1)],[3,'反震','受击时反伤周围敌人',()=>st.thorns=true],[3,'壁垒','护盾 +40',()=>{st.shieldMax+=40;pl.shield=Math.max(pl.shield,st.shieldMax);}],[4,'不朽乐章','受到伤害 -12%，最大生命 +10%',()=>{st.dmgTaken*=.88;ttHP(1.1)();}]],'w')],
 paladin:[ttTree('惩戒','#ffd35a',[[0,'正义','普攻伤害 +8%',()=>st.atkMul*=1.08],[0,'虔诚','最大生命 +8%',ttHP(1.08)],[1,'审判强化','审判伤害 +25%',()=>st.judgeMul*=1.25],[1,'圣光范围','审判范围 +20%',()=>st.judgeR*=1.2],[2,'神圣审判','天赋技能：在敌人最密集处降下审判之光','pa_judge'],[2,'十字军','对首领伤害 +10%',()=>st.bossDmg*=1.1],[3,'连续审判','审判更频繁',()=>st.judgeEvery=Math.max(2,st.judgeEvery-1)],[3,'狂热','攻击速度 +10%',()=>st.atkCd*=.9],[4,'惩戒之神','审判伤害 ×1.5，范围 +20%',()=>{st.judgeMul*=1.5;st.judgeR*=1.2;}]],'j'),
   ttTree('防护','#9fe8ff',[[0,'圣盾','获得 40 点可再生护盾',()=>{st.shieldMax+=40;pl.shield=Math.max(pl.shield,st.shieldMax);}],[0,'坚甲','受到伤害 -6%',()=>st.dmgTaken*=.94],[1,'强韧','最大生命 +10%',ttHP(1.1)],[1,'复原','护盾恢复更快',()=>st.shieldRegen*=1.5],[2,'圣盾术','天赋技能：获得相当于 40% 生命的护盾','pa_shield'],[2,'荆棘','受击时反伤周围敌人',()=>st.thorns=true],[3,'壁垒','护盾 +50',()=>{st.shieldMax+=50;pl.shield=Math.max(pl.shield,st.shieldMax);}],[3,'不灭','受到伤害 -8%',()=>st.dmgTaken*=.92],[4,'守护者','最大生命 +15%，受到伤害 -10%',()=>{ttHP(1.15)();st.dmgTaken*=.9;}]],'x'),
   ttTree('神圣','#fff3a0',[[0,'圣光','吸血 +3%',()=>st.vamp+=.03],[0,'祝福','每秒回复 0.6% 生命',()=>st.regen+=.006],[1,'审判治愈','审判命中回复生命',()=>st.judgeHeal+=.02],[1,'信仰','最大生命 +8%',ttHP(1.08)],[2,'神圣新星','天赋技能：爆发圣光伤害身边敌人，每命中一个回复生命','pa_nova'],[2,'虔诚','技能冷却 -10%',()=>st.skillCd*=.9],[3,'圣疗','吸血 +4%',()=>st.vamp+=.04],[3,'光明','技能伤害 +20%',()=>st.skillMul*=1.2],[4,'圣光化身','吸血 +5%，每秒回复 1% 生命',()=>{st.vamp+=.05;st.regen+=.01;}]],'h')]};
// 天赋技能定义：type 决定释放方式，eff 决定附加效果
const TSK={missiles:{type:'volley',cd:7,n:5,gap:.14,mul:1.1,col:'#d2a8ff',fx:'lightning'},flamestrike:{type:'strike',cd:9,r:36,mul:3.5,eff:'burn',col:'#ff8a3a'},frostnova:{type:'nova',cd:8,r:55,mul:1.8,eff:'freeze',col:'#9fe8ff',fx:'frostCircle'},
  sw_line:{type:'line',cd:8,len:150,w:10,mul:3.2,eff:'knock',col:'#8fd7ff'},sw_rain:{type:'strike',cd:9,r:40,mul:3,col:'#c8a8ff'},sw_blink:{type:'blink',cd:8,mul:4,col:'#ff9a6a'},
  br_quake:{type:'nova',cd:8,r:60,mul:2.2,eff:'stun',col:'#ffb070',fx:'quake'},br_rage:{type:'rage',cd:14,t:6,heal:.15,col:'#ff6a6a'},br_flurry:{type:'volley',cd:7,n:6,gap:.12,mul:.9,rng:70,col:'#ffd35a',fx:'punch'},
  en_mine:{type:'strike',cd:9,r:40,mul:3,eff:'knock',col:'#9fe8a0'},en_shot:{type:'volley',cd:7,n:8,gap:.06,mul:.7,col:'#ffd35a',fx:'spark'},en_emp:{type:'nova',cd:9,r:60,mul:1.6,eff:'stun',col:'#7fe6ff',fx:'lightning'},
  ar_line:{type:'line',cd:8,len:180,w:8,mul:3,col:'#9fe8a0'},ar_pack:{type:'volley',cd:8,n:6,gap:.12,mul:1,eff:'vamp',col:'#ffb070',fx:'slash'},ar_poison:{type:'strike',cd:9,r:40,mul:1.5,eff:'poison',col:'#9fff6a'},
  as_blink:{type:'blink',cd:7,mul:3.5,col:'#b48cff'},as_rage:{type:'rage',cd:14,t:6,heal:.1,col:'#ff6a6a'},as_poison:{type:'nova',cd:8,r:45,mul:1.5,eff:'poison',col:'#9fff6a',fx:'xslash'},
  nj_sub:{type:'guard',cd:14,shield:.25,haste:3,col:'#b48cff'},nj_storm:{type:'volley',cd:7,n:8,gap:.08,mul:.7,col:'#c8c0ff',fx:'spark'},nj_thunder:{type:'strike',cd:9,r:36,mul:3,eff:'stun',col:'#7fe6ff'},
  bd_song:{type:'haste',cd:14,t:6,heal:.1,col:'#ffd35a'},bd_choir:{type:'volley',cd:8,n:6,gap:.12,mul:1,col:'#c8a8ff',fx:'spark'},bd_guard:{type:'guard',cd:14,shield:.3,heal:.1,col:'#9fe8ff'},
  pa_judge:{type:'strike',cd:9,r:40,mul:3.2,col:'#ffd35a'},pa_shield:{type:'guard',cd:15,shield:.4,col:'#9fe8ff'},pa_nova:{type:'nova',cd:8,r:55,mul:1.6,eff:'vamp',col:'#fff3a0',fx:'holy'}};
const TT_MAX=14,ttOf=c=>TT[c]||null,ttMine=c=>(PROG.tt=PROG.tt||{})[c]=(PROG.tt[c]||{});
const ttSpent=(c,tree)=>{const m=ttMine(c),T=ttOf(c);if(!T)return 0;return(tree===undefined?T:[T[tree]]).reduce((a,tr)=>a+tr.nodes.filter(n=>m[n.id]).length,0);};
const ttUnlocked=()=>(PROG.clr||{})[0]!==undefined||PROG.un>LV.findIndex(v=>v&&v.ri===0&&v.last);   // 第一章（新手教程）通关后开放全部天赋树
const ttPts=c=>ttUnlocked()?Math.min(TT_MAX,Math.floor(PROG.acc.lv/2))-ttSpent(c):0;
const ttOpen=(c,tree,n)=>ttSpent(c,tree)>=n.t*2;
function ttLearn(c,tree,id){const T=ttOf(c),n=T&&T[tree].nodes.find(x=>x.id===id),m=ttMine(c);if(!n||m[id])return;
  if(!ttUnlocked())return toast('通关第一章后开放天赋树');if(ttPts(c)<1)return toast('天赋点不足（账号每 2 级 1 点）');if(!ttOpen(c,tree,n))return toast(`该系再投入 ${n.t*2-ttSpent(c,tree)} 点才能解锁这一层`);
  m[id]=1;if(n.sk&&!(PROG.tsk||{})[c])(PROG.tsk=PROG.tsk||{})[c]=n.sk;saveProg();}
function ttReset(c){PROG.tt[c]={};if(PROG.tsk)delete PROG.tsk[c];saveProg();}
const ttSkill=c=>{const s=(PROG.tsk||{})[c],T=ttOf(c);if(!s||!T)return null;for(const tr of T)for(const n of tr.nodes)if(n.sk===s&&ttMine(c)[n.id])return n;return null;};
const talR=()=>0;   // 旧的通用天赋已并入各职业天赋树（用户决定），金币 / 商店 / 开局卡 / 免广告复活的加成随之取消
function talentApply(){{const T=ttOf(G.cls),m=ttMine(G.cls);if(T)for(const tr of T)for(const n of tr.nodes)if(m[n.id]&&n.f)n.f();G.tsk=ttSkill(G.cls);}
  const m=(PROG.mast||{})[G.cls]||0;if(m>=1)st.atkMul*=1.05;if(m>=6)pl.maxHp=Math.round(pl.maxHp*1.1);}

// ---------- 职业解锁与精通 ----------
const CLS_BASE=['sword','mage','archer'];
const CLS_GATE={brawler:0,assassin:0,eng:1,ninja:2,bard:2,paladin:3};   // 通关第几章（0 起）解锁
const clsOpen=id=>!!CLS[id];   // 9 个职业默认全开（用户要求）；CLS_BASE / CLS_GATE 暂不使用
const clsGateTxt=id=>`通关「${RAIDS[CLS_GATE[id]]?RAIDS[CLS_GATE[id]].name:'?'}」解锁，或 6 徽记`;
const mastTxt=m=>m>=6?'精通 III：伤害 +5%、开局多一张银卡、生命 +10%':m>=3?'精通 II：伤害 +5%、开局多一张银卡':m>=1?'精通 I：伤害 +5%':'通关任意一章获得精通';

// ---------- 局外货币 ----------
function gainMarks(n,why){PROG.marks=(PROG.marks||0)+n;if(why)toast(`${why}：徽记 +${n}`);}
function gainDust(n){PROG.dust=(PROG.dust||0)+n;}

// ---------- 装备强化 / 重铸 / 分解 ----------
const upCost=it=>((it.up||0)+1)*5*it.rar;
function enhanceItem(it){if((it.up||0)>=10)return toast('已强化到 +10');const c=upCost(it);if((PROG.dust||0)<c)return toast(`尘不足（需要 ${c}）`);PROG.dust-=c;it.up=(it.up||0)+1;taskAdd('enhance',1);saveProg();achCheck();}
function rerollItem(it){const c=20;if((PROG.dust||0)<c)return toast(`尘不足（需要 ${c}）`);PROG.dust-=c;const fresh=makeItem(it.ri);fresh.slot=it.slot;
  const st0=it.slot==='wpn'?'atk':it.slot==='trk'?null:'hp',keep=st0&&it.st[st0];it.st={};if(keep)it.st[st0]=keep;else if(it.slot==='trk'){const k=['crit','skill','cdr'][(Math.random()*3)|0];it.st[k]=+(0.04*RAR[it.rar][2]*(1+.25*it.ri)).toFixed(3);}
  const k2=['atk','hp','crit','spd','skill'][(Math.random()*5)|0];it.st[k2]=+((it.st[k2]||0)+0.025*RAR[it.rar][2]*(1+.25*it.ri)).toFixed(3);saveProg();}
function salvageItem(it){gainDust(it.rar*5+(it.up||0)*2);if(PROG.eq[it.slot]===it.id)delete PROG.eq[it.slot];PROG.inv=PROG.inv.filter(q=>q!==it);saveProg();}
// 每个部位“更好”的判断：装等 → 强化 → 品质
const itScore=it=>it.il+(it.up||0)*2+it.rar;
function bestPerSlot(){const b={};for(const it of PROG.inv){const c=b[it.slot];if(!c||itScore(it)>itScore(c))b[it.slot]=it;}return b;}
const isUpgrade=it=>{const cur=PROG.inv.find(x=>x.id===PROG.eq[it.slot]);return !cur||itScore(it)>itScore(cur);};

// ---------- 卡池解锁（棱彩海克斯默认锁定，用徽记解锁） ----------
// 大厅里没有 G：按指定职业判断海克斯是否属于它（同 game.html 的 fits）
const fitsFor=(h,c)=>(!h.cls||h.cls===c)&&(h.tag==='通用'?(h.role==='all'||h.role.includes(CLS[c].role)):CLS[c].specs.includes(h.tag))&&(!h.only||h.only===(AT[CLS[c].atk].melee?'melee':'ranged'));
const hexOpen=h=>h.tier<3||(PROG.hexUnl||[]).includes(h.id);
function unlockHex(id){if((PROG.marks||0)<2)return toast('徽记不足（需要 2）');PROG.marks-=2;(PROG.hexUnl=PROG.hexUnl||[]).push(id);saveProg();toast('已加入卡池');}

// ---------- 海克斯：升星 / 重放（删卡、读存档用） ----------
const hexById=id=>HEX.find(h=>h.id===id);
// 能否升星：在临时属性上试用一次，有数值变化才算（纯开关类效果升星没意义）
function hexStackable(h){if(h._stk!==undefined)return h._stk;const s0=st,snap=JSON.stringify(st),mh=pl.maxHp,hp=pl.hp,sh=pl.shield;let ok=false;
  try{st=JSON.parse(snap);h.a();const a=JSON.parse(snap);for(const k in st)if(typeof st[k]==='number'&&st[k]!==a[k]){ok=true;break;}if(pl.maxHp!==mh)ok=true;}catch(e){ok=false;}
  st=s0;pl.maxHp=mh;pl.hp=hp;pl.shield=sh;return h._stk=ok;}
// 拿一张海克斯（新卡或升星）；quiet=重放时不弹提示
function applyHex(h,quiet){const up=G.owned.has(h.id);h.a();(G.order=G.order||[]).push(h.id);G.stars=G.stars||{};
  if(up){G.stars[h.id]=(G.stars[h.id]||1)+1;if(!quiet)toast(`${h.n} 升到 ★${G.stars[h.id]}`);return;}
  G.owned.add(h.id);G.stars[h.id]=1;const c=G.tags[h.tag]=(G.tags[h.tag]||0)+1,s=(SETS[h.tag]||{})[c];
  if(s){s[1]();if(!quiet)toast(`流派激活 · ${tn(h.tag)} ${c} 件：${s[0]}`);}}
// 可以升星的已有海克斯
const upgradable=()=>[...(G.owned||[])].map(hexById).filter(h=>h&&hexStackable(h)&&(G.stars[h.id]||1)<3);
// 按拿卡顺序重放构筑（删掉某张卡 / 从存档点继续）
function rebuildBuild(dropId,order){const ord=(order||G.order||[]).filter(id=>id!==dropId),hpR=pl.maxHp?pl.hp/pl.maxHp:1,pq=G.pickQ.slice(),rer=G.rer;
  resetBuild();G.pickQ=pq;G.rer=rer;G.order=[];G.stars={};for(const id of ord){const h=hexById(id);if(h)applyHex(h,true);}applyMods();$('hexN').textContent=G.owned.size;
  pl.hp=Math.max(1,Math.round(pl.maxHp*hpR));}
// 本局事件带来的修正（血量上限、受到伤害），重放后再套一次
function applyMods(){const M=G.mods||{};if(M.hp&&M.hp!==1)pl.maxHp=Math.round(pl.maxHp*M.hp);if(M.taken&&M.taken!==1)st.dmgTaken*=M.taken;pl.hp=Math.min(pl.hp,pl.maxHp);}

// ---------- 局内金币 ----------
function gainGold(n){if(!G)return;const k=(1+.15*talR('gold'))*(G.daily&&G.daily.affix.gold||1);G.gold=(G.gold||0)+Math.round(n*k);}

// ---------- 路线选择（清完房间后选下一间） ----------
const ROUTE={battle:['battle','战斗','普通战斗，清完选海克斯'],elite:['elite','精英','更难，必出金卡 / 棱彩卡，金币更多'],shop:['shop','商店','用金币买卡、升星、删卡'],event:['event','事件','有代价的强力选择'],rest:['rest','休息','回血或恢复血量上限']};
function routeOptions(){const pool=['elite','shop','event','rest'],o=['battle'];if(G.daily&&G.daily.affix.elite)o.push('elite');
  while(o.length<3){const k=pool[(rand()*pool.length)|0];if(!o.includes(k))o.push(k);}return o;}
function openRoute(next){const o=routeOptions();G.route=G.route||{};
  if(window.SIM){G.route[next]=o[(rand()*o.length)|0];return;}
  G.state='route';loopUI(`<div class="hname" style="font-size:15px">选择下一个房间</div>${o.map(k=>`<button class="b ghost lp" data-r="${k}">${icon(ROUTE[k][0],"lg")}<b>${ROUTE[k][1]}</b><br><small>${ROUTE[k][2]}</small></button>`).join('')}`,
    e=>{const r=e.target.closest('[data-r]');if(!r)return;G.route[next]=r.dataset.r;loopClose();});}

// 进入非战斗房间：商店 / 事件 / 休息
function enterCalm(kind){if(kind==='shop')openShop();else if(kind==='event')openEvent();else openRest();}
function calmDone(){G.calmDone=true;loopClose();}

// ---------- 商店 ----------
const price=t=>Math.round([0,30,55,90][t]*(1-.1*talR('shop')));
function shopCards(){const ex=[],cards=[];for(let i=0;i<3;i++){const t=rand()<.15?3:rand()<.45?2:1;const c=pickW(avail(t,ex),1)[0]||pickW([1,2,3].flatMap(q=>avail(q,ex)),1)[0];if(c){cards.push(c);ex.push(c.id);}}return cards;}
function openShop(){G.shop={cards:shopCards(),ref:15,sold:{}};
  if(window.SIM){const c=G.shop.cards.find(h=>price(h.tier)<=(G.gold||0));if(c){G.gold-=price(c.tier);applyHex(c,true);}G.calmDone=true;return;}
  G.state='shop';renderShop();}
function renderShop(){const S=G.shop,ups=upgradable();
  loopUI(`<div class="hname" style="font-size:15px">商店　<span style="color:#ffd77a">金币 ${G.gold||0}</span></div>
    ${S.cards.map((h,i)=>`<button class="b ghost lp" data-buy="${i}"${S.sold[i]?' disabled':''}><b class="tag ${TIER[h.tier][1]}">${TIER[h.tier][0]}</b> ${h.n}　<span style="color:#ffd77a">${S.sold[i]?'已购':price(h.tier)+' 金'}</span><br><small>${h.d}</small></button>`).join('')}
    ${ups.length?`<button class="b ghost lp" data-act="up">随机升星一张已有海克斯　<span style="color:#ffd77a">50 金</span></button>`:''}
    <button class="b ghost lp" data-act="ref">刷新商品　<span style="color:#ffd77a">${S.ref} 金</span></button>
    ${G.adRef?'':'<button class="b ghost lp" data-act="adref">看广告免费刷新（每局一次）</button>'}
    <button class="b ghost lp" data-act="del">删除一张海克斯　<span style="color:#ffd77a">30 金</span></button>
    <button class="b" data-act="leave">离开</button>`,
  e=>{const b=e.target.closest('[data-buy],[data-act]');if(!b||b.disabled)return;const S=G.shop;
    if(b.dataset.buy!==undefined){const i=+b.dataset.buy,h=S.cards[i],p=price(h.tier);if((G.gold||0)<p)return toast('金币不足');G.gold-=p;S.sold[i]=1;applyHex(h);$('hexN').textContent=G.owned.size;return renderShop();}
    const a=b.dataset.act;
    if(a==='up'){if((G.gold||0)<50)return toast('金币不足');const u=upgradable();if(!u.length)return;G.gold-=50;applyHex(u[(rand()*u.length)|0]);return renderShop();}
    if(a==='ref'){if((G.gold||0)<S.ref)return toast('金币不足');G.gold-=S.ref;S.ref+=5;S.cards=shopCards();S.sold={};return renderShop();}
    if(a==='adref'){showAd(()=>{G.adRef=1;S.cards=shopCards();S.sold={};renderShop();});return;}
    if(a==='del'){if((G.gold||0)<30)return toast('金币不足');return renderDel();}
    if(a==='leave')calmDone();});}
function renderDel(){const list=[...G.owned].map(hexById).filter(Boolean);
  loopUI(`<div class="hname" style="font-size:15px">删除哪一张？（30 金）</div>${list.map(h=>`<button class="b ghost lp" data-del="${h.id}">${h.n}${(G.stars[h.id]||1)>1?' ★'+G.stars[h.id]:''}<br><small>${h.d}</small></button>`).join('')}<button class="b" data-act="back">返回</button>`,
    e=>{const b=e.target.closest('[data-del],[data-act]');if(!b)return;if(b.dataset.del){G.gold-=30;rebuildBuild(b.dataset.del);toast('已删除');}renderShop();});}

// ---------- 事件 ----------
const EVENTS=[
  {n:'血之祭坛',d:'古老的祭坛渴望生命。',opts:[['献祭：最大生命 -20%（本局），获得一次棱彩海克斯选择',()=>{loseMaxHp(.2);if(avail(3).length)G.pickQ.push(3);else{st.atkMul*=1.15;toast('棱彩海克斯未解锁，改为攻击 +15%');}}]]},
  {n:'贪婪的宝箱',d:'箱子上刻着诅咒。',opts:[['打开：受到伤害 +15%（本局），本章每个首领多掉 1 件装备',()=>{G.mods.taken=(G.mods.taken||1)*1.15;st.dmgTaken*=1.15;G.greed=(G.greed||0)+1;}]]},
  {n:'赌徒',d:'“把一半金币押上，我让你的力量更进一步。”',opts:[['下注：失去一半金币，随机升星一张已有海克斯',()=>{G.gold=Math.floor((G.gold||0)/2);const u=upgradable();if(u.length)applyHex(u[(rand()*u.length)|0]);else toast('没有可以升星的海克斯');}]]},
  {n:'神秘泉水',d:'泉水微微发光。',opts:[['饮用：回复 50% 生命',()=>{pl.hp=Math.min(pl.maxHp,pl.hp+pl.maxHp*.5);}],['装满水壶：获得 40 金币',()=>gainGold(40)]]},
];
function loseMaxHp(k){G.mods.hp=(G.mods.hp||1)*(1-k);const a=Math.round(pl.maxHp*k);pl.maxHp-=a;pl.hp=Math.min(pl.hp,pl.maxHp);}
function openEvent(){const E=EVENTS[(rand()*EVENTS.length)|0];
  if(window.SIM){if(E.n==='神秘泉水')E.opts[0][1]();G.calmDone=true;return;}
  G.state='event';loopUI(`<div class="hname" style="font-size:15px">${E.n}</div><p style="text-align:center;color:#c8c0ff">${E.d}</p>${E.opts.map((o,i)=>`<button class="b ghost lp" data-o="${i}">${o[0]}</button>`).join('')}<button class="b" data-o="-1">离开</button>`,
    e=>{const b=e.target.closest('[data-o]');if(!b)return;const i=+b.dataset.o;if(i>=0)E.opts[i][1]();calmDone();});}

// ---------- 休息 ----------
function openRest(){const lost=1-(G.mods.hp||1);
  if(window.SIM){pl.hp=Math.min(pl.maxHp,pl.hp+pl.maxHp*.3);G.calmDone=true;return;}
  G.state='rest';loopUI(`<div class="hname" style="font-size:15px">营火</div><button class="b ghost lp" data-o="heal">休息：回复 30% 生命</button>
    <button class="b ghost lp" data-o="max"${lost>0?'':' disabled'}>疗伤：恢复 10% 已失去的血量上限${lost>0?'':'（没有损失）'}</button>`,
    e=>{const b=e.target.closest('[data-o]');if(!b||b.disabled)return;
      if(b.dataset.o==='heal')pl.hp=Math.min(pl.maxHp,pl.hp+pl.maxHp*.3);
      else{const old=G.mods.hp||1;G.mods.hp=Math.min(1,old+.1);pl.maxHp=Math.round(pl.maxHp*G.mods.hp/old);}
      calmDone();});}

// ---------- 通用弹窗 ----------
function loopUI(html,onClick){const M=$('loopM');M.innerHTML=html;M.onclick=onClick;$('loopV').classList.add('on');}
function loopClose(){$('loopV').classList.remove('on');if(G&&['route','shop','event','rest'].includes(G.state))G.state='play';}

// ---------- 章中存档点 ----------
function checkpointAfter(L){const v=LV[L],n=RAIDS[v.ri].bosses.length;if(n<6||G.daily)return;
  if(v.k+1===Math.floor(n/2)&&!v.last){PROG.run={ri:v.ri,L:L+1,cls:G.cls,diff:G.diff,order:(G.order||[]).slice(),mods:Object.assign({},G.mods),gold:G.gold||0,tankN:G.tankN||0};saveProg();toast('到达存档点：之后阵亡可以从这里继续');}}
// 从存档点继续：reset 里调用（在 newLevel 发开局海克斯之前）
let RESUME=null;
function resumeApply(){const R=RESUME;if(!R)return;G.runHex=1;G.diff=R.diff;G.mods=Object.assign({hp:1,taken:1},R.mods);G.gold=R.gold;G.tankN=R.tankN;rebuildBuild(null,R.order);pl.hp=pl.maxHp;RESUME=null;}
function startResume(){const R=PROG.run;if(!R)return;RESUME=R;selCls=R.cls;selLevel=R.L;selDiff=R.diff||0;enterLevel();}

// ---------- 首领图鉴 ----------
function bossSkillList(d){return (d.sk||[]).filter((k,i,a)=>a.indexOf(k)===i).map(k=>(d.skills&&d.skills[k]&&d.skills[k].say)||SKN[k]||k);}
// ---------- 首领攻略（局外图鉴）：按技能数据逐条生成“会发生什么 / 该怎么做” ----------
const G_DMG=d=>d>=2.5?'<b style="color:#ff6a6a">致命</b>':d>=1.4?'<b style="color:#ff9a4a">高伤害</b>':d>0?'中等伤害':'无伤害';
const G_EFF={stun:'并眩晕你',knock:'并把你击退',slow:'并减速你',dot:'并附加持续伤害',silence:'并封住你的技能',fear:'并让你恐惧乱跑',freeze:'并冻住你',blind:'并让你伤害减半（致盲）',dispel:'并驱散你身上的增益'};
const G_AT={boss:'以首领为中心',player:'在你脚下',random:'在场地随机位置',fixed:'在场地固定区域'};
const G_BUILTIN={shadowflame:['首领朝你喷出一道大扇形暗影烈焰','看到首领转身蓄力就绕到它侧面或身后'],erupt:['地面随机喷发熔岩柱','留意地面发光的裂缝，别站在上面'],charge:['首领锁定你的方向后直线冲锋','看到它停顿瞄准，立刻横向走开'],
  roar:['全场咆哮，让你恐惧乱跑几秒','恐惧前保持血量健康，别站在危险区附近'],wrath:['首领以自身为中心击退并重击','别贴着首领站，远程在外圈输出'],volley:['向四周发射一圈弹幕','从弹幕之间的空隙侧向穿过去'],
  slam:['首领重砸地面，周围大范围伤害','看到举手蓄力就跑出近身范围'],blink:['首领瞬移到你身边','它会突然贴脸，提前留好位移和大招'],adrenaline:['让你中毒，几秒后对周围造成大伤害','中招后立刻远离小怪和危险区，等爆炸结束'],
  fireCone:['首领朝你喷火，扇形范围','绕到首领侧后方'],affliction:['给你叠加各色减益（减速、持续伤害等）','注意血量，减益多时先拉开距离'],whelps:['召唤一群雏龙','用范围技能清掉，别让它们围住你'],
  ring:['首领周围出现一圈伤害环','站在环内贴近首领，或者站到环外很远处'],frostCone:['首领朝你喷出冰霜扇形','绕到侧后方，被冻住会很危险'],acidCone:['首领朝你喷出酸液扇形','绕到侧后方']};
function skillGuide(k,p){
  if(!p)return G_BUILTIN[k]||['首领的招牌技能','留意首领的蓄力动作和地上的红色预警'];
  const T=p.T?` ${(+p.T).toFixed(1)} 秒后`:'',D=G_DMG(p.dmg||0),E=G_EFF[p.eff]?'，'+G_EFF[p.eff]:'';
  switch(p.e){
    case'tel':{const at=G_AT[p.at]||'',n=p.n>1?` ${p.n} 个`:'';
      if((p.t||'circle')==='circle')return[`${at}出现${n}红色圆圈（半径约 ${p.r||40}），${T}爆炸，${D}${E}`,p.at==='boss'?'看到红圈立刻跑出首领身边，等爆炸后再回来输出':p.at==='player'?'脚下出现红圈马上移动，别站着不动':'找红圈之间的空地站'];
      if(p.t==='cone')return[`首领向你的方向张开扇形预警，${T}喷发，${D}${E}`,'绕到首领侧面或身后，别站在它正面'];
      if(p.t==='beam')return[`首领射出一道长光束，${T}命中，${D}${E}`,'光束沿直线打，横向侧移出去'];
      return[`${at}出现长方形预警区，${T}生效，${D}${E}`,'从预警区横向走出去'];}
    case'special':{const n=p.name;
      if(n==='hitTel')return[`${G_AT[p.at]||''}出现${p.t==='rect'?'大片长方形':'圆形'}预警，${T}生效${E}${p.dmg?'，'+D:''}`,p.eff==='slow'?'被减速后很难躲后续技能，提前走出预警区':'走出预警区'];
      if(n==='classCall')return['每隔一段时间点名一个职业，给该职业加一个惩罚','被点到时注意血量，别贪输出'];
      if(n==='vanish')return['首领隐身消失几秒，随后出现在你身边重击','它消失后不停走动，别站在原地'];
      if(n==='channelBeam')return['首领持续引导一道光束追着你','绕着它跑，别被光束连续打中'];
      if(n==='leech'||n==='siphon')return['首领吸取你的生命来回血','尽快打断或打出爆发，别让它回满'];
      if(n==='randomBreath')return['首领随机切换不同属性的吐息','看吐息颜色预判，绕到侧后方'];
      if(n==='fixate')return['首领锁定追击你','边跑边打，别让它贴脸'];
      if(n==='dot'||n==='touchDot')return['给你附加持续伤害','注意血量，必要时先拉开距离回血'];
      if(n==='airborne')return['首领飞到空中一段时间，期间无法被近身攻击','躲开空中落下的攻击，等它落地再输出'];
      if(n==='pads')return['场地上出现机关地块','按地块效果走位：伤害块别踩，增益块去踩'];
      if(n==='aspectCycle')return['首领循环切换几种形态，每种形态技能不同','看它的颜色/形态切换应对'];
      if(n==='auraStacks')return['靠近首领会叠加伤害层数','别一直贴身，层数高了先拉开'];
      if(n==='essenceOfRed')return['战斗中会获得强大的增益','趁增益期间全力输出'];
      return['特殊机制','留意首领身边的变化'];}
    case'curse':return[p.kind==='delayed'?`给你挂上诅咒，${p.t||6} 秒后爆发，${D}`:p.kind==='cd'?`诅咒你 ${p.t||6} 秒，技能冷却变慢`:`给你挂上诅咒 ${p.t||6} 秒`,p.kind==='delayed'?'爆发前回满血，或留好护盾和减伤':'诅咒期间少用技能，先走位'];
    case'frenzy':return[`首领狂乱 ${p.perm?'直到战斗结束':(p.t||8)+' 秒'}，攻击和移动更快`,'狂乱期间拉开距离风筝，留好大招'];
    case'followAura':return[`首领身边出现跟着它走的灼烧光环（半径约 ${p.r||40}），持续 ${p.t||6} 秒`,'光环期间远离首领，远程输出'];
    case'bossShield':return[`首领获得 ${p.kind==='reflect'?'魔法反射':p.kind==='immune'?'无敌':`${Math.round((p.pct||.5)*100)}% 减伤`}，持续 ${p.t||8} 秒`,p.kind==='reflect'?'反射期间停止技能输出，避免伤到自己':'这段时间先清小怪或走位，等护盾消失再爆发'];
    case'summon':return[`召唤 ${p.n||2} 个援军${p.at==='corners'?'（从场地四角出现）':''}`,'优先清掉援军，别让它们围住你'];
    case'shots':return[p.p==='volley'?'向四周发射一圈弹幕':p.p==='aimed'?'朝你发射追踪弹':'发射弹幕',p.p==='aimed'?'弹出手后侧向走位躲开':'从弹幕之间的空隙穿过'];
    case'castBar':return[`读条 ${p.T||2} 秒`+(p.then&&p.then.r>=100?`，读完后大范围爆炸（${G_DMG(p.then.dmg||0)}）`:''),p.need&&p.need<999?`读条期间连续攻击 ${p.need} 次打断它`:(p.selfDestruct?'无法打断：读条时跑到离它最远的角落，爆炸后首领会倒下':'无法打断：读条结束前跑出范围')];
    case'teleportPlayer':return['把你传送到场地另一处，落点留下毒池','落地后马上走出毒池'];
    case'healTarget':return[`读条治疗自己或队友（回复 ${Math.round((p.pct||.08)*100)}% 生命）`,`读条期间连续攻击 ${p.need||4} 次打断`];
    case'totem':return[p.effect==='healBoss'?'放下治疗图腾，持续给首领回血':p.effect==='mc'?'放下控制图腾，会心灵控制你':'放下图腾','优先打掉图腾，再回头打首领'];
    case'playerBomb':return[`你变成活体炸弹，${p.t||8} 秒后爆炸，身边每多一个敌人伤害更高`,'远离所有小怪，跑到空地等它爆炸'];
    case'stacks':return[`攻击会给你叠加易伤，最多 ${p.max||10} 层`,'层数高时拉开距离，等层数消退再打'];
    case'trail':return['首领走过的地方留下毒云',"别走首领刚走过的路，绕开地上的毒云"];
    case'gaze':return[`首领盯住你 ${p.t||2} 秒`,'凝视期间<b>不要移动</b>，一动就会受到重击'];
    case'mindControl':return[`心灵控制你 ${p.t||4} 秒`,'控制期间无法操作，控制前保持血量健康'];
    case'decimate':return[`对你造成当前生命 ${Math.round((p.p||.5)*100)}% 的伤害`,'不会直接打死你，之后马上回血'];
    case'energyBar':return['首领积攒能量，能量满时全场爆炸，能量越高伤害越大','趁能量涨满之前全力输出，或打掉给它充能的单位'];
    default:return[SKN[k]||k,'留意首领的蓄力动作和地上的红色预警'];}}
function bossGuide(b){const rows=[];const seen=new Set();
  for(const k of b.sk||[]){if(seen.has(k))continue;seen.add(k);const p=(b.skills||{})[k],[what,how]=skillGuide(k,p),name=(p&&p.say)||SKN[k]||k;
    rows.push(`<div class="gd"><b>${name}</b><div>${what}</div><div class="how">👉 ${how}</div></div>`);}
  for(const ph of b.ph||[]){const when=ph.at!==undefined?`血量降到 ${Math.round(ph.at*100)}% 时`:ph.every?`每 ${ph.every} 秒`:ph.t?`开战 ${ph.t} 秒时`:'战斗中',gs=ph.go&&(b.skills||{})[ph.go]?skillGuide(ph.go,b.skills[ph.go]):null;
    rows.push(`<div class="gd ph"><b>阶段：${ph.msg||'转阶段'}</b><div>${when}触发${ph.inv?'，首领进入无敌':''}${ph.adds?`，召唤「${ph.adds}」`:''}${ph.sk?`，换一套技能（${ph.sk.map(k=>((b.skills||{})[k]||{}).say||SKN[k]||k).join('、')}）`:''}${ph.dur?`，持续 ${ph.dur} 秒`:''}${gs?`；${gs[0]}`:''}</div>${gs?`<div class="how">👉 ${gs[1]}</div>`:ph.inv?`<div class="how">👉 无敌期间${ph.adds?'先清援军，':''}躲技能，${ph.end&&ph.end.adds?'清完援军后结束':'等它结束'}</div>`:''}</div>`);}
  for(const a of b.adds||[])rows.push(`<div class="gd add"><b>随从：${a.n}</b><div>${a.at==='start'?'开战时出现':'战斗中出现'}${a.count>1?` ${a.count} 个`:''}${a.link&&a.link.bossDmgTaken?'，随从活着时首领受到的伤害降低':''}</div><div class="how">👉 ${a.link?'先清随从再打首领':'能顺手清就清，别被它拖住'}</div></div>`);
  return rows.join('');}
function codexHTML(){const raw=window.RAID_DATA?RAID_DATA.raids:[];let h='';
  RAIDS.forEach((r,ri)=>{const d=raw.find(x=>x.id===r.id);if(!d)return;h+=`<div class="hname" style="font-size:13px;margin-top:8px">${r.name}　<small style="color:#ffd77a">套装：${GSET[[0,1,1,3,3][ri]??3].n}</small></div>`;
    d.bosses.forEach((b,k)=>{const L=firstL(ri)+k,kills=((PROG.codex||{})[b.n]||0),pt=bossPortrait(L);
      h+=`<details class="itip boss-gd"><summary style="display:flex;gap:6px;align-items:center"><div data-boss-portrait="${L}"${b.variants?' title="随机首领"':''} style="flex:0 0 40px;height:40px;display:grid;place-items:center;color:#e9c581;font-size:22px;border-radius:6px;background:#1a1430 center/cover${pt?` url(${pt})`:''}">${b.variants?'？':pt?'':icon('elite','lg')}</div><div style="flex:1;font-size:11px">
        <b>${b.n}</b>　<span style="color:#9a94c0">击杀 ${kills}${(PROG.fk||{})[L+':2']?' · 史诗已通':(PROG.fk||{})[L+':1']?' · 英雄已通':''}</span><br><span style="color:#c8c0ff">${b.tip||''}</span><br><small style="color:#ffd77a">点开看详细攻略 ▾</small></div></summary>
        <div class="gd-list">${bossGuide(b)}</div></details>`;});});
  return h;}

// ---------- 成就 ----------
const ACHS=[
  {id:'c1',n:'首战告捷',d:'通关任意一章',m:3,ok:P=>Object.keys(P.clr||{}).length>=1},
  {id:'mc',n:'熔火征服者',d:'通关熔火之心',m:3,ok:P=>(P.clr||{})[0]!==undefined},
  {id:'dr',n:'屠龙者',d:'通关奥妮克希亚的巢穴和黑翼之巢',m:5,ok:P=>(P.clr||{})[1]!==undefined&&(P.clr||{})[2]!==undefined},
  {id:'all5',n:'深渊行者',d:'通关全部 5 章',m:10,ok:P=>[0,1,2,3,4].every(i=>(P.clr||{})[i]!==undefined)},
  {id:'hero',n:'英雄',d:'通关任意一章的英雄难度',m:5,ok:P=>Object.values(P.clr||{}).some(t=>t>=1)},
  {id:'epic',n:'史诗',d:'通关任意一章的史诗难度',m:10,ok:P=>Object.values(P.clr||{}).some(t=>t>=2)},
  {id:'up5',n:'精工',d:'把一件装备强化到 +5',m:3,ok:P=>P.inv.some(i=>(i.up||0)>=5)},
  {id:'up10',n:'神匠',d:'把一件装备强化到 +10',m:8,ok:P=>P.inv.some(i=>(i.up||0)>=10)},
  {id:'set4',n:'整装待发',d:'穿齐一套 4 件套装',m:5,ok:P=>{const c={};for(const id of Object.values(P.eq)){const it=P.inv.find(x=>x.id===id);if(it&&it.set!==null)c[it.set]=(c[it.set]||0)+1;}return Object.values(c).some(n=>n>=4);}},
  {id:'cls6',n:'多面手',d:'解锁 6 个职业',m:3,ok:P=>(P.clsUnl||[]).length>=6},
  {id:'cls9',n:'全能',d:'解锁全部职业',m:8,ok:P=>(P.clsUnl||[]).length>=9},
  {id:'daily',n:'日常',d:'完成一次每日挑战',m:3,ok:P=>!!(P.dailyDone||0)},
  {id:'codex20',n:'图鉴学者',d:'击杀 20 种不同的首领',m:5,ok:P=>Object.keys(P.codex||{}).length>=20},
  {id:'tal10',n:'天赋觉醒',d:'投入 10 点天赋',m:3,ok:P=>Object.values(P.talent||{}).reduce((a,b)=>a+b,0)>=10},
];
function achCheck(){if(window.SIM)return;PROG.ach=PROG.ach||{};for(const a of ACHS)if(!PROG.ach[a.id]&&a.ok(PROG)){PROG.ach[a.id]=1;gainMarks(a.m,`成就「${a.n}」`);}saveProg();}
const achHTML=()=>ACHS.map(a=>`<div class="itip" style="margin:3px 0;font-size:11px;opacity:${(PROG.ach||{})[a.id]?1:.55}">${(PROG.ach||{})[a.id]?'✅':'⬜'} <b>${a.n}</b>　${a.d}　<span style="color:#ffd77a">徽记 +${a.m}</span></div>`).join('');

// ---------- 每日：首杀宝箱 + 每日挑战 ----------
const today=()=>{const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();};
function dailyState(){const t=today();if(!PROG.daily||PROG.daily.date!==t)PROG.daily={date:t,kills:{},done:false,best:null};return PROG.daily;}
const AFFIX=[{n:'强敌',d:'敌人血量 +40%',hp:1.4},{n:'狂暴',d:'敌人伤害 +30%',dmg:1.3},{n:'富足',d:'金币翻倍',gold:2},{n:'精英横行',d:'每次选路都有精英房',elite:true}];
function dailyInfo(){const s=today(),open=RAIDS.map((r,i)=>i).filter(i=>firstL(i)<=PROG.un);return{seed:s,ri:open[s%open.length]||0,affix:AFFIX[s%AFFIX.length]};}
// 可复现的随机数（每日挑战全服同一套随机）
function seeded(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
let DAILY_GO=null,AUTO_GO=false;
function startDaily(){const D=dailyInfo();DAILY_GO=D;PROG.run=null;selLevel=firstL(D.ri);selDiff=0;enterLevel();}
// 每个首领每天第一次击杀：尘 + 徽记，结算时可看广告翻倍
function dailyChest(name,ri){if(window.SIM)return;const D=dailyState();if(D.kills[name])return;D.kills[name]=1;G.chest=G.chest||{dust:0,marks:0};G.chest.dust+=10+5*ri;G.chest.marks+=1;saveProg();}
function chestHTML(){const c=G.chest;if(!c||!(c.dust||c.marks))return '';return `<div class="itip" style="text-align:center">每日首杀宝箱：尘 +${c.dust}　徽记 +${c.marks}<br><button class="b ghost sm" id="chestAd">看广告翻倍</button></div>`;}
function chestClaim(dbl){const c=G.chest;if(!c)return;const k=dbl?2:1;gainDust(c.dust*k);PROG.marks=(PROG.marks||0)+c.marks*k;G.chest=null;saveProg();}

// ---------- 局外初始化 / 老存档迁移 ----------
function progInit(){PROG.dust=PROG.dust||0;PROG.marks=PROG.marks??0;PROG.talent=PROG.talent||{};PROG.hexUnl=PROG.hexUnl||[];PROG.diff=PROG.diff||{};PROG.clr=PROG.clr||{};
  PROG.mast=PROG.mast||{};PROG.codex=PROG.codex||{};PROG.fk=PROG.fk||{};PROG.ach=PROG.ach||{};
  if(!PROG.clsUnl){const played=Object.values(PROG.best||{}).length>0;PROG.clsUnl=played?CLS_IDS.slice():CLS_BASE.slice();   // 老玩家已经玩过：职业全开
    if(played&&!PROG.migr){PROG.marks+=2*Object.keys(PROG.best||{}).length;PROG.migr=1;}}
  if(!clsOpen(selCls))selCls=PROG.clsUnl[0];}
// 章节通关：解锁下一档难度、徽记、精通、职业解锁、清存档点、成就
function onChapterWin(){const ri=LV[G.L].ri,t=G.diff||0;
  if(G.daily){const D=dailyState(),tm=(G.rt||G.t)|0;if(!D.done){D.done=true;taskAdd('daily',1);PROG.dailyDone=(PROG.dailyDone||0)+1;gainMarks(5,'每日挑战完成');gainDust(50);}D.best=D.best?Math.min(D.best,tm):tm;}
  PROG.clr[ri]=Math.max(PROG.clr[ri]??-1,t);if((PROG.diff[ri]||0)===t&&t<2){PROG.diff[ri]=t+1;toast(`解锁${DIFF_T[t+1].n}难度！`);}
  gainMarks(DIFF_T[t].marks,`${RAIDS[ri].name} ${DIFF_T[t].n}通关`);PROG.mast[G.cls]=(PROG.mast[G.cls]||0)+1;
  for(const[id,g]of Object.entries(CLS_GATE))if(g===ri&&!clsOpen(id)){PROG.clsUnl.push(id);toast(`解锁新职业：${CLS[id].n}`);}
  PROG.run=null;saveProg();achCheck();}
// 首领击杀：图鉴计数、首杀徽记（每个难度一次）、每日首杀宝箱
function onBossKill(L){const d=LV[L].b,t=(G&&G.diff)||0;taskAdd('boss',1);PROG.codex[d.n]=(PROG.codex[d.n]||0)+1;
  const key=L+':'+t;if(!PROG.fk[key]){PROG.fk[key]=1;if(!window.SIM)gainMarks(1+t,`首杀 ${d.n}`);}dailyChest(d.n,LV[L].ri);}

// ---------- 无尽深渊：五章首尾相接一路往下打，每打通一轮敌人更强；海克斯一路保留；倒下时按层数结算（复活后再倒下只补新增层数） ----------
let ENDLESS_GO=false;
const endlessOpen=()=>(PROG.clr||{})[0]!==undefined||PROG.un>LV.findIndex(v=>v&&v.ri===0&&v.last);   // 通关第一章后开放（老存档没有 clr，按解锁进度判断）
function startEndless(){ENDLESS_GO=true;PROG.run=null;selLevel=firstL(0);selDiff=0;enterLevel();}
// 按层数指数涨（海克斯一路累积，线性加难度追不上构筑成长）
const EN_HP=1.07,EN_DMG=1.04;
const endlessMul=()=>{const E=G&&G.endless;return E?{hp:Math.pow(EN_HP,E.floor),dmg:Math.pow(EN_DMG,E.floor)}:{hp:1,dmg:1};};
function endlessNext(){const E=G.endless,v=LV[G.L];E.floor++;taskAdd('endless',0,E.floor);
  if(!v.last)return G.L+1;const nr=v.ri+1<Math.min(5,RAIDS.length)?v.ri+1:0;if(!nr){E.loop++;toast(`深渊第 ${E.loop+1} 轮`);}return firstL(nr);}
function endlessEnd(){const E=G.endless;if(!E)return '';const f=E.floor,pf=E.pf||0,P=PROG.endless=PROG.endless||{best:0};E.pf=f;
  const nb=f>P.best;if(nb){P.best=f;P.cls=G.cls;}const dust=(f-pf)*12,marks=Math.floor(f/5)-Math.floor(pf/5);gainDust(dust);if(marks>0)PROG.marks=(PROG.marks||0)+marks;saveProg();
  return `无尽深渊：到达第 ${f} 层${nb?'（新纪录！）':`（最高 ${P.best} 层）`}　尘 +${dust}${marks>0?`　徽记 +${marks}`:''}`;}

// ---------- 每日任务：每天 3 个（按日期固定），进度在对局里自动累计，选关页领取 ----------
const TASKS=[{k:'kills',n:'击败 {n} 个敌人',need:300},{k:'levels',n:'完成 {n} 个关卡',need:4},{k:'boss',n:'击败 {n} 个首领',need:3},{k:'elite',n:'击败 {n} 个精英',need:3},
  {k:'enhance',n:'强化装备 {n} 次',need:3},{k:'daily',n:'完成每日挑战',need:1},{k:'endless',n:'无尽深渊到达第 {n} 层',need:6}];
const taskDef=k=>TASKS.find(t=>t.k===k);
function taskState(){const t=today();if(!PROG.tasks||PROG.tasks.date!==t){const r=seeded(t*7+3),pool=TASKS.slice(),l=[];
    while(l.length<3){const i=(r()*pool.length)|0;l.push({k:pool[i].k,got:0,claimed:false});pool.splice(i,1);}PROG.tasks={date:t,list:l,bonus:false};}return PROG.tasks;}
function taskAdd(k,n,abs){if(window.SIM||typeof PROG==='undefined')return;for(const q of taskState().list)if(q.k===k)q.got=abs!==undefined?Math.max(q.got,abs):q.got+n;}
function tasksHTML(){const T=taskState();return `<div class="itip" style="margin:4px 0;font-size:11px"><b>今日任务</b>　<span style="color:#9a94c0">每个：尘 +60、徽记 +1；全部完成再 +2 徽记</span>${T.list.map((q,i)=>{const d=taskDef(q.k),ok=q.got>=d.need;
    return `<br>${d.n.replace('{n}',d.need)}　<span style="color:${ok?'#7dff8a':'#9a94c0'}">${Math.min(q.got,d.need)}/${d.need}</span>${q.claimed?' ✅':ok?` <button class="b sm" data-task="${i}">领取</button>`:''}`;}).join('')}
    ${T.list.every(q=>q.claimed)&&!T.bonus?'<br><button class="b sm" data-task="all">领取全勤奖励</button>':''}</div>`;}
function taskClaim(i){const T=taskState();if(i==='all'){if(T.list.every(q=>q.claimed)&&!T.bonus){T.bonus=true;gainMarks(2,'今日任务全部完成');}}
  else{const q=T.list[+i],d=q&&taskDef(q.k);if(q&&!q.claimed&&q.got>=d.need){q.claimed=true;gainDust(60);gainMarks(1,'任务完成');}}saveProg();}

// ---------- 专武升星：尘的长期去处；每星属性 +10%，3★ 对首领伤害 +10%，5★ 技能伤害 +15% ----------
const STAR_COST=[300,600,1000,1500,2200];
function exwStar(it){const s=it.star||0;if(s>=5)return toast('已满星');const c=STAR_COST[s];if((PROG.dust||0)<c)return toast(`尘不足（需要 ${c}）`);PROG.dust-=c;it.star=s+1;saveProg();toast(`${it.n} 升到 ${it.star}★`);}

// ---------- 新手教程（第一章）：手动操作分步提示，做到了才进下一步；第一章通关后不再出现 ----------
const TUT=[
  {t:'拖动<b>左半边屏幕</b>移动角色',done:S=>Math.hypot(pl.x-S.x0,pl.y-S.y0)>40},
  {t:'按住右下角<b>【普攻】</b>，打倒一个敌人',el:'atkB',done:S=>G.kills>S.k0},
  {t:'点<b>【技能】</b>释放技能',el:'skill',when:()=>G.skillT<=0&&nearest(pl.x,pl.y,110),done:S=>G.skillT>0},
  {t:'大招充满了！点<b>【大招】</b>',el:'ult',when:()=>G.ultT<=0,done:S=>G.ultT>0},
  {t:'首领战：<b style="color:#ff7a7a">红色区域</b>是首领的技能，及时躲开；<b style="color:#7fe6ff">蓝色虚线圈</b>是你自己的技能范围',when:()=>G.boss&&G.cfg&&G.cfg.type==='big',done:S=>G.t-S.t0>7},
  {t:'每个首领的详细攻略都在<b>【图鉴】</b>里，出发前可以先看',when:()=>G.bossDone,done:S=>G.t-S.t0>5}];
let TUTS=null;
function tutTick(){const el=$('tutT');if(!el||window.SIM)return;const i=PROG.tut||0,on=G&&G.state==='play'&&!G.auto&&!ttUnlocked()&&i<TUT.length;
  const T=on&&TUT[i];
  if(T&&TUTS&&TUTS.i===i&&T.done(TUTS)){PROG.tut=i+1;saveProg();TUTS=null;el.classList.remove('on');return;}   // 出现过的步骤，就算触发条件消失（如技能进冷却）也要判完成
  const show=T&&(!T.when||T.when());
  for(const id of['atkB','skill','ult'])$(id)&&$(id).classList.toggle('tut-glow',!!(show&&T.el===id));
  if(!show){el.classList.remove('on');return;}   // 大招特写等期间暂时隐藏，但记住这一步已经出现过
  if(!TUTS||TUTS.i!==i)TUTS={i,x0:pl.x,y0:pl.y,k0:G.kills,t0:G.t};
  if(el.dataset.i!==String(i)){el.innerHTML=`<small>新手教程 ${i+1}/${TUT.length}</small>${T.t}`;el.dataset.i=i;}el.classList.add('on');
}
