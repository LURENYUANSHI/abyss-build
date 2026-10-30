// 玩法闭环：难度阶梯、局外货币与消耗（强化 / 重铸 / 天赋 / 卡池解锁）、路线选择（战斗 / 精英 / 商店 / 事件 / 休息）、
// 海克斯升星、章中存档点、职业解锁与精通、首领图鉴、成就、每日挑战与每日首杀宝箱。
// 在 game.html 主脚本之前加载：这里只放定义，运行时才访问 PROG / G / st / pl 等全局。

// ---------- 难度阶梯 ----------
const DIFF_T=[{n:'普通',hp:1,dmg:1,il:0,rar:0,marks:3},{n:'英雄',hp:1.9,dmg:1.4,il:8,rar:.12,marks:5},{n:'史诗',hp:3.4,dmg:1.9,il:16,rar:.24,marks:8}];
let selDiff=0;
const diffOf=()=>DIFF_T[(G&&G.diff)||0];

// ---------- 天赋树（账号每升 1 级给 1 点） ----------
const TALENTS=[
  {id:'hp',n:'坚韧',d:'最大生命 +4%',max:5},
  {id:'atk',n:'锋锐',d:'伤害 +3%',max:5},
  {id:'crit',n:'致命',d:'暴击率 +2%',max:3},
  {id:'gold',n:'贪财',d:'局内金币 +15%',max:3},
  {id:'shop',n:'讨价还价',d:'商店价格 -10%',max:3},
  {id:'card',n:'预备构筑',d:'每章开局多选一次银卡',max:1},
  {id:'rev',n:'再起',d:'每局一次免广告复活',max:1},
];
const talR=id=>((PROG.talent||{})[id]||0);
const talSpent=()=>Object.values(PROG.talent||{}).reduce((a,b)=>a+b,0);
const talPts=()=>Math.max(0,PROG.acc.lv-1-talSpent());
function talentApply(){st.atkMul*=1+.03*talR('atk');st.crit+=.02*talR('crit');pl.maxHp=Math.round(pl.maxHp*(1+.04*talR('hp')));
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
const ROUTE={battle:['⚔','战斗','普通战斗，清完选海克斯'],elite:['☠','精英','更难，必出金卡 / 棱彩卡，金币更多'],shop:['$','商店','用金币买卡、升星、删卡'],event:['?','事件','有代价的强力选择'],rest:['☕','休息','回血或恢复血量上限']};
function routeOptions(){const pool=['elite','shop','event','rest'],o=['battle'];if(G.daily&&G.daily.affix.elite)o.push('elite');
  while(o.length<3){const k=pool[(rand()*pool.length)|0];if(!o.includes(k))o.push(k);}return o;}
function openRoute(next){const o=routeOptions();G.route=G.route||{};
  if(window.SIM){G.route[next]=o[(rand()*o.length)|0];return;}
  G.state='route';loopUI(`<div class="hname" style="font-size:15px">选择下一个房间</div>${o.map(k=>`<button class="b ghost lp" data-r="${k}"><b style="font-size:16px">${ROUTE[k][0]}</b> ${ROUTE[k][1]}<br><small>${ROUTE[k][2]}</small></button>`).join('')}`,
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
function codexHTML(){const raw=window.RAID_DATA?RAID_DATA.raids:[];let h='';
  RAIDS.forEach((r,ri)=>{const d=raw.find(x=>x.id===r.id);if(!d)return;h+=`<div class="hname" style="font-size:13px;margin-top:8px">${r.name}　<small style="color:#ffd77a">套装：${GSET[[0,1,1,3,3][ri]??3].n}</small></div>`;
    d.bosses.forEach((b,k)=>{const L=firstL(ri)+k,kills=((PROG.codex||{})[b.n]||0),pt=bossPortrait(L);
      h+=`<div class="itip" style="margin:4px 0;display:flex;gap:6px"><div data-boss-portrait="${L}"${b.variants?' title="随机首领"':''} style="flex:0 0 40px;height:40px;display:grid;place-items:center;color:#e9c581;font-size:22px;border-radius:6px;background:#1a1430 center/cover${pt?` url(${pt})`:''}">${b.variants?'？':''}</div><div style="flex:1;font-size:11px">
        <b>${b.n}</b>　<span style="color:#9a94c0">击杀 ${kills}${(PROG.fk||{})[L+':2']?' · 史诗已通':(PROG.fk||{})[L+':1']?' · 英雄已通':''}</span><br>
        <span style="color:#ffb070">技能：${bossSkillList(b).join('、')||'—'}</span><br><span style="color:#c8c0ff">机制：${b.tip||'—'}</span></div></div>`;});});
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
let DAILY_GO=null;
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
