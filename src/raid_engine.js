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
  im.onload=()=>{const f=strip(im,Math.max(1,Math.round(im.width/im.height)));
    for(const c of f){const x=c.getContext('2d'),w=c.width;x.clearRect(0,0,w,Math.ceil(w*.025));x.clearRect(0,0,2,w);x.clearRect(w-2,0,2,w);trimBleed(c);}   // 去掉 GPT 合图残留的格线和相邻格渗进来的碎片
    SHEET[name].f=f;};
  im.onerror=()=>{SHEET[name].bad=true;};
  im.src='art/'+name+'.png?v='+VERSION;
  return null;
}
// ref=[表名, 主体序号]；per=每个主体几帧（首领 4：待机/移动/攻击/施法；小怪 3：待机/走路/攻击）
// 相邻格的精灵渗进本格底部：脚下隔着空行的一小撮像素清掉，再把主体落回底边
function trimBleed(c){
  const w=c.width,h=c.height,x=c.getContext('2d',{willReadFrequently:true}),d=x.getImageData(0,0,w,h),a=d.data,r=new Array(h).fill(0);let tot=0;
  for(let y=0;y<h;y++)for(let i=0;i<w;i++)if(a[(y*w+i)*4+3]>40){r[y]++;tot++;}
  if(!tot)return;
  let y=h-1,low=0;while(y>0&&r[y]>0)low+=r[y--];
  let gap=0;while(y>0&&r[y]===0){gap++;y--;}
  if(!low||gap<2||low>tot*.15||y<h*.3)return;
  x.clearRect(0,y+gap+1,w,h);const sh=h-2-y;if(sh<=0)return;
  const t=document.createElement('canvas');t.width=w;t.height=h;t.getContext('2d').drawImage(c,0,0);x.clearRect(0,0,w,h);x.drawImage(t,0,sh);}
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
// fallback:[现有图集名, 帧序号]，新图还没生成时用现有美术
const fb=ref=>Array.isArray(ref)&&ART[ref[0]]&&ART[ref[0]][ref[1]]||null;
window.formOf=f=>Array.isArray(f)?((frames(f,1)||[null])[0]):FORM(f);

// ---------- 用数据重建关卡表：一个副本一章，一个首领一关 ----------
const OLD=RAIDS.slice();
const bioTheme=b=>OLD[(b-1)%OLD.length].bosses[0].theme;
RAIDS.length=0;
for(const r of D.raids){
  if(!r.bosses||!r.bosses.length)continue;
  const bio=r.bio||1;
  RAIDS.push({id:r.id,name:r.name,exp:r.exp||'classic',bio,desc:r.desc||'',tiles:r.tiles,trash:r.trash||{},props:r.props||[],
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
  tilesOf(r.tiles);sheet('props_'+r.id);
  if(b.art)sheet(b.art[0]);
  for(const ph of b.ph||[])if(Array.isArray(ph.form))sheet(ph.form[0]);
  for(const a of b.adds||[])if(a.art)sheet(a.art[0]);
  for(const m of b.multi||[])if(m.art)sheet(m.art[0]);
  for(const t of Object.values(r.trash))if(t.art)sheet(t.art[0]);
}
window.raidPreload=preload;
// 副本机关贴图：r.props 的第 i 项 = props_<副本> 的第 i 组（待机 / 触发两帧）
const MECH={vent:'vent',EGG:'egg',GRV:'grave',RFT:'rift'};
window.propArt=k=>{const r=RAIDS[LV[G.L]?LV[G.L].ri:0];const i=(r.props||[]).findIndex(p=>p.k===MECH[k]);return i<0?null:frames(['props_'+r.id,i],2);};
// 纯装饰：本副本里非机关的道具，每房随机摆 1~2 个（不参与战斗）
window.raidDecor=(L,type)=>{const r=RAIDS[LV[L].ri],ids=[];(r.props||[]).forEach((p,i)=>{if(!Object.values(MECH).includes(p.k))ids.push(i);});
  const out=[];if(!ids.length)return out;
  for(let k=0,n=type==='big'?2:1+(rand()<.5);k<n;k++){const i=ids[(rand()*ids.length)|0],q=randInRoom(30);out.push({x:q.x,y:q.y,s:type==='big'?34:28,f:()=>frames(['props_'+r.id,i],2)});}
  return out;};
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
window.raidMech=L=>{const r=RAIDS[LV[L].ri];const p=(r.props||[]).find(x=>['vent','egg','grave','rift'].includes(x.k));return p?{vent:'vent',egg:'EGG',grave:'GRV',rift:'RFT'}[p.k]:null;};
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
  else if(fb(t.fallback)){e.art=[fb(t.fallback)];e.w=e.h=t.size||18;}
  for(const a of t.ab||[]){if(a.k==='resist'||a.k==='shield')e.shield={kind:'reduce',t:1e9,pct:a.pct||.5};if(a.k==='touchDot')e.touchDot=a;}
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
      case'stacks':case'onHit':if(d<(a.r||14))addStack(a.kind||'vuln',a.max||5,a.decay||6);break;
      case'tel':{const s=a.at==='self'?{x:e.x,y:e.y}:{x:pl.x,y:pl.y};G.etels.push({t:'circle',x:s.x,y:s.y,r:a.r||18,left:T,dmg:D,col:'#ff6a6a'});if(a.eff)effAt(s.x,s.y,a.r||18,T,a.eff);break;}
      case'curse':ENG.curse({skd:e.dmg,name:e.name},{kind:a.kind||'dmg',t:a.t||8,dmg:a.dmg||1,say:a.say||'诅咒'});break;
      case'enrage':if(!e.enraged&&e.hp<e.max*(a.at||.3)){e.enraged=true;e.spd*=1.5;e.dmg*=1.5;num(e.x,e.y-12,'激怒','#ff5a5a',true);}a.t=.5;break;
      case'sprint':e.spdBoost=1.5;e.spd*=1.8;G.sched.push({t:a.t||2,fn:()=>{e.spd/=1.8;}});break;
      case'bomb':if(d<(a.range||80))ENG.playerBomb({skd:e.dmg},{t:a.t||6,r:a.r||30,dmg:a.dmg||1});break;
      case'revive':case'totem':case'resist':case'shield':case'touchDot':break;
    }
  }
}
window.trashDeath=e=>{
  if(G.vamp)G.vampKills=(G.vampKills||0)+1;
  for(const b of en)if(b.boss&&b.attuned>0){b.attuned=Math.max(0,b.attuned-5);}
  for(const a of e.def.ab||[]){
    if(a.k==='deathExplode')G.etels.push({t:'circle',x:e.x,y:e.y,r:a.r||16,left:a.T||.6,dmg:(a.dmg||1.3)*e.dmg,col:'#ff8a2a'});
    if(a.k==='deathPool'&&G.pools.length<14)G.pools.push({x:e.x,y:e.y,r:a.r||10,arm:.3,t:a.t||3,tick:0,dmg:(a.dmg||.5)*e.dmg,fire:a.fire});
    if(a.k==='deathSplit'&&!e.small)for(let i=0;i<(a.n||2);i++){const s=spawnAt(e.x+(i?5:-5),e.y,e.k);s.small=true;s.hp=s.max*=a.hp||.4;s.w=Math.round(s.w*.7);s.h=Math.round(s.h*.7);}
    if((a.k==='packRevive'||a.k==='revive')&&!e.revived)G.revives.push({x:e.x,y:e.y,t:a.t||3});
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
  if(G.felRage)m*=G.felRage.mul;if(G.vamp)m*=G.vamp.mul;if(e.taken)m*=e.taken;

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
  builtin(b,p,f){const s=SK[p.k];if(s&&s.start){s.start(b,f);return b.at;}return .5;},
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
  vanish(b,p){b.hidden=true;b.inv=true;G.sched.push({t:p.t||3,fn:()=>{b.hidden=false;b.inv=false;b.x=pl.x-(pl.face||1)*14;b.y=pl.y;clampRoom(b,6);b.tels.push(tel('circle',{x:b.x,y:b.y,r:20},.6,b.skd*(p.dmg||1.5)));}});return (p.t||3)+.4;},
  channelBeam(b,p,f){return ENG.tel(b,{t:'beam',at:'boss',w:p.w||8,T:p.T||1,dmg:p.dmg||1.2,n:p.n||3,gap:.5},f);},
  randomBreath(b,p,f){const k=b._breath||(b._breath=['fireCone','frostCone','timeCone','acidCone'][(rand()*4)|0]);SK[k].start(b,f);return b.at;},
  classCall(b,p,f){SK.classcall.start(b,f);return b.at;},
  healBrother(b,p,f){const o=en.find(e=>e.boss&&e!==b&&!e.dead);if(o){o.hp=Math.min(o.max,o.hp+o.max*(p.pct||.05));fxs('heal',o.x,o.y,26,.5);}return .6;},
  twinTeleport(b,p){const o=en.find(e=>e.boss&&e!==b&&!e.dead);if(o){const x=b.x,y=b.y;b.x=o.x;b.y=o.y;o.x=x;o.y=y;fxs('portal',b.x,b.y,30,.4);fxs('portal',o.x,o.y,30,.4);}return .6;},
  essenceOfRed(b){b.essence=true;toast('红龙精华：大招冷却减半');return .4;},
  growingPool(b,p){G.pools.push({x:pl.x,y:pl.y,r:10,arm:.6,t:p.t||12,tick:0,dmg:(p.dmg||.25)*b.skd,grow:p.grow||3});return .6;},
  fixate(b,p){b.fixT=p.t||8;b.spd*=1.3;G.sched.push({t:p.t||8,fn:()=>{b.spd/=1.3;}});toast(`${b.name} 盯上了你！`);return .5;},
  enfeeble(b,p){pl.hp=Math.max(1,pl.hp*(p.p||.1));toast('衰弱！');return .6;},
  demonForm(b,p){b.frenzyT=1e9;b.dmg*=1.3;b.skd*=1.2;fxs('voidFire',b.x,b.y-10,b.w,.8);toast(`${b.name} 化身恶魔！`);return .8;},
  touchDot(b,p){b.passive=Object.assign({},b.passive,{touchDot:{t:p.t||6}});G.dotT=p.t||6;G.dotD=(p.dmg||.2)*b.skd/2;return .5;},
  aspectCycle(b,p,f){const o=p.order||[];if(!o.length)return .5;const q=o[(b._asp=(b._asp||0)+1)%o.length];if(q.say)b.say={n:q.say,t:1.4};return runSkill(b,q);},
  terrain(b,p){const r=R();for(const side of p.rects||[{side:'left'},{side:'right'}])for(let y=r.y+14;y<r.y+r.h;y+=24)G.pools.push({x:side.side==='left'?r.x+10:r.x+r.w-10,y,r:12,arm:0,t:1e9,tick:0,dmg:b.skd*.04,slow:true,terrain:true});toast('两侧的软泥会减速');return .6;},
  rotatingRect(b,p,f){SK.sweep.start(b,f);return b.at;},
  beamBlock(b,p){G.beams3={t:p.swap||15,b,cols:['#ff4a4a','#5aff6a','#5aa4ff'].map((c,i)=>{const r=R(),a=i*TAU/3+rand();return{c,x:b.x+Math.cos(a)*120,y:b.y+Math.sin(a)*120};})};toast('站进光束挡住它：绿光不挡首领会回血');return .8;},
  chessBoard(b,p){b.shield={kind:'immune',t:1e9};const r=R();for(let i=0;i<6;i++){const e=spawnAt(r.x+20+i*(r.w-40)/5,r.y+r.h-30,i%2?'SK':'SL');e.hp=e.max*=3;e.name='棋子';e.chess=b;}toast('棋局：先吃掉对方的棋子，国王才能被攻击');return .8;},
  growth(b,p){b.skd*=1+(p.dmgAdd||.15);b.dmg*=1+(p.dmgAdd||.15);b.growN=(b.growN||0)+1;num(b.x,b.y-30,'成长 ×'+b.growN,'#ff9a4a',true);return .5;},
  groundSlam(b,p,f){const r=R(),a=angTo(b,pl);pl.x=clamp(pl.x+Math.cos(a)*(p.knock||80),r.x+6,r.x+r.w-6);pl.y=clamp(pl.y+Math.sin(a)*(p.knock||80),r.y+6,r.y+r.h-6);pl.frozenT=p.petrify||2;fxs('quake',b.x,b.y,120,.5);toast('石化！');G.sched.push({t:p.petrify||2,fn:()=>runSkill(b,p.then||{e:'tel',t:'circle',at:'player',r:30,T:.6,dmg:1.5})});return (p.petrify||2)+.8;},
  gravityLapse(b,p){G.lapse={t:p.t||15,spd:p.spd||1.3};G.orbs=G.orbs||[];const o=p.orbs||{n:4};for(let i=0;i<(o.n||4);i++){const s=randInRoom(20);G.orbs.push({x:s.x,y:s.y,t:p.t||15,r:o.r||16,dmg:(o.dmg||.5)*b.skd,spd:o.spd||20});}toast('引力失效：躲开奥术球');return 1;},
  felRage(b,p){G.felRage={t:p.t||10,mul:p.playerDmg||1.5};pl.shield=Math.max(pl.shield,pl.maxHp*(p.playerShield||.3));b.taken=p.bossTaken||1.3;b.fixT=p.t||10;G.sched.push({t:p.t||10,fn:()=>{b.taken=1;}});toast('邪能狂怒：你变强了，但首领只盯着你');return .8;},
  beamCycle(b,p,f){const bm=p.beam||{e:'tel',t:'beam',w:6,T:.8,dmg:.6,eff:'dot'};for(let i=0;i<4;i++)ENG.tel(b,Object.assign({},bm,{at:'fixed',a:i*Math.PI/2+rand()*.4}),f);return 1.2;},
  bombGrid(b,p,f){const r=R();b.x=r.cx;b.y=r.y+r.h/2;const safe=randInRoom(30);for(let i=0;i<(p.n||30);i++){const s=randInRoom(10);if(Math.hypot(s.x-safe.x,s.y-safe.y)<26)continue;b.tels.push(tel('circle',{x:s.x,y:s.y,r:p.r||14},(p.T||3)*f+i*.02,(p.dmg||2)*b.skd));}toast('火焰炸弹：找空隙！');return (p.T||3)*f+.5;},
  siphonSoul(b,p){const role=CLS[G.cls].role,mel=AT[CLS[G.cls].atk].melee;b.siph={t:p.t||30,kind:role.includes('heal')?'heal':mel?'melee':'ranged'};toast(`灵魂虹吸：首领学会了${{heal:'治疗',melee:'旋风斩',ranged:'齐射'}[b.siph.kind]}`);
    if(b.siph.kind==='melee')b.aura={r:40,t:6,dmg:.35*b.skd,tick:.5,k:0,warm:.8,spd:.6};else if(b.siph.kind==='ranged')ENG.shots(b,{p:'volley',n:7,spd:80,dmg:.6});else castOn(b,{n:'治疗',T:2.5,need:4,then:()=>{b.hp=Math.min(b.max,b.hp+b.max*.08);}});return 1;},
  realm(b,p){G.realm={t:p.t||20,tint:p.tint||'#4a2a6a',n:p.realm};b.shield={kind:'reduce',t:p.t||20,pct:.25};const n=(p.enemies||[]).length+(p.illusions||0)||2;
    for(let i=0;i<n;i++){const s=randInRoom(30),e=spawnAt(s.x,s.y,'SK');e.hp=e.max*=4;e.name=(p.enemies||[])[i]||'幻象';e.realm=true;}toast('进入另一个位面：击败那里的敌人');return 1;},
  tsunami(b,p,f){const r=R(),lanes=4,safe=(rand()*lanes)|0,w=r.w/lanes;for(let i=0;i<lanes;i++)if(i!==safe)b.tels.push(tel('rect',{x:r.x+i*w,y:r.y,w,h:r.h},(p.t||3)*f,(p.dmg||2)*b.skd));toast('烈焰海啸：躲进安全的那一列');return (p.t||3)*f+.4;},
  rangedPunishSkill(b,p){if(Math.hypot(pl.x-b.x,pl.y-b.y)>(p.d||60)){const a=angTo(b,pl);shots.push({x:b.x,y:b.y,vx:Math.cos(a)*110,vy:Math.sin(a)*110,life:3,dmg:(p.dmg||1.6)*b.skd,col:'#9a9a9a'});toast('石化吐息：靠近首领！');}return .6;},
  attuned(b,p){b.attuned=p.stacks||150;b.skd0=b.skd;toast(`自然之力 ${b.attuned} 层：击杀小怪削减层数`);return .5;},
  absorbCheck(b,p){G.absorb={t:p.t||12,need:b.max*(p.need||.05),hp0:b.hp,got:0,b,fail:p.fail};toast('焚化血肉：在倒计时内打出足够伤害！');return .6;},
  championAI(b,p){const ids=CLS_IDS.filter(c=>c!==G.cls);for(let i=0;i<(p.n||4);i++){const c=ids[(rand()*ids.length)|0],C=CLS[c],e=spawnAt(b.x+(i-1.5)*30,b.y+10,AT[C.atk].melee?'SK':'SA');e.hp=e.max=b.max*.12;e.dmg=b.dmg*.6;e.name=C.n+'（冠军）';if(C.port){e.art=[C.port];e.w=e.h=22;}}b.shield={kind:'immune',t:1e9};b.hidden=true;b.champions=true;toast('阵营冠军：击败所有敌方英雄');return 1;},
  deckCannon(b,p){const r=R();b.cannons=[];for(let i=0;i<(p.n||2);i++){const x=r.x+30+i*(r.w-60),y=r.y+r.h-30;b.cannons.push({x,y,k:0});}b.shipDmg=p.shipDmg||.05;b.shield={kind:'immune',t:1e9};toast('站上火炮轰击敌舰');return .8;},
  inhaleBlight(b,p,f){b.inhale=(b.inhale||0)+1;b.skd*=1+(p.dmgAdd||.3);num(b.x,b.y-30,'吸入 ×'+b.inhale,'#7aff5a',true);if(b.inhale>=(p.stacks||3)){b.inhale=0;return runSkill(b,p.then||{e:'tel',t:'rect',at:'fixed',w:192,h:256,T:1.5,dmg:3});}return .8;},
  invocation(b,p){const bs=en.filter(e=>e.boss&&!e.dead),k=bs[(rand()*bs.length)|0];for(const e of bs)e.shield=e===k?null:{kind:'reduce',t:p.every||30,pct:p.otherTaken||.1};if(k){k.empowered=true;num(k.x,k.y-30,'祈求之血','#ff4a4a',true);toast(`只有 ${k.name} 受到全额伤害`);}return .6;},
  vampire(b,p){G.vamp={t:p.thirstT||15,mul:p.playerDmg||2,fail:p.fail};toast('吸血鬼之咬：伤害翻倍，15 秒内多杀敌否则被控制');G.vampKills=0;return .6;},
  twinBeam(b,p){G.cutter={t:12,a:rand()*TAU,va:p.spd||.6,w:p.w||8,dmg:(p.dmg||2)*b.skd};toast('暮光切割者：躲开旋转的光束');return .8;},
  _fallback(b,p,f){return ENG.tel(b,{t:'circle',at:'player',r:p.r||20,T:.9,dmg:p.dmg||1},f);},
};
function runSkill(b,p){const fn=ENG[p.e]||ENG.tel;return fn(b,p,b.ph2||b.frenzyT>0?.75:1);}
// 把 skills 里的数据技能包装成主脚本 SK 的形状（start/tick/end）
function wrapSkills(b,skills){
  b.skills=skills||{};b.skx={};
  for(const k in b.skills){
    const p=b.skills[k];
    if(!p||(SK[k]&&!p.e))continue;
    if(p.e==='builtin'&&SK[p.k]){b.skx[k]=SK[p.k];continue;}
    b.skx[k]={start(bb,f){const d=(ENG[p.e]||ENG.tel)(bb,p,f);bb.at=Math.max(.4,d||1);},tick(){},end(){}};
  }
}
window.raidAdds=(b,list)=>{const out=[];for(const a of [].concat(list)){if(!a||typeof a!=='object')continue;const n=a.count||3;
  for(let i=0;i<n;i++){const ang=i*TAU/n,t=RAIDS[LV[G.L].ri].trash[a.k||a.n];
    const e=spawnAt(b.x+Math.cos(ang)*(a.ring||40),b.y+Math.sin(ang)*(a.ring||40),a.base||(t&&t.base)||'SK');
    if(t)applyTrash(e,t);e.name=a.n||e.name;e.hp=e.max*=(a.hp||1);
    const fr=frames(a.art,1);if(fr){e.art=[fr[0]];e.w=e.h=a.size||22;}
    if(a.ab)e.abx=a.ab.map(x=>Object.assign({t:2+rand()*2},x));
    if(a.link&&a.link.bossDmgTaken){b.link={mul:a.link.bossDmgTaken,alive:()=>en.some(q=>q.linkTo===b&&!q.dead)};e.linkTo=b;}out.push(e);}}return out;};
// 阶段里的 adds 可以写名字（对应首领 adds 表），也可以不写而由 end:{adds:true} 表示“刷出本首领的阶段召唤物并全部击杀”
function resolveAdds(b,o){
  const d=b.data||{},list=d.adds||[];let spec=o.adds;
  if(!spec&&o.end&&o.end.adds)return list.filter(a=>a.at==='phase');
  if(typeof spec==='string'){const names=spec.split(/\s*\/\s*/);return list.filter(a=>a.n===spec||names.includes(a.n)).concat(list.length?[]:[{n:spec,count:4}]).slice(0,list.length?99:1);}
  return [].concat(spec||[]).map(x=>typeof x==='string'?list.find(a=>a.n===x)||{n:x,count:3}:x);
}
window.phaseStart=(b,o)=>{
  const adds=resolveAdds(b,o);const made=adds.length?raidAdds(b,adds):[];
  // 结束条件：adds 全灭 / after 秒 / dur 秒；数据里专用的条件（萨拉、大脑、法力盾、目标物……）统一回退为“召唤物全灭或 22 秒”
  const E=o.end||{},odd=Object.keys(E).some(k=>k!=='adds'&&k!=='after');
  if(o.end||o.dur||o.inv===true){
    const after=E.after||o.dur||(odd||!o.end?22:0),byAdds=!!E.adds||(odd&&made.length>0);
    b.phEnd={o:Object.assign({},o,{end:{adds:byAdds,after}}),adds:made,t:after,el:0};if(o.inv!==false)b.inv=true;}
};

// ---------- 生成首领：在原 spawnBoss 结果上套用数据 ----------
const _spawnBoss=spawnBoss;
spawnBoss=function(big){
  const v=LV[G.L],d=v&&v.b;
  _spawnBoss(big);
  let d0=d;const b=G.boss;if(!b||!d)return;
  if(!big){if(d.elite)makeElite(b,v);return;}
  if(d.variants&&d.variants.length){d0=Object.assign({},d,d.variants[(rand()*d.variants.length)|0]);}
  return spawnData(b,v,d0);
};
function spawnData(b,v,d){
  b.name=d.n;b.hp=b.max=b.max*(d.hp||1);
  b.fury=d.enrage||b.fury;
  if(d.spd!==undefined)b.spd=d.spd;
  if(d.fixed)b.spd=0;
  const f=frames(d.art,4)||(fb(d.fallback)&&[fb(d.fallback)])||(ART.bosses&&[ART.bosses[d.fallbackArt]]);
  if(f){b.art=f.length>=2?[f[0],f[1]]:[f[0]];b.artAtk=f[3]||f[2]||null;b.w=b.h=d.size||(v.last?64:54);}
  wrapSkills(b,d.skills);
  b.sk=(d.sk&&d.sk.length?d.sk:b.sk).filter(k=>b.skx[k]||SK[k]);
  if(!b.sk.length)b.sk=['slam'];
  b.autoSk=(d.auto||[]).map(a=>Object.assign({t:a.every||6},a));
  b.ph=(d.ph||[]).filter(o=>o.at!==undefined).map(o=>[o.at,o]);b.phi=0;
  b.tph=(d.ph||[]).filter(o=>o.at===undefined&&(o.t!==undefined||o.every)).map(o=>Object.assign({k:o.every?o.every:o.t,on:false},o));   // 按时间 / 周期触发的阶段
  if(d.start&&d.start.hp)b.hp=b.max*d.start.hp;
  for(const a of d.auto||[])if(a.once){const p=(d.skills||{})[a.k];if(p)runSkill(b,p);}
  b.autoSk=b.autoSk.filter(a=>!a.once);
  if(d.objective&&d.objective.mode==='destroy'){const n=d.objective.n||4;b.inv=true;b.objs=[];for(let i=0;i<n;i++){const s=randInRoom(30),e=spawnAt(s.x,s.y,'EGG');e.pt2=1e9;e.hp=e.max=e.max*(d.objective.hp||2);e.name=d.objective.prop||'目标';b.objs.push(e);}toast(d.objective.msg||`先摧毁 ${n} 个${d.objective.prop||'目标'}！`);}
  if(d.passive)b.passive=d.passive;
  b.data=d;
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
  if(d.open){const o=d.open;if(o.msg)toast(o.msg);if(o.inv)b.inv=true;phaseStart(b,o);
    if(o.go&&(b.skx[o.go]||SK[o.go])){b.mode=o.go;b.say={n:skName(b,o.go),t:1.6};skOf(b,o.go).start(b,1);}}
  if(d.tip)setTimeout(()=>toast(d.tip),1500);
}

function applyPhase(b,o,on){
  if(on){if(o.msg)toast(o.msg);if(o.sk){o._sk=b.sk;b.sk=o.sk.filter(k=>b.skx[k]||SK[k]);}if(o.form!==undefined)b.formArt=formOf(o.form);if(o.inv)b.inv=true;if(o.heal)b.hp=b.max;
    phaseStart(b,o);if(o.go&&(b.skx[o.go]||SK[o.go])){endSkill(b);b.mode=o.go;b.say={n:skName(b,o.go),t:1.6};skOf(b,o.go).start(b,1);}}
  else{if(o._sk)b.sk=o._sk;if(o.form!==undefined)b.formArt=null;if(o.inv)b.inv=false;}
}
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
    for(const o of b.tph||[]){if(o.every){if(!o.on&&(o.k-=dt)<=0){o.on=true;o.left=o.dur||10;applyPhase(b,o,true);}else if(o.on&&(o.left-=dt)<=0){o.on=false;o.k=o.every;applyPhase(b,o,false);}}
      else if(!o.done&&(b.age||0)>=o.t){o.done=true;applyPhase(b,o,true);}}
    if(b.phEnd){const E=b.phEnd;E.el+=dt;const addsDone=E.o.end.adds&&(!E.adds.length||E.adds.every(q=>q.dead));
      if(addsDone||(E.t&&E.el>=E.t)){b.phEnd=null;b.inv=false;b.hidden=false;if(E.o.form!==undefined)b.formArt=null;toast(`${b.name}：${E.o.endMsg||'阶段结束，可以攻击了'}`);}}
    if(b.objs&&b.objs.every(q=>q.dead)){b.objs=null;b.inv=false;toast(`${b.name} 失去了保护！`);}
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
  for(const q of G.pools){if(q.grow)q.r=Math.min(60,q.r+q.grow*dt);if(q.slow&&Math.hypot(pl.x-q.x,pl.y-q.y)<q.r)G.pSlowT=Math.max(G.pSlowT||0,.3);}   // 不断扩大的池子 / 减速地形
  const B=G.boss;
  if(G.beams3){const M=G.beams3;M.t-=dt;let green=false;for(const c of M.cols){const hit=rayNear(c,angTo(c,M.b),pl.x,pl.y,6)&&Math.hypot(pl.x-c.x,pl.y-c.y)<Math.hypot(M.b.x-c.x,M.b.y-c.y);if(hit&&c.c==='#5aff6a')green=true;if(hit&&c.c==='#ff4a4a')addStack('vuln',10,3);}
    if(!green&&!M.b.dead)M.b.hp=Math.min(M.b.max,M.b.hp+M.b.max*.004*dt*30/30);if(M.t<=0||M.b.dead)G.beams3=null;}
  if(G.orbs&&G.orbs.length){for(const o of G.orbs){o.t-=dt;const a=angTo(o,pl);o.x+=Math.cos(a)*o.spd*dt;o.y+=Math.sin(a)*o.spd*dt;if(Math.hypot(pl.x-o.x,pl.y-o.y)<o.r*.6&&pl.inv<=0){hurt(o.dmg);o.t=0;}}G.orbs=G.orbs.filter(o=>o.t>0);}
  if(G.lapse&&(G.lapse.t-=dt)<=0)G.lapse=null;
  if(G.felRage&&(G.felRage.t-=dt)<=0)G.felRage=null;
  if(G.realm&&(G.realm.t-=dt)<=0)G.realm=null;
  if(G.vamp){G.vamp.t-=dt;if(G.vamp.t<=0){if((G.vampKills||0)<2&&G.boss)ENG.mindControl(G.boss,{t:3});G.vamp=null;}}
  if(G.cutter){const C=G.cutter;C.t-=dt;C.a+=C.va*dt;const r=R(),c={x:r.cx,y:r.y+r.h/2};if((rayNear(c,C.a,pl.x,pl.y,C.w)||rayNear(c,C.a+Math.PI,pl.x,pl.y,C.w))&&pl.inv<=0){pl.inv=0;hurt(C.dmg);}if(C.t<=0)G.cutter=null;}
  if(G.absorb){const A=G.absorb;A.t-=dt;A.got=A.hp0-A.b.hp;if(A.got>=A.need){toast('吸收盾已打破！');G.absorb=null;}else if(A.t<=0){runSkill(A.b,A.fail||{e:'tel',t:'circle',at:'player',r:60,T:.6,dmg:2});G.absorb=null;}}
  if(B&&B.chess&&!en.some(e=>e.chess&&!e.dead)){}
  for(const e of en){if(e.dead||!e.boss)continue;
    if(e.attuned!==undefined&&e.skd0)e.skd=e.skd0*(1+.004*e.attuned);   // 自然之力：层数越多伤害越高
    if(e.shield&&e.shield.t>1e8&&e.shield.kind==='immune'){
      if(e.cannons){for(const c of e.cannons)if(Math.hypot(pl.x-c.x,pl.y-c.y)<12){if((c.k+=dt)>=1){c.k=0;e.hp-=e.max*e.shipDmg;fxs('explosion',e.x,e.y,40,.4);num(e.x,e.y-20,'开炮！','#ffd77a',true);if(e.hp<=0){e.shield=null;e.hp=0;kill(e);}}}else c.k=0;}
      else if(e.champions){if(!en.some(q=>!q.dead&&!q.boss&&q.name&&q.name.endsWith('（冠军）'))){e.shield=null;e.hidden=false;e.hp=1;}}
      else if(!en.some(q=>q.chess===e&&!q.dead)&&en.some(q=>q.chess===e)){e.shield=null;toast('国王失去了保护！');}}}
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
  if(G.realm){g.globalAlpha=.18;g.fillStyle=G.realm.tint;const r=R();g.fillRect(r.x,r.y,r.w,r.h);g.globalAlpha=1;}
  if(G.beams3)for(const c of G.beams3.cols){g.strokeStyle=c.c;g.globalAlpha=.7;g.lineWidth=3;g.beginPath();g.moveTo(c.x,c.y);g.lineTo(G.beams3.b.x,G.beams3.b.y);g.stroke();g.globalAlpha=1;if(FX.portal)g.drawImage(FX.portal,c.x-10,c.y-10,20,20);}
  if(G.orbs)for(const o of G.orbs){if(PJ.orb)g.drawImage(PJ.orb,o.x-o.r*.6,o.y-o.r*.6,o.r*1.2,o.r*1.2);}
  if(G.cutter){const C=G.cutter,r=R(),c={x:r.cx,y:r.y+r.h/2};g.save();g.translate(c.x,c.y);g.rotate(C.a);if(FX.beam)g.drawImage(FX.beam,-300,-C.w*1.5,600,C.w*3);g.restore();}
  for(const e of en)if(e.cannons&&!e.dead)for(const c of e.cannons){if(IT.turret)g.drawImage(IT.turret,c.x-9,c.y-12,18,18);g.strokeStyle='rgba(255,215,90,.6)';g.beginPath();g.arc(c.x,c.y,12,0,TAU);g.stroke();}
  if(G.absorb){g.font='bold 7px sans-serif';g.fillStyle='#ffb84a';g.fillText(`吸收盾 ${Math.min(100,Math.round(G.absorb.got/G.absorb.need*100))}% · ${Math.ceil(G.absorb.t)}s`,pl.x,pl.y-26);}
  if(G.mcT>0){g.font='bold 8px sans-serif';g.fillStyle='#c060ff';g.fillText('👁',pl.x,pl.y-20);}
  g.restore();
};
})();
