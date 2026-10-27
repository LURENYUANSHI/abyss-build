// 团本引擎：把 content/raids_data.js（格式见 design/dsl.md）变成可运行的副本 / 首领 / 小怪。
// 由 game.html 在主脚本之后加载；依赖主脚本里的全局（G、pl、en、SK、tel、spawnAt、hurt、dmg……）。
(function(){
'use strict';
const D=window.RAID_DATA;
if(!D||!D.raids)return;

// ---------- 精灵表按需加载（art/<表名>.png，横排正方形帧） ----------
const SHEET={};
function sheet(name){
  if(!name)return null;
  const s=SHEET[name];
  if(s)return s.f;
  SHEET[name]={f:null};
  const im=new Image();
  im.onload=()=>{SHEET[name].f=strip(im,Math.max(1,Math.round(im.width/im.height)));};
  im.onerror=()=>{SHEET[name].bad=true;};
  im.src='art/'+name+'.png?v='+VERSION;
  return null;
}
// ref=[表名, 主体序号]；per=每个主体几帧（首领 4：待机/移动/攻击/施法；小怪 3：待机/走路/攻击）
function frames(ref,per){
  if(!Array.isArray(ref))return null;
  const f=sheet(ref[0]);
  if(!f)return null;
  const a=f.slice(ref[1]*per,ref[1]*per+per);
  return a.length?a:null;
}
function tilesOf(name){
  if(!name||ART[name]||SHEET['t:'+name])return;
  SHEET['t:'+name]=1;
  const im=new Image();
  im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(im,0,0,256,256);c.isArt=true;ART[name]=c;};
  im.src='art/'+name+'.png?v='+VERSION;
}
window.formOf=f=>Array.isArray(f)?((frames(f,1)||[null])[0]):FORM(f);

// ---------- 用数据重建关卡表：一个副本一章，一个首领一关 ----------
const OLD=RAIDS.slice();
const bioTheme=b=>OLD[(b-1)%OLD.length].bosses[0].theme;
RAIDS.length=0;
for(const r of D.raids){
  if(!r.bosses||!r.bosses.length)continue;
  const bio=r.bio||1;
  RAIDS.push({id:r.id,name:r.name,exp:r.exp||'classic',bio,desc:r.desc||'',tiles:r.tiles,trash:r.trash||{},
    bosses:r.bosses.map((b,k)=>Object.assign({},b,{lv:b.lv||b.n,rooms:Math.min(12,(b.rooms||3)+6),theme:bioTheme(bio),
      art:b.art,fallbackArt:OLD[(bio-1)%OLD.length].bosses[k%3].art}))});
}
buildLV();
PROG.un=Math.min(PROG.un,NLV());
if(selLevel>NLV())selLevel=1;

// 进入一关前预载这一关要用的图
function preload(L){
  const v=LV[L];if(!v)return;
  const r=RAIDS[v.ri],b=v.b;
  tilesOf(r.tiles);
  if(b.art)sheet(b.art[0]);
  for(const ph of b.ph||[])if(Array.isArray(ph.form))sheet(ph.form[0]);
  for(const a of b.adds||[])if(a.art)sheet(a.art[0]);
  for(const m of b.multi||[])if(m.art)sheet(m.art[0]);
  for(const t of Object.values(r.trash))if(t.art)sheet(t.art[0]);
}
window.raidPreload=preload;
const _newLevel=newLevel;
newLevel=function(L,ri){preload(L);if(LV[L+1])preload(L+1);return _newLevel(L,ri);};
const _renderLevels=renderLevels;
renderLevels=function(){preload(selLevel);return _renderLevels();};

// ---------- 小怪：按本关的 trash 名单生成，带数据驱动的技能 ----------
function levelTrash(){
  const v=LV[G.L];if(!v)return null;
  const r=RAIDS[v.ri],names=(v.b.trash&&v.b.trash.length?v.b.trash:Object.keys(r.trash));
  return names.map(n=>r.trash[n]&&Object.assign({id:n},r.trash[n])).filter(Boolean);
}
window.trashByName=n=>{const v=G&&LV[G.L];if(!v)return null;const t=RAIDS[v.ri].trash[n]||Object.values(RAIDS[v.ri].trash).find(x=>x.n===n);return t&&ET[t.base]?Object.assign({id:n},t):null;};
window.pickTrash=()=>{
  if(!G||G.phase!=='fight'||!G.cfg||G.cfg.type!=='normal')return null;
  const L=levelTrash();if(!L||!L.length)return null;
  const ranged=L.filter(t=>t.base==='SA'),melee=L.filter(t=>t.base!=='SA');
  const useR=ranged.length&&(rand()<.3||!melee.length);          // 远程至少三成
  const pool=useR?ranged:melee;
  return pool[(rand()*pool.length)|0];
};
window.applyTrash=(e,t)=>{
  e.def=t;e.name=t.n||t.id;
  e.hp=e.max=e.hp*(t.hp||1);e.dmg*=(t.dmg||1);
  const f=frames(t.art,3);
  if(f){e.art=[f[0],f[1]];e.artAtk=f[2];e.w=e.h=t.size||18;}
  e.abx=(t.ab||[]).filter(a=>!/^death|packRevive/.test(a.k)).map(a=>Object.assign({t:(a.cd||5)*(.4+rand()*.6)},a));
};
// 精英 = 本关指定的小怪，血量 ×4、技能更频繁
function makeElite(b,v){
  const r=RAIDS[v.ri],t=r.trash[v.b.elite];if(!t)return;
  b.name=t.n||v.b.elite;b.def=t;
  const f=frames(t.art,3);
  if(f){b.art=[f[0],f[1]];b.artAtk=f[2];}
  b.abx=(t.ab||[]).map(a=>Object.assign({t:1},a,{cd:(a.cd||5)*.7}));
}

// 小怪技能（mobAbility）
function mobTick(e,dt){
  if(!e.abx||e.dead||e.frozenT>0||e.wind>0||e.dash>0)return;
  const d=Math.hypot(pl.x-e.x,pl.y-e.y);
  for(const a of e.abx){
    if((a.t-=dt)>0)continue;
    if(a.range&&d>a.range){a.t=.5;continue;}
    a.t=a.cd||5;
    const D=(a.dmg||1)*e.dmg,T=a.T||.7;
    switch(a.k){
      case'pounce':e.wind=a.wind||.35;e.tx=pl.x;e.ty=pl.y;break;
      case'chargeLine':e.wind=T;e.tx=pl.x;e.ty=pl.y;G.etels.push({t:'line',x:e.x,y:e.y,a:angTo(e,pl),len:a.len||80,w:a.w||5,left:T,dmg:0,col:'#ff6a6a',vis:1});break;
      case'nova':G.etels.push({t:'circle',x:e.x,y:e.y,r:a.r||24,left:T,dmg:D,col:'#ff8a5a'});if(a.eff)effAt(e.x,e.y,a.r||24,T,a.eff);break;
      case'aoeAtPlayer':G.etels.push({t:'circle',x:pl.x,y:pl.y,r:a.r||16,left:T,dmg:D,col:'#ff6a6a'});if(a.eff)effAt(pl.x,pl.y,a.r||16,T,a.eff);break;
      case'beam':G.etels.push({t:'line',x:e.x,y:e.y,a:angTo(e,pl),len:a.len||95,w:a.w||4,left:T,dmg:D,col:'#ff4a8a'});break;
      case'volley':{const n=a.n||3;for(let i=0;i<n;i++){const ang=angTo(e,pl)+(i-(n-1)/2)*.25;shots.push({x:e.x,y:e.y,vx:Math.cos(ang)*(a.spd||75),vy:Math.sin(ang)*(a.spd||75),life:2.5,dmg:D*.6,col:a.col||'#ff7a4a',fire:a.fire});}break;}
      case'blink':{const ang=rand()*TAU,r=50+rand()*30;fxs('smoke',e.x,e.y,18,.3);e.x=clamp(pl.x+Math.cos(ang)*r,G.rm.x+8,G.rm.x+G.rm.w-8);e.y=clamp(pl.y+Math.sin(ang)*r,G.rm.y+8,G.rm.y+G.rm.h-8);pushOut(e,3);fxs('portal',e.x,e.y,18,.3);break;}
      case'summon':{const n=a.n||1;if(en.filter(q=>!q.dead).length>24)break;for(let i=0;i<n;i++){const s=spawnAt(e.x+rand()*16-8,e.y+rand()*16-8,a.base||'BT');s.hp=s.max*=a.hp||.5;}break;}
      case'buffAllies':for(const q of en)if(!q.dead&&!q.boss&&Math.hypot(q.x-e.x,q.y-e.y)<(a.r||50)){q.spd*=1.25;q.dmg*=1.15;}fxs('levelup',e.x,e.y,30,.5);break;
      case'heal':castOn(e,{n:'治疗',T:a.T||2,need:a.need||3,then:()=>{const t=en.filter(q=>!q.dead&&!q.prop&&Math.hypot(q.x-e.x,q.y-e.y)<80).sort((x,y)=>x.hp/x.max-y.hp/y.max)[0];if(t){t.hp=Math.min(t.max,t.hp+t.max*(a.pct||.3));fxs('heal',t.x,t.y,20,.5);}}});break;
      case'fear':effAt(e.x,e.y,a.r||40,T,'fear');G.etels.push({t:'circle',x:e.x,y:e.y,r:a.r||40,left:T,dmg:0,col:'#b46aff'});break;
      case'mc':G.etels.push({t:'circle',x:pl.x,y:pl.y,r:a.r||14,left:T,dmg:0,col:'#b46aff'});effAt(pl.x,pl.y,a.r||14,T,'mc');break;
      case'stacks':if(d<(a.r||14))addStack(a.kind||'vuln',a.max||5,a.decay||6);break;
    }
  }
}
window.trashDeath=e=>{
  for(const a of e.def.ab||[]){
    if(a.k==='deathExplode')G.etels.push({t:'circle',x:e.x,y:e.y,r:a.r||16,left:a.T||.6,dmg:(a.dmg||1.3)*e.dmg,col:'#ff8a2a'});
    if(a.k==='deathPool'&&G.pools.length<14)G.pools.push({x:e.x,y:e.y,r:a.r||10,arm:.3,t:a.t||3,tick:0,dmg:(a.dmg||.5)*e.dmg,fire:a.fire});
    if(a.k==='deathSplit'&&!e.small)for(let i=0;i<(a.n||2);i++){const s=spawnAt(e.x+(i?5:-5),e.y,e.k);s.small=true;s.hp=s.max*=a.hp||.4;s.w=Math.round(s.w*.7);s.h=Math.round(s.h*.7);}
    if(a.k==='packRevive'&&!e.revived)G.revives.push({x:e.x,y:e.y,t:a.t||3});
  }
};

// ---------- 玩家状态：诅咒 / 叠层 / 炸弹 / 凝视 ----------
function addStack(kind,max,decay){
  G.stk=G.stk||{};
  const s=G.stk[kind]||(G.stk[kind]={n:0,t:0});
  s.n=Math.min(max||5,s.n+1);s.t=decay||6;
}
// 预警结束时在范围内则施加效果（小怪的恐惧 / 心控 / 眩晕等）
function effAt(x,y,r,T,eff){G.sched.push({t:T,fn:()=>{if(Math.hypot(pl.x-x,pl.y-y)<r+4)applyEff(eff);}});}
function applyEff(eff,b){
  switch(eff){
    case'stun':case'freeze':pl.frozenT=Math.max(pl.frozenT,1.1);break;
    case'slow':G.pSlowT=Math.max(G.pSlowT||0,2.5);break;
    case'dot':G.dotT=6;G.dotD=pl.maxHp*.025;break;
    case'fear':G.fearT=1.3;G.fearA=b?angTo(b,pl):rand()*TAU;toast('恐惧！');break;
    case'silence':G.sealT=Math.max(G.sealT||0,3);toast('沉默：技能被封');break;
    case'vuln':G.vulnT=Math.max(G.vulnT||0,6);break;
    case'mc':G.mcT=2.5;toast('被心灵控制！');break;
    case'pull':if(b){pl.x=b.x+(pl.x-b.x)*.2;pl.y=b.y+(pl.y-b.y)*.2+8;clampRoom(pl,4);}break;
  }
}
window.applyEffX=(t,b)=>{if(t.eff&&!['freeze','stun','slow','dot','fear','knock'].includes(t.eff))applyEff(t.eff,b);};

// 读条（首领 / 小怪头顶），被普攻命中 need 次打断
function castOn(u,c){u.cast={n:c.n||'读条',t:c.T,T:c.T,hits:0,need:c.need||0,then:c.then};}

window.hurtMulX=()=>{
  let m=1;const s=G.stk;
  if(s&&s.vuln&&s.vuln.n)m*=1+.06*s.vuln.n;
  return m;
};
window.dmgMulX=(e,o)=>{
  let m=1;
  if(G.curse&&G.curse.kind==='dmg'&&G.curse.t>0&&o.src!=='ally')m*=.5;
  const s=G.stk;if(s&&s.dmg&&s.dmg.n)m*=1-.08*s.dmg.n;
  if(e.cast&&e.cast.need&&o.src!=='dot'){e.cast.hits++;if(e.cast.hits>=e.cast.need){num(e.x,e.y-14,'打断！','#9fe8ff',true);e.cast=null;}}
  if(e.link&&e.link.alive())m*=e.link.mul;
  if(e.shield&&e.shield.t>0){
    if(e.shield.kind==='immune')return 0;
    if(e.shield.kind==='reduce')m*=e.shield.pct||.3;
    if(e.shield.kind==='reflect'&&(G.reflT=(G.reflT||0))<=0){G.reflT=.5;hurt(e.skd*.15);}
  }
  if(e.sharedWith&&!e.sharedWith.dead)G.sched.push({t:0,fn:()=>{if(!e.sharedWith.dead)e.sharedWith.hp=Math.max(1,Math.min(e.sharedWith.hp,e.hp));}});
  return m;
};

// ---------- 首领技能引擎（DSL 的 e） ----------
const R=()=>G.rm;
function spot(b,at,p){
  const r=R();
  switch(at){
    case'boss':return{x:b.x,y:b.y};
    case'random':return randInRoom(p.r||16);
    case'ahead':return{x:pl.x+(pl.ax||0)*30,y:pl.y+(pl.ay||0)*30};
    case'corner':{const c=[[r.x+16,r.y+16],[r.x+r.w-16,r.y+16],[r.x+16,r.y+r.h-16],[r.x+r.w-16,r.y+r.h-16]][(rand()*4)|0];return{x:c[0],y:c[1]};}
    case'center':return{x:r.cx,y:r.y+r.h/2};
    default:return{x:pl.x+(p.spread?(rand()-.5)*p.spread:0),y:pl.y+(p.spread?(rand()-.5)*p.spread:0)};
  }
}
function afterOf(p,b){
  const A=p.after;if(!A)return null;
  return(t)=>{
    if(A.pool&&G.pools.length<14)G.pools.push({x:t.x,y:t.y,r:A.pool.r||t.r||14,arm:0,t:A.pool.t||4,tick:0,dmg:(A.pool.dmg||.2)*b.skd,fire:A.pool.fire!==false});
    if(A.adds){const n=A.adds.n||1;for(let i=0;i<n;i++){const e=spawnAt(t.x+rand()*16-8,t.y+rand()*16-8,A.adds.k||'SK');if(A.adds.hp)e.hp=e.max*=A.adds.hp;}}
  };
}
const ENG={
  tel(b,p,f){
    const n=p.n||1,T=(p.T||.8)*f,gap=p.gap||.12,shape=p.t||'circle';
    for(let i=0;i<n;i++){
      const at=p.at||(shape==='circle'?'player':'boss'),s=spot(b,at,p),ang=at==='fixed'?(p.a||0):angTo(b,pl);
      let g;
      if(shape==='circle')g={x:s.x,y:s.y,r:p.r||20};
      else if(shape==='cone')g={x:b.x,y:b.y,a:ang,ang:p.ang||.55,len:p.len||140};
      else if(shape==='beam')g={x:at==='boss'||at==='fixed'?b.x:s.x,y:at==='boss'||at==='fixed'?b.y:s.y,a:ang,w:p.w||8};
      else{const w=p.w||60,h=p.h||40;g={x:clamp(s.x-w/2,R().x,R().x+R().w-w),y:clamp(s.y-h/2,R().y,R().y+R().h-h),w,h};}
      if(p.col)g.col=p.col;
      if(!p.dmg)g.harmless=true;
      const t=tel(shape,g,T+i*gap,(p.dmg||0)*b.skd,p.eff);
      const af=afterOf(p,b);if(af)t.after=()=>af(t);
      b.tels.push(t);
    }
    return T+(n-1)*gap+.3;
  },
  curse(b,p){
    G.curse={kind:p.kind,t:p.t||8,T:p.t||8,dmg:(p.dmg||1)*b.skd,n:p.say||'诅咒'};
    if(p.kind==='vuln')G.vulnT=p.t||8;
    if(p.kind==='silence')G.sealT=p.t||4;
    if(p.kind==='cd')G.skillT+=st.skillCd;
    toast(`${p.say||'诅咒'}：${{delayed:`${p.t||6} 秒后爆发`,cd:'技能冷却变慢',heal:'回复降低',dmg:'伤害降低',vuln:'受到伤害增加',silence:'技能被封'}[p.kind]||''}`);
    return .8;
  },
  stacks(b,p){addStack(p.kind||'vuln',p.max||5,p.decay||8);return .6;},
  playerBomb(b,p){G.bomb={t:p.t||8,r:p.r||40,dmg:(p.dmg||1)*b.skd,per:p.perEnemy??.5,after:p.after};toast('你成为了炸弹！远离其他敌人');return .8;},
  castBar(b,p,f){castOn(b,{n:p.say||'读条',T:(p.T||2)*f,need:p.need||0,then:()=>runSkill(b,p.then||{e:'tel',t:'circle',at:'boss',r:80,T:.4,dmg:1.6})});return (p.T||2)*f+.2;},
  frenzy(b,p){b.frenzyT=p.perm?1e9:(p.t||8);b.frenzySpd=p.spd||1.5;toast(`${b.name} 狂乱！`);return .5;},
  followAura(b,p,f){b.aura={r:p.r||40,t:(p.t||6),dmg:(p.dmg||.35)*b.skd,tick:p.tick||.5,k:0,warm:.8*f,spd:p.spd??.6};return .8*f;},
  teleportPlayer(b,p){const s=spot(b,p.to==='boss'?'boss':p.to==='random'?'random':'corner',p);fxs('portal',pl.x,pl.y,22,.4);pl.x=s.x;pl.y=s.y+(p.to==='boss'?14:0);clampRoom(pl,4);if(p.root)pl.frozenT=Math.max(pl.frozenT,p.root);
    if(p.pool)G.pools.push({x:pl.x,y:pl.y,r:p.pool.r||16,arm:.6,t:p.pool.t||3,tick:0,dmg:(p.pool.dmg||.25)*b.skd,fire:true});fxs('portal',pl.x,pl.y,22,.4);return .6;},
  bossShield(b,p){b.shield={kind:p.kind||'reduce',t:p.t||8,pct:p.pct};toast(`${b.name}：${{reflect:'魔法反射',reduce:'伤害减免',immune:'无敌'}[p.kind]||'护盾'}（大招可驱散）`);return .5;},
  mindControl(b,p){G.mcT=p.t||3;toast('被心灵控制！');return .5;},
  summon(b,p){
    const n=p.n||2,r=R();
    for(let i=0;i<n;i++){
      let x=b.x,y=b.y;
      if(p.at==='edges'){x=i%2?r.x+8:r.x+r.w-8;y=r.y+20+rand()*(r.h-40);}
      else if(p.at==='corners'){x=i%2?r.x+12:r.x+r.w-12;y=(i>>1)%2?r.y+12:r.y+r.h-12;}
      else{const a=i*TAU/n;x+=Math.cos(a)*(p.ring||30);y+=Math.sin(a)*(p.ring||30);}
      const t=RAIDS[LV[G.L].ri].trash[p.k];
      const e=spawnAt(x,y,t?t.base:(p.k||'SK'));if(t)applyTrash(e,t);
      if(p.hp)e.hp=e.max*=p.hp;
      if(p.art){const fr=frames(p.art,1);if(fr){e.art=[fr[0]];e.w=e.h=p.size||20;}}
    }
    fxs('portal',b.x,b.y,30,.5);return .9;
  },
  shots(b,p){
    if(p.p==='ring')ringShots(b,p.n||12,rand()*TAU,p.spd||55,(p.dmg||.6)*b.skd);
    else if(p.p==='spiral'){b.spiral={t:p.dur||2,n:0};}
    else{const n=p.n||5;for(let i=0;i<n;i++){const a=angTo(b,pl)+(i-(n-1)/2)*(p.p==='aimed'?.05:.18);shots.push({x:b.x,y:b.y,vx:Math.cos(a)*(p.spd||80),vy:Math.sin(a)*(p.spd||80),life:3,dmg:(p.dmg||.6)*b.skd});}}
    return p.dur||1;
  },
  charge(b,p,f){SK.charge.start(b,f);return b.at;},
  addPhase(b,p){b.inv=true;const r=R();if(p.pos!=='stay'){b.x=r.cx;b.y=r.y+22;}b.addPh={t:p.t||20,T0:p.t||20,every:p.adds&&p.adds.every||4,k:0,adds:p.adds||{n:3},until:p.until||'time'};toast(`${b.name}：${p.say||'召唤援军（无敌）'}`);return p.t||20;},
  gaze(b,p){G.gaze={t:p.t||2,x:pl.x,y:pl.y,dmg:(p.dmg||3)*b.skd,b};toast('凝视：别动！');return (p.t||2)+.2;},
  decimate(b,p){pl.hp=Math.max(pl.maxHp*.05,pl.hp*(p.p||.5));for(const e of en)if(p.adds&&!e.boss&&!e.dead)e.hp=Math.max(1,e.max*.05);G.flash=.3;toast('屠戮！');return .8;},
  pull(b,p){applyEff('pull',b);if(p.dmg)hurt(p.dmg*b.skd);if(p.root)pl.frozenT=p.root;return .6;},
  grab(b,p){applyEff('pull',b);pl.frozenT=p.T||2;if(p.dmg)G.sched.push({t:p.T||2,fn:()=>{pl.inv=0;hurt(p.dmg*b.skd);}});toast('被抓住了！');return (p.T||2)+.2;},
  trail(b,p){b.trail={t:p.t||6,dmg:(p.dmg||.25)*b.skd,r:p.r||12,k:0};return .5;},
  totem(b,p){for(let i=0;i<(p.n||1);i++){const s=randInRoom(30),e=spawnAt(s.x,s.y,'SP');e.totem=Object.assign({k:0,b},p);e.hp=e.max=e.max*(p.hp||2);e.name='图腾';}toast(`${b.name} 放下了图腾`);return .8;},
  energyBar(b,p){b.mp=b.mp||0;b.mpRate=p.rate||10;b.mpThen=p.then;return .3;},
  mirrorImages(b,p){for(let i=0;i<(p.n||2);i++){const e=spawnAt(b.x+(i?-30:30),b.y,'SK');e.art=b.art;e.w=b.w*.8;e.h=b.h*.8;e.hp=e.max=b.max*(p.hp||.15);e.dmg=b.dmg*.4;e.name=b.name+'的幻象';}toast('幻象！');return .8;},
  burrow(b,p,f){b.hidden=true;b.inv=true;b.burrow={t:p.t||4,x:pl.x,y:pl.y,r:p.r||36,dmg:(p.dmg||1.6)*b.skd};return (p.t||4)+.4;},
  healTarget(b,p,f){castOn(b,{n:p.say||'治疗',T:(p.T||2.5)*f,need:p.need||4,then:()=>{b.hp=Math.min(b.max,b.hp+b.max*(p.pct||.08));fxs('heal',b.x,b.y,30,.5);}});return (p.T||2.5)*f;},
  special(b,p,f){return (SPECIAL[p.name]||SPECIAL._fallback)(b,p,f);},
};
// 少数原作独有机制的简化实现
const SPECIAL={
  polarityShift(b,p,f){G.pol={sign:rand()<.5?1:-1,t:p.t||18};toast(`极性转换：你是${G.pol.sign>0?'正极（站左半场）':'负极（站右半场）'}`);return 1;},
  losBreath(b,p,f){const r=R();for(let i=0;i<3;i++){const s=randInRoom(30);OBS.push({kind:'pillar',x:s.x-7,y:s.y-7,w:14,h:14,hp:999,flash:0,dead:false,ice:true});}
    castOn(b,{n:'冰霜吐息',T:3*f,need:0,then:()=>{if(los(b,pl)){pl.inv=0;hurt(b.skd*4);}else toast('躲在冰块后，安全！');for(const o of OBS)if(o.ice)o.dead=true;}});toast('躲到冰块后面！');return 3*f+.3;},
  webWrap(b,p){const r=R(),side=(rand()*4)|0;pl.x=side===0?r.x+8:side===1?r.x+r.w-8:r.cx;pl.y=side===2?r.y+8:side===3?r.y+r.h-8:r.y+r.h/2;pl.frozenT=3;toast('被蛛网包裹！');return .8;},
  marks(b,p){G.markN=(G.markN||0)+1;pl.inv=0;hurt(b.skd*.12*Math.pow(G.markN,1.5));return .6;},
  stomach(b,p){const r=R();pl.x=r.cx;pl.y=r.y+r.h-14;G.stomachT=p.t||10;for(let i=0;i<2;i++){const e=spawnAt(r.cx+(i?-30:30),r.y+r.h-20,'SL');e.spd=0;e.hp=e.max*=2;e.name='血肉触须';}toast('被吞入胃中！击杀触须逃出');return 1;},
  siphon(b,p,f){castOn(b,{n:'血液虹吸',T:3*f,need:0,then:()=>{if(G.poisonBloodT>0){b.hp-=b.max*.05;toast('毒血反噬哈卡！');}else{pl.hp*=.75;b.hp=Math.min(b.max,b.hp+b.max*.1);}}});return 3*f;},
  shatter(b,p){b.shield={kind:'reduce',t:6,pct:.5};return .6;},
  _fallback(b,p,f){return ENG.tel(b,{t:'circle',at:'player',r:p.r||20,T:.9,dmg:p.dmg||1},f);},
};
function runSkill(b,p){const fn=ENG[p.e]||ENG.tel;return fn(b,p,b.ph2||b.frenzyT>0?.75:1);}
// 把 skills 里的数据技能包装成主脚本 SK 的形状（start/tick/end）
function wrapSkills(b,skills){
  b.skills=skills||{};b.skx={};
  for(const k in b.skills){
    const p=b.skills[k];
    if(!p||(SK[k]&&!p.e))continue;
    b.skx[k]={start(bb,f){const d=(ENG[p.e]||ENG.tel)(bb,p,f);bb.at=Math.max(.4,d||1);},tick(){},end(){}};
  }
}
window.raidAdds=(b,list)=>{for(const a of [].concat(list)){const n=a.count||a.n||1;
  for(let i=0;i<n;i++){const ang=i*TAU/n,t=RAIDS[LV[G.L].ri].trash[a.k||a.n];
    const e=spawnAt(b.x+Math.cos(ang)*(a.ring||40),b.y+Math.sin(ang)*(a.ring||40),a.base||(t&&t.base)||'SK');
    if(t)applyTrash(e,t);e.name=a.n||e.name;e.hp=e.max*=(a.hp||1);
    const fr=frames(a.art,1);if(fr){e.art=[fr[0]];e.w=e.h=a.size||22;}
    if(a.ab)e.abx=a.ab.map(x=>Object.assign({t:2+rand()*2},x));
    if(a.link&&a.link.bossDmgTaken){b.link={mul:a.link.bossDmgTaken,alive:()=>en.some(q=>q.linkTo===b&&!q.dead)};e.linkTo=b;}}}};

// ---------- 生成首领：在原 spawnBoss 结果上套用数据 ----------
const _spawnBoss=spawnBoss;
spawnBoss=function(big){
  const v=LV[G.L],d=v&&v.b;
  _spawnBoss(big);
  const b=G.boss;if(!b||!d)return;
  if(!big){if(d.elite)makeElite(b,v);return;}
  b.name=d.n;b.hp=b.max=b.max*(d.hp||1);
  b.fury=d.enrage||b.fury;
  if(d.spd!==undefined)b.spd=d.spd;
  if(d.fixed)b.spd=0;
  const f=frames(d.art,4)||(ART.bosses&&[ART.bosses[d.fallbackArt]]);
  if(f){b.art=f.length>=2?[f[0],f[1]]:[f[0]];b.artAtk=f[3]||f[2]||null;b.w=b.h=d.size||(v.last?64:54);}
  wrapSkills(b,d.skills);
  b.sk=(d.sk&&d.sk.length?d.sk:b.sk).filter(k=>b.skx[k]||SK[k]);
  if(!b.sk.length)b.sk=['slam'];
  b.autoSk=(d.auto||[]).map(a=>Object.assign({t:a.every||6},a));
  b.ph=(d.ph||[]).map(o=>[o.at,o]);b.phi=0;
  if(d.passive)b.passive=d.passive;
  if(d.adds)raidAdds(b,d.adds.filter(a=>!a.at||a.at==='start'));
  if(d.multi){
    for(const m of d.multi){
      const e={...b,tels:b.tels,sec:true,name:m.n,x:b.x+(rand()<.5?-50:50),y:b.y+20,flash:0,poison:0,dead:false,frozenT:0,slowT:0,burnT:0,cyc:0,at:2+rand(),mode:'walk',say:null};
      e.hp=e.max=b.max*(m.hp||1);
      const mf=frames(m.art,4);if(mf){e.art=[mf[0],mf[1]];e.artAtk=mf[3];}
      wrapSkills(e,Object.assign({},d.skills,m.skills));
      e.sk=(m.sk||b.sk).filter(k=>e.skx[k]||SK[k]);if(!e.sk.length)e.sk=['slam'];
      e.ph=(m.ph||[]).map(o=>[o.at,o]);e.phi=0;e.autoSk=(m.auto||[]).map(a=>Object.assign({t:a.every||6},a));
      if(d.shared&&d.shared.hp){e.sharedWith=b;b.sharedWith=e;}
      en.push(e);
    }
  }
  if(d.open){const o=d.open;if(o.msg)toast(o.msg);if(o.inv)b.inv=true;if(o.adds)raidAdds(b,o.adds);
    if(o.go&&(b.skx[o.go]||SK[o.go])){b.mode=o.go;b.say={n:skName(b,o.go),t:1.6};skOf(b,o.go).start(b,1);}}
  if(d.tip)setTimeout(()=>toast(d.tip),1500);
};

// ---------- 每帧：首领附加状态、玩家减益、小怪技能 ----------
window.raidTick=dt=>{
  if(!G)return;
  for(const e of en){
    if(e.dead)continue;
    if(e.abx&&!e.boss)mobTick(e,dt);
    else if(e.abx&&e.boss&&e.mode==='walk')mobTick(e,dt);
    if(e.cast){e.cast.t-=dt;if(e.cast.t<=0){const c=e.cast;e.cast=null;c.then&&c.then();}}
    if(e.shield&&(e.shield.t-=dt)<=0)e.shield=null;
    if(e.totem){const T=e.totem;if((T.k-=dt)<=0){T.k=T.every||3;if(T.effect==='healBoss'&&T.b&&!T.b.dead){T.b.hp=Math.min(T.b.max,T.b.hp+T.b.max*.02);fxs('heal',T.b.x,T.b.y,20,.4);}
      else if(T.effect==='mc'&&Math.hypot(pl.x-e.x,pl.y-e.y)<40)G.mcT=2;
      else G.etels.push({t:'circle',x:e.x,y:e.y,r:T.r||30,left:.8,dmg:(T.dmg||.5)*(T.b?T.b.skd:e.dmg),col:'#ff8a5a'});}}
    if(!e.boss)continue;
    const b=e;
    for(const a of b.autoSk||[])if((a.t-=dt)<=0){a.t=a.every||6;const p=(b.skills||{})[a.k];if(p&&p.e)runSkill(b,p);else if(SK[a.k]&&SK[a.k].start){const m=b.mode,at=b.at;SK[a.k].start(b,1);b.mode=m;b.at=Math.max(b.at,at);}b.say={n:skName(b,a.k),t:1.2};}
    if(b.frenzyT>0){b.frenzyT-=dt;b.at-=dt*.5;}
    if(b.aura){const A=b.aura;if(A.warm>0)A.warm-=dt;else{if((A.k-=dt)<=0){A.k=A.tick;if(Math.hypot(pl.x-b.x,pl.y-b.y)<A.r){pl.inv=0;hurt(A.dmg);}}if((A.t-=dt)<=0)b.aura=null;}}
    if(b.trail){const T=b.trail;if((T.k-=dt)<=0){T.k=.4;if(G.pools.length<16)G.pools.push({x:b.x,y:b.y,r:T.r,arm:.3,t:3,tick:0,dmg:T.dmg,fire:true});}if((T.t-=dt)<=0)b.trail=null;}
    if(b.addPh){const P=b.addPh;P.t-=dt;if((P.k-=dt)<=0){P.k=P.every;const r=R(),n=P.adds.n||3;for(let i=0;i<n;i++){const c=[[r.x+10,r.y+10],[r.x+r.w-10,r.y+10],[r.x+10,r.y+r.h-10],[r.x+r.w-10,r.y+r.h-10]][(rand()*4)|0];const t=RAIDS[LV[G.L].ri].trash[P.adds.k];const q=spawnAt(c[0],c[1],t?t.base:(P.adds.k||'SK'));if(t)applyTrash(q,t);}}
      const left=en.some(q=>!q.dead&&!q.boss&&!q.prop);if(P.t<=0||(P.until==='adds'&&P.t<(P.T0||P.t)-3&&!left)){b.addPh=null;b.inv=false;b.at=0;toast(`${b.name} 亲自出手！`);}}
    if(b.burrow){const B=b.burrow;B.t-=dt;const a=angTo(B,pl);B.x+=Math.cos(a)*30*dt;B.y+=Math.sin(a)*30*dt;if(B.t<=0){b.x=B.x;b.y=B.y;b.hidden=false;b.inv=false;b.tels.push(tel('circle',{x:B.x,y:B.y,r:B.r},.05,B.dmg,'knock'));b.burrow=null;}}
    if(b.mpRate){b.mp+=b.mpRate*dt;if(b.mp>=100){b.mp=0;runSkill(b,b.mpThen||{e:'tel',t:'circle',at:'boss',r:90,T:.8,dmg:1.5});}}
    if(b.spiral){const S=b.spiral;S.t-=dt;if((S.n-=dt)<=0){S.n=.1;ringShots(b,3,G.t*3,56,b.skd*.5);}if(S.t<=0)b.spiral=null;}
    if(b.passive){const P=b.passive;
      if(P.touchDot&&Math.hypot(pl.x-b.x,pl.y-b.y)<b.r+8&&!(G.dotT>0)){G.dotT=P.touchDot.t||4;G.dotD=pl.maxHp*.02;}
      if(P.rangedPunish){const far=Math.hypot(pl.x-b.x,pl.y-b.y)>(P.rangedPunish.d||70);b.rpT=far?(b.rpT||0)+dt:0;if(b.rpT>2){b.rpT=0;const a=angTo(b,pl);shots.push({x:b.x,y:b.y,vx:Math.cos(a)*120,vy:Math.sin(a)*120,life:3,dmg:(P.rangedPunish.dmg||1.6)*b.skd,col:'#ff6a2a',fire:true});toast('回到近战范围！');}}}
  }
  if(G.curse&&G.curse.t>0){G.curse.t-=dt;if(G.curse.t<=0&&G.curse.kind==='delayed'){pl.inv=0;hurt(G.curse.dmg);fxs('doom',pl.x,pl.y-6,30,.5);}
    if(G.curse.kind==='heal'&&pl.hp>(G.curse.hp??pl.hp))pl.hp=G.curse.hp+(pl.hp-G.curse.hp)*.25;G.curse.hp=pl.hp;}
  if(G.stk)for(const k in G.stk){const s=G.stk[k];if((s.t-=dt)<=0)s.n=0;}
  if(G.bomb){const B=G.bomb;B.t-=dt;if(B.t<=0){const n=en.filter(e=>!e.dead&&!e.prop&&Math.hypot(e.x-pl.x,e.y-pl.y)<B.r).length;pl.inv=0;hurt(B.dmg*(1+B.per*n));fxs('explosion',pl.x,pl.y,B.r*2,.5);
    for(const e of en)if(!e.dead&&!e.boss&&Math.hypot(e.x-pl.x,e.y-pl.y)<B.r)dmg(e,B.dmg*.5,{nocrit:true});if(B.after&&B.after.pool)G.pools.push({x:pl.x,y:pl.y,r:B.r*.6,arm:.3,t:B.after.pool.t||4,tick:0,dmg:(B.after.pool.dmg||.2)*(G.boss?G.boss.skd:10),fire:true});G.bomb=null;}}
  if(G.gaze){const Z=G.gaze;Z.t-=dt;if(Math.hypot(pl.x-Z.x,pl.y-Z.y)>6){pl.inv=0;hurt(Z.dmg);toast('你动了！');G.gaze=null;}else if(Z.t<=0)G.gaze=null;}
  if(G.pol){G.pol.t-=dt;const r=R(),left=pl.x<r.cx;if((G.polK=(G.polK||0)-dt)<=0){G.polK=1;if((left?1:-1)!==G.pol.sign){pl.inv=0;hurt((G.boss?G.boss.skd:10)*.4);}}if(G.pol.t<=0)G.pol=null;}
  if(G.stomachT>0){G.stomachT-=dt;if(!en.some(e=>e.name==='血肉触须'&&!e.dead)||G.stomachT<=0){G.stomachT=0;pl.y=R().y+R().h/2;if(G.boss){G.boss.shield={kind:'reduce',t:15,pct:2};}toast('逃出胃部！首领虚弱');}else addStack('vuln',20,2);}
  G.reflT=(G.reflT||0)-dt;
};
// 大招：安抚狂乱、驱散护盾
const _doUlt=doUlt;
doUlt=function(){_doUlt();for(const e of en)if(e.boss&&!e.dead){if(e.frenzyT>0&&e.frenzyT<1e8){e.frenzyT=0;num(e.x,e.y-20,'已安抚','#9fe8ff',true);}if(e.shield&&e.shield.kind!=='immune'){e.shield=null;num(e.x,e.y-26,'驱散','#ffd77a',true);}}};

// ---------- 绘制：读条、光环、炸弹、凝视、极性 ----------
window.raidDraw=g=>{
  if(!G)return;
  g.save();g.textAlign='center';
  for(const e of en){
    if(e.dead)continue;
    if(e.cast){const w=30,p=1-e.cast.t/e.cast.T,y=e.y-e.h/2-14;g.fillStyle='rgba(0,0,0,.7)';g.fillRect(e.x-w/2,y,w,4);g.fillStyle=e.cast.need?'#9fe8ff':'#ffb84a';g.fillRect(e.x-w/2,y,w*p,4);
      g.font='bold 6px sans-serif';g.fillStyle='#fff';g.fillText(e.cast.n+(e.cast.need?` 打断 ${e.cast.hits}/${e.cast.need}`:''),e.x,y-2);}
    if(e.aura&&e.aura.warm<=0&&FX.whirl){g.globalAlpha=.6;g.drawImage(FX.whirl,e.x-e.aura.r,e.y-e.aura.r,e.aura.r*2,e.aura.r*2);g.globalAlpha=1;}
    else if(e.aura){g.strokeStyle='rgba(255,60,60,.8)';g.beginPath();g.arc(e.x,e.y,e.aura.r,0,TAU);g.stroke();}
    if(e.shield&&FX.shield){g.globalAlpha=.45;g.drawImage(FX.shield,e.x-e.w*.6,e.y-e.h*.7,e.w*1.2,e.w*1.2);g.globalAlpha=1;}
    if(e.burrow){g.fillStyle='rgba(120,90,60,.5)';g.beginPath();g.arc(e.burrow.x,e.burrow.y,10,0,TAU);g.fill();}
    if(e.mpRate){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(e.x-15,e.y+e.h/2+2,30,2);g.fillStyle='#5ab4ff';g.fillRect(e.x-15,e.y+e.h/2+2,30*e.mp/100,2);}
  }
  if(G.bomb){g.strokeStyle='rgba(255,80,40,.9)';g.lineWidth=1;g.beginPath();g.arc(pl.x,pl.y,G.bomb.r,0,TAU);g.stroke();g.font='bold 9px sans-serif';g.fillStyle='#ff6a3a';g.fillText(Math.ceil(G.bomb.t),pl.x,pl.y-18);}
  if(G.gaze){g.font='bold 8px sans-serif';g.fillStyle='#ff3b3b';g.fillText('别动！',pl.x,pl.y-20);}
  if(G.curse&&G.curse.t>0&&G.curse.kind==='delayed'){g.font='bold 8px sans-serif';g.fillStyle='#c060ff';g.fillText('☠'+Math.ceil(G.curse.t),pl.x,pl.y-22);}
  if(G.pol){const r=R();g.globalAlpha=.12;g.fillStyle='#ff4a4a';g.fillRect(r.x,r.y,r.w/2,r.h);g.fillStyle='#4a9cff';g.fillRect(r.cx,r.y,r.w/2,r.h);g.globalAlpha=1;
    g.font='bold 8px sans-serif';g.fillStyle=G.pol.sign>0?'#ff6a6a':'#6ab4ff';g.fillText(G.pol.sign>0?'＋':'－',pl.x,pl.y-20);}
  if(G.mcT>0){g.font='bold 8px sans-serif';g.fillStyle='#c060ff';g.fillText('👁',pl.x,pl.y-20);}
  g.restore();
};
})();
