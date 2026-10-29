// 团本引擎：把 content/raids_data.js（格式见 design/dsl.md）变成可运行的副本 / 首领 / 小怪。
// 由 game.html 在主脚本之后加载；依赖主脚本里的全局（G、pl、en、SK、tel、spawnAt、hurt、dmg……）。
(function(){
'use strict';
const D=window.RAID_DATA;
// 画面上的身高（像素，不含留白）：按体型排，小怪默认 20（主角约 26）、首领默认 58、本关精英 = 该小怪 ×1.7、首领带的精英小怪 ×1.35；绘制时按图里实际身高换算缩放（只影响画面，不改碰撞）
const VIS={onyxian_whelp:15,corrupted_whelp:15,hivezara_wasp:16,qiraji_gladiator:24,shrieker_scarab:15,core_hound:19,zulian_tiger:20,hivezara_stinger:17,
  molten_giant:35,black_dragonspawn:31,death_talon_wyrmguard:31,anubisath_guardian:36,obsidian_destroyer:32,gurubashi_berserker:28,razzashi_broodwidow:24,firelord:27,
  'mc/lucifron':50,'mc/shazzrah':50,'mc/sulfuron_harbinger':50,'mc/majordomo_executus':50,'zg/jindo_the_hexxer':48,'zg/high_priestess_arlokk':50,'zg/high_priest_venoxis':52,'aq20/ayamiss_the_hunter':52,
  'mc/golemagg_the_incinerator':62,'mc/garr':60,'mc/ragnaros':80,'ony/onyxia':75,'bwl/razorgore_the_untamed':62,'bwl/firemaw':65,'bwl/ebonroc':65,'bwl/flamegor':65,'bwl/chromaggus':68,'bwl/nefarian':75,
  'zg/gahzranka':62,'zg/hakkar':68,'aq20/moam':65,'aq20/buru_the_gorger':60,'aq20/kurinnaxx':60,'aq20/ossirian_the_unscarred':68};
if(!D||!D.raids)return;

// ---------- 精灵表按需加载（art/<表名>.png，横排正方形帧） ----------
const SHEET={};
// 逐帧图里画出格子的部分（龙的吐息、长武器、特效）会被格子边一刀切掉成方块：贴边一圈按距离渐隐
// 画面被格子边切断（如龙喷息）时只把碰到的那条边淡出；脚底贴底边是正常的，不处理底边，头顶也不会被误淡化
function edgeFade(c){if(!c||!c.getContext)return;const w=c.width,h=c.height,x=c.getContext('2d',{willReadFrequently:true}),d=x.getImageData(0,0,w,h),a=d.data,m=Math.max(3,Math.round(Math.min(w,h)*.1));
  const touch=(x0,y0,dx,dy,n)=>{let k=0;for(let i=0;i<n;i++)if(a[((y0+dy*i)*w+x0+dx*i)*4+3]>40)k++;return k>2;};
  const T=touch(0,0,1,0,w),L=touch(0,0,0,1,h),R=touch(w-1,0,0,1,h);if(!T&&!L&&!R)return;
  for(let y=0;y<h;y++)for(let i=0;i<w;i++){let e=m;if(T)e=Math.min(e,y);if(L)e=Math.min(e,i);if(R)e=Math.min(e,w-1-i);if(e<m)a[(y*w+i)*4+3]*=e/m;}
  x.putImageData(d,0,0);}
function sheet(name){
  if(!name)return null;
  const s=SHEET[name];
  if(s)return s.f;
  SHEET[name]={f:null};
  const im=new Image();
  im.onload=()=>{const f=strip(im,Math.max(1,Math.round(im.width/im.height)));if(/^(bosses_|mobs_|adds_)/.test(name))f.forEach((c,i)=>{trimBleed(c);edgeFade(c);
      // 读过像素的画布会被浏览器降级成软件画布（内存双份、绘制慢）：处理完复制到一张干净画布，身高先算好缓存
      const n=document.createElement('canvas');n.width=c.width;n.height=c.height;n.getContext('2d').drawImage(c,0,0);n.isArt=true;if(window.frameH)n._bh=frameH(c);f[i]=n;});
    // 图集已由 tools/artprep.swift 离线清理、对齐（去残渣/串格碎片/绿边、同组统一缩放与脚底锚点），运行时只切帧
    if(SHEET[name])SHEET[name].f=f;};   // 加载途中换副本会被 evictOthers 清掉
  im.onerror=()=>{if(SHEET[name])SHEET[name].bad=true;};
  im.src='art/'+name+'.png?v='+VERSION;
  return null;
}
// ref=[表名, 主体序号]；per=每个主体几帧（首领 4：待机/移动/攻击/施法；小怪 3：待机/走路/攻击）
// 相邻格的精灵渗进本格底部：脚下隔着空行的一小撮像素清掉，再把主体落回底边
function softEdge(c){const w=c.width,h=c.height,x=c.getContext('2d',{willReadFrequently:true}),d=x.getImageData(0,0,w,h),a=d.data,m=Math.max(4,w*.14);
  for(let y=0;y<h;y++)for(let i=0;i<w;i++){const p=(y*w+i)*4;if(!a[p+3])continue;const lum=Math.max(a[p],a[p+1],a[p+2]);if(lum<34||a[p+3]<26){a[p+3]=0;continue;}
    const e=Math.min(i,y,w-1-i,h-1-y);if(e<m)a[p+3]=a[p+3]*Math.pow(e/m,1.5);}
  x.putImageData(d,0,0);}
function trimBleed(c){
  const w=c.width,h=c.height,x=c.getContext('2d',{willReadFrequently:true}),d=x.getImageData(0,0,w,h),a=d.data,r=new Array(h).fill(0);let tot=0;
  for(let y=0;y<h;y++)for(let i=0;i<w;i++)if(a[(y*w+i)*4+3]>40){r[y]++;tot++;}
  if(!tot)return;
  let y=h-1,low=0;while(y>0&&!r[y])y--;while(y>0&&r[y]>0)low+=r[y--];   // 从最低的非空行算起（脚底一般离底边留 1~2 行）
  let gap=0;while(y>0&&r[y]===0){gap++;y--;}
  let bot=h-1;while(bot>0&&!r[bot])bot--;
  if(low&&gap>=2&&low<=tot*.15&&y>=h*.3){x.clearRect(0,y+gap+1,w,h);bot=y;}
  const sh=h-2-bot;if(sh<=0)return;
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
  im.onerror=()=>{SHEET['t:'+name]='bad';};
  im.src='art/'+name+'.png?v='+VERSION;
}
// fallback:[现有图集名, 帧序号]，新图还没生成时用现有美术
const fb=ref=>Array.isArray(ref)&&ART[ref[0]]&&ART[ref[0]][ref[1]]||null;
// 动作集：首领 <表名>z 12 帧（待机×2/走路×4/蓄力/出手/收招/施法×2/受击），小怪 <表名>x 6 帧（待机/走A/走B/蓄力/出手/受击）；新表没到就用旧表 4/3 帧凑
window.raidSheet=sheet;   // 分件骨骼（src/rig.js）用同一个图集加载器
window.animOf=e=>{const r=e.animRef;if(!r)return null;if(e._an&&e._an.full)return e._an;const B=e.animPer===4,n=frames([r[0]+(B?'z':'x'),r[1]],B?12:6);
  if(n&&n.length===(B?12:6))return e._an=B?{full:true,idle:[n[0],n[1]],walk:[n[2],n[3],n[4],n[5]],wind:n[6],atk:n[7],rec:n[8],cast:[n[9],n[10]],hurt:n[11]}
    :{full:true,idle:[n[0]],walk:[n[1],n[0],n[2],n[0]],wind:n[3],atk:n[4],rec:n[4],cast:[n[3],n[4]],hurt:n[5]};
  if(e._an)return e._an;const o=frames(r,e.animPer);if(!o)return null;
  return e._an=B?{idle:[o[0]],walk:[o[1],o[0]],wind:o[2],atk:o[2],rec:o[2],cast:[o[3]||o[2],o[3]||o[2]],hurt:null}:{idle:[o[0]],walk:[o[1],o[0]],wind:o[2],atk:o[2],rec:o[2],cast:[o[2],o[2]],hurt:null};};
// 技能动作类型：近身的预警 / 冲锋 / 内置近战技 = 挥砍；其余 = 施法
const MELEE_SK=/slam|cleave|charge|sweep|stomp|whirl|smash|bite|claw|tail|pounce|knock|swipe|cross/i;
// 技能射程：近身锥形 / 以首领为中心的小圈 = 近战，超出就不放；其余不限
window.skReach=(b,k)=>{const p=b.skills&&b.skills[k],bk=p&&p.e==='builtin'?p.k||k:!p?k:null;
  if(bk){if(/Cone|shadowflame|breath/i.test(bk))return 130;if(/wrath|slam|cleave|stomp/i.test(bk))return 48+(b.w||50)*.3;return Infinity;}
  if(p.e!=='tel')return Infinity;const t=p.t||'circle',at=p.at||(t==='circle'?'player':'boss');
  if(t==='cone'&&at==='boss')return (p.len||140)*.85;if(t==='circle'&&at==='boss'&&(p.r||20)<=60)return (p.r||20)+(b.w||50)*.3;return Infinity;};
window.skKind=(b,k)=>{const p=b.skills&&b.skills[k];if(p){if(p.e==='charge'||p.e==='followAura'||p.e==='grab'||p.e==='pull')return 'melee';if(p.e==='tel'&&(p.t==='cone'||(p.at==='boss'&&(p.r||20)<=50)))return 'melee';if(p.e==='builtin')return MELEE_SK.test(p.k||'')?'melee':'spell';return 'spell';}return MELEE_SK.test(k)?'melee':'spell';};
window.formOf=f=>Array.isArray(f)?((frames(f,1)||[null])[0]):FORM(f);

// ---------- 用数据重建关卡表：一个副本一章，一个首领一关 ----------
const OLD=RAIDS.slice();
const bioTheme=b=>OLD[(b-1)%OLD.length].bosses[0].theme;
RAIDS.length=0;
// 先只开放前 5 章（熔火之心 / 奥妮克希亚 / 黑翼之巢 / 祖尔格拉布 / 安其拉废墟），后面的数据保留不开
const OPEN_RAIDS=5;
for(const r of D.raids.slice(0,OPEN_RAIDS)){
  if(!r.bosses||!r.bosses.length)continue;
  const bio=r.bio||1;
  RAIDS.push({id:r.id,name:r.name,exp:r.exp||'classic',bio,desc:r.desc||'',tiles:r.tiles,trash:r.trash||{},props:r.props||[],
    bosses:r.bosses.map((b,k)=>Object.assign({},b,{lv:b.lv||b.n,rooms:3,theme:bioTheme(bio),
      art:b.art,fallbackArt:OLD[(bio-1)%OLD.length].bosses[k%3].art}))});
}
buildLV();
PROG.un=Math.min(PROG.un,NLV());
if(selLevel>NLV())selLevel=1;

// 进入一关前预载这一关要用的图
// 换副本时释放上一个副本的图集与瓦片（共享的特效表保留），防止一路打下来内存越积越多
let curRaid=null,G_VFX=[];
function evictOthers(r){const keep=new RegExp('_'+r.id+'(_|x|z|$)');
  for(const k in SHEET){const n=k.startsWith('t:')?k.slice(2):k;if(/^(fx_raid|bosses_fx|righ)/.test(n)||keep.test(n))continue;delete SHEET[k];if(k.startsWith('t:'))delete ART[n];}
  if(window.rigCache)for(const k in rigCache)if(!/^righ/.test(k)&&!keep.test(k))delete rigCache[k];
  for(const k in ART)if(/^tiles_/.test(k)&&!keep.test(k)&&!/^tiles_c\d$/.test(k))delete ART[k];}
function preload(L){
  const v=LV[L];if(!v)return;
  const r=RAIDS[v.ri],b=v.b;
  tilesOf(r.tiles);tilesOf(tilesFor(L));sheet('props_'+r.id);for(const n of ['black_1','black_2','black_3','green'])sheet('fx_raid_'+n);
  if(b.art){sheet(b.art[0]);sheet(b.art[0]+'z');}
  for(const x of [b].concat(b.multi||[])){const R=window.rigOf&&rigOf('boss',x.n);if(R){sheet(R.sheet);if(R.front)sheet(R.front);}}
  for(const k in r.trash){const R=window.rigOf&&rigOf('trash',k);if(R)sheet(R.sheet);}
  for(const ph of b.ph||[])if(Array.isArray(ph.form))sheet(ph.form[0]);
  for(const a of b.adds||[])if(a.art)sheet(a.art[0]);
  for(const m of b.multi||[])if(m.art){sheet(m.art[0]);sheet(m.art[0]+'z');}
  for(const t of Object.values(r.trash))if(t.art){sheet(t.art[0]);sheet(t.art[0]+'x');}
}
window.raidPreload=preload;
function levelSheets(L){const v=LV[L];if(!v)return{sheets:[],tiles:[]};const r=RAIDS[v.ri],b=v.b,S=new Set(['props_'+r.id,'fx_raid_black_1','fx_raid_black_2','fx_raid_black_3','fx_raid_green','bosses_fxfull','bosses_fx_sig_1','bosses_fx_sig_2','bosses_fx_sig_3','bosses_fx_sig_4']);
  if(Array.isArray(b.art)){S.add(b.art[0]);S.add(b.art[0]+'z');}for(const m of b.multi||[])if(Array.isArray(m.art)){S.add(m.art[0]);S.add(m.art[0]+'z');}
  for(const ph of b.ph||[])if(Array.isArray(ph.form))S.add(ph.form[0]);for(const a of b.adds||[])if(Array.isArray(a.art))S.add(a.art[0]);
  for(const t of Object.values(r.trash))if(Array.isArray(t.art)){S.add(t.art[0]);S.add(t.art[0]+'x');}
  if(window.rigOf){for(const x of [b].concat(b.multi||[])){const R=rigOf('boss',x.n);if(R){S.add(R.sheet);if(R.front)S.add(R.front);}}for(const k in r.trash){const R=rigOf('trash',k);if(R)S.add(R.sheet);}}
  return{sheets:[...S],tiles:[...new Set([r.tiles,tilesFor(L)].filter(Boolean))]};}
// 进关加载进度：图集要么加载完、要么确认不存在（404）才算就绪
// extra：关卡外还要等的图集（英雄分件等）；全部就绪后顺手把本关分件拼好，进关后不再现场裁图
// 自动战斗 AI 的机关目标：全屏技能前去安全点，有可踩的符文圈就去踩（打断型只在首领读条时踩）
window.aiGoal=()=>{const near=a=>{let best=null,bd=1e9;for(const q of a){const d=Math.hypot(q.x-pl.x,q.y-pl.y);if(d<bd){bd=d;best=q;}}return best;};
  for(const b of en){if(!b.boss||b.dead)continue;
    if(b.cast&&b.cast.flee){const r=R(),cs=[[r.x+10,r.y+10],[r.x+r.w-10,r.y+10],[r.x+10,r.y+r.h-10],[r.x+r.w-10,r.y+r.h-10]].map(([x,y])=>({x,y}));let best=cs[0],bd=0;for(const c of cs){const d=Math.hypot(c.x-b.x,c.y-b.y);if(d>bd){bd=d;best=c;}}return best;}
    if(G.pools.some(q=>q.buff==='poisonBlood')&&!(G.poisonBloodT>2))return near(G.pools.filter(q=>q.buff==='poisonBlood'));
    for(const t of b.tels||[])if(t.safeP&&!t.done){const p=t.safeP;
      if(p.safe==='pol'&&G.pol)return{x:R().cx-G.pol.sign*R().w*.3,y:pl.y};
      if(p.safe==='near')return near(en.filter(q=>!q.dead&&!q.boss&&q.def&&(q.def.ab||[]).some(a=>a.k==='safeSpot')));
      const s=near((b._spots||[]).filter(s=>s.k===p.safe&&G.t<s.until));if(s)return s;}
    if(b._pads){const P=b._pads.filter(q=>q.m&&!q.used);if(P.length&&(b._padMode!=='interrupt'||b.cast))return near(P);}
    // 离远了会被惩罚的首领（拉格纳罗斯岩浆冲击等）：远程也要待在惩罚距离以内
    {const P=b.passive||(b.data&&b.data.passive)||{},rp=P.rangedPunish;if(rp){const dd=Math.hypot(pl.x-b.x,pl.y-b.y),lim=(rp.d||70)*.8;if(dd>lim){const a=Math.atan2(pl.y-b.y,pl.x-b.x);return{x:b.x+Math.cos(a)*lim*.75,y:b.y+Math.sin(a)*lim*.75};}}}}
  return null;};
window.levelReady=(L,extra=[])=>{const{sheets:s0,tiles}=levelSheets(L),sheets=s0.concat(extra);for(const n of sheets)sheet(n);for(const t of tiles)tilesOf(t);
  let ok=0;for(const n of sheets)if(SHEET[n]&&(SHEET[n].f||SHEET[n].bad))ok++;for(const t of tiles)if(ART[t]||SHEET['t:'+t]==='bad')ok++;
  const total=sheets.length+tiles.length;if(ok>=total&&window.rigWarm){const v=LV[L],r=RAIDS[v.ri];for(const x of [v.b].concat(v.b.multi||[]))rigWarm(rigOf('boss',x.n));for(const k in r.trash)rigWarm(rigOf('trash',k));}
  return{ok,total};};
// 多区副本：首领序号 → 分区瓦片后缀（新瓦片没到时回落到副本通用瓦片）
const WING={naxx:[1,1,1,2,2,2,3,3,3,4,4,4,4,5,5],aq40:[0,0,0,0,0,0,0,0,1],uld:[0,0,0,0,0,0,0,0,0,0,0,0,1,2],toc:[0,0,0,0,1],icc:[0,0,0,0,1,1,1,2,2,2,0,3]};
function tilesFor(L){const v=LV[L],r=RAIDS[v.ri],w=(WING[r.id]||[])[v.k];return w?r.tiles+'_'+w:r.tiles;}
window.tilesFor=L=>{const t=tilesFor(L);return ART[t]?t:RAIDS[LV[L].ri].tiles;};
// 副本机关贴图：r.props 的第 i 项 = props_<副本> 的第 i 组（待机 / 触发两帧）
const MECH={vent:'vent',EGG:'egg',GRV:'grave',RFT:'rift'};
window.propArt=k=>{const r=RAIDS[LV[G.L]?LV[G.L].ri:0];const i=(r.props||[]).findIndex(p=>p.k===MECH[k]);return i<0?null:frames(['props_'+r.id,i],2);};
// 纯装饰：本副本里非机关的道具，每房随机摆 1~2 个（不参与战斗）
window.raidDecor=(L,type)=>{const r=RAIDS[LV[L].ri],ids=[];(r.props||[]).forEach((p,i)=>{if(!Object.values(MECH).includes(p.k)&&!/floor|lake|river|pool|water|patch|platform|zone|wall_of|chessboard|gate|edge|roots|lava|tile/i.test(p.k)&&!(p.every||p.hp||p.r||p.count))ids.push(i);});
  const out=[];if(!ids.length)return out;
  for(let k=0,n=type==='big'?2:1+(rand()<.5);k<n;k++){const i=ids[(rand()*ids.length)|0],q=randInRoom(30);out.push({x:q.x,y:q.y,s:type==='big'?34:28,f:()=>frames(['props_'+r.id,i],2)});}
  return out;};
const _newLevel=newLevel;
newLevel=function(L,ri){const rr=LV[L]&&RAIDS[LV[L].ri];if(rr&&curRaid!==rr.id){curRaid=rr.id;evictOthers(rr);}preload(L);if(LV[L+1])preload(L+1);return _newLevel(L,ri);};
const _renderLevels=renderLevels;
renderLevels=function(){preload(selLevel);const v=LV[selLevel];if(v)for(const bb of RAIDS[v.ri].bosses)if(Array.isArray(bb.art))sheet(bb.art[0]);return _renderLevels();};   // 选关地图要显示这个副本全部首领的头像

// ---------- 小怪：按本关的 trash 名单生成，带数据驱动的技能 ----------
// 每个副本的标志性小怪：只刷这些（权重越高越常见）；没列的副本按首领自己的名单
const ICONIC={
  mc:{core_hound:3,molten_giant:2,firelord:2},                       // 熔火恶犬、熔火巨人（大石头人）、火焰之王（小火元素）
  ony:{onyxian_whelp:4,onyxian_warder:2,black_dragonspawn:1,black_dragon_cultist:1},
  bwl:{death_talon_wyrmguard:3,blackwing_legionnaire:2,corrupted_whelp:2,blackwing_technician:2,blackwing_spellbinder:1},
  zg:{gurubashi_berserker:2,zulian_tiger:2,razzashi_broodwidow:2,gurubashi_axe_thrower:2,hakkari_witch_doctor:1},
  aq20:{qiraji_gladiator:2,hivezara_stinger:2,hivezara_wasp:2,anubisath_guardian:1,obsidian_destroyer:1},
  aq40:{anubisath_sentinel:2,vekniss_stinger:3,qiraji_lasher:2,anubisath_defender:1,qiraji_brainwasher:1,obsidian_eradicator:1},
  kara:{spectral_servant:2,spectral_charger:2,phantom_guest:2,arcane_anomaly_librarian:1,enchanted_broom:1},
  gruul:{gronn_giant:2,ogre_warrior:2,gronn_priest:1,rock_hound:2},
  mag:{hellfire_warder:2,hellfire_channeler:2,burning_abyssal:2,felhound:2},
  hyjal:{ghoul:3,abomination:2,gargoyle:2,shadowy_necromancer:1,fel_stalker:2,giant_infernal:1},
  ssc:{coilfang_guardian:2,coilfang_murloc:3,coilfang_priestess:1,coilfang_serpentguard:1,underbog_colossus:1},
  toc:{nerubian_burrower:3,swarm_scarab:3,snobold_vassal:2,argent_trainee:1,scourge_caster:1},
  os:{onyx_brood_general:1,onyx_flight_captain_sanctum_guardian:1,onyx_blaze_mistress:1,twilight_whelp:3},
  eoe:{nexus_lord:1,scion_of_eternity:2,azure_drake:2,arcane_elemental:2},
  voa:{archavon_warder:2,tempest_minion:2,frozen_orb:2,flame_warder:1},
  rs:{charscale_commander:1,charscale_invoker:2,charscale_assaulter:2,charscale_elite:1},
};
function levelTrash(){
  const v=LV[G.L];if(!v)return null;
  const r=RAIDS[v.ri],I=ICONIC[r.id],names=I?Object.keys(I):(v.b.trash&&v.b.trash.length?v.b.trash:Object.keys(r.trash));
  const out=[];for(const n of names){const t=r.trash[n];if(!t)continue;for(let w=0;w<(I?I[n]:1);w++)out.push(Object.assign({id:n},t));}
  return out;
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
  e.def=t;e.name=t.n||t.id;e.vis=VIS[t.id]||20;e._vk=0;e.rig=window.rigOf?rigOf('trash',t.id):null;e.rp=null;
  e.hp=e.max=e.hp*(t.hp||1);e.dmg*=(t.dmg||1);
  const f=frames(t.art,3);
  if(f){e.art=[f[0],f[1]];e.artAtk=f[2];e.w=e.h=t.size||18;e.animRef=t.art;e.animPer=3;}
  else if(fb(t.fallback)){e.art=[fb(t.fallback)];e.w=e.h=t.size||18;}
  for(const a of t.ab||[]){if(a.k==='resist'||a.k==='shield')e.shield={kind:'reduce',t:1e9,pct:a.pct||.5};if(a.k==='touchDot')e.touchDot=a;}
  e.abx=(t.ab||[]).filter(a=>!/^death|packRevive/.test(a.k)).map(a=>Object.assign({t:(a.cd||5)*(.4+rand()*.6)},a));
};
// 精英 = 本关指定的小怪，血量 ×4、技能更频繁
function makeElite(b,v){
  const r=RAIDS[v.ri],t=r.trash[v.b.elite];if(!t)return;
  b.name=t.n||v.b.elite;b.def=t;b.elite=true;b.vis=Math.round((VIS[v.b.elite]||20)*1.7);b._vk=0;b.rig=window.rigOf?rigOf('trash',v.b.elite):null;b.rp=null;
  const f=frames(t.art,3);
  if(f){b.art=[f[0],f[1]];b.artAtk=f[2];b.animRef=t.art;b.animPer=3;}
  b.abx=(t.ab||[]).map(a=>Object.assign({t:1},a,{cd:(a.cd||5)*.7}));
}

// 小怪技能（mobAbility）
function mobTick(e,dt){
  if(!e.abx||e.dead||e.frozenT>0||e.wind>0||e.dash>0)return;
  const d=Math.hypot(pl.x-e.x,pl.y-e.y);
  for(const a of e.abx){
    if((a.t-=dt)>0)continue;
    if(!a.range&&(/^(nova|fear|stacks)$/.test(a.k)||(a.k==='tel'&&a.at==='self')))a.range=(a.r||24)+20;
    if(a.range&&d>a.range){a.t=.5;continue;}
    a.t=a.cd||5;
    const D=(a.dmg||1)*e.dmg,T=a.T||.7;
    e.castAt=G.t;e.castDur=Math.min(1.4,Math.max(.55,T));e.castK=/pounce|chargeLine|stacks|onHit/.test(a.k)?'melee':'spell';
    switch(a.k){
      case'pounce':e.wind=a.wind||.35;e.tx=pl.x;e.ty=pl.y;break;
      case'chargeLine':e.wind=T;e.tx=pl.x;e.ty=pl.y;G.etels.push({t:'line',x:e.x,y:e.y,a:angTo(e,pl),len:a.len||80,w:a.w||5,left:T,dmg:0,col:'#ff6a6a',vis:1});break;
      case'nova':G.etels.push({t:'circle',x:e.x,y:e.y,r:a.r||24,left:T,dmg:D,col:'#ff8a5a'});if(a.eff)G.sched.push({t:T,fn:()=>{if(Math.hypot(pl.x-e.x,pl.y-e.y)<(a.r||24)+4)applyEff(a.eff,e);}});break;
      case'aoeAtPlayer':G.etels.push({t:'circle',x:pl.x,y:pl.y,r:a.r||16,left:T,dmg:D,col:'#ff6a6a'});if(a.eff)effAt(pl.x,pl.y,a.r||16,T,a.eff);break;
      case'beam':G.etels.push({t:'line',x:e.x,y:e.y,a:angTo(e,pl),len:a.len||95,w:a.w||4,left:T,dmg:D,col:'#ff4a8a'});break;
      case'volley':{const n=a.n||3;for(let i=0;i<n;i++){const ang=angTo(e,pl)+(i-(n-1)/2)*.25;shots.push({x:e.x,y:e.y,vx:Math.cos(ang)*(a.spd||75),vy:Math.sin(ang)*(a.spd||75),life:2.5,dmg:D*.6,col:a.col||'#ff7a4a',fire:a.fire,im:projIm(e.name),spin:/斧/.test(e.name||'')});}break;}
      case'blink':{const ang=rand()*TAU,r=50+rand()*30;fxs('smoke',e.x,e.y,18,.3);e.x=clamp(pl.x+Math.cos(ang)*r,G.rm.x+8,G.rm.x+G.rm.w-8);e.y=clamp(pl.y+Math.sin(ang)*r,G.rm.y+8,G.rm.y+G.rm.h-8);pushOut(e,3);fxs('portal',e.x,e.y,18,.3);break;}
      case'summon':{const n=a.n||1;if(en.filter(q=>!q.dead).length>24)break;for(let i=0;i<n;i++){const s=spawnAt(e.x+rand()*16-8,e.y+rand()*16-8,a.base||'BT');s.hp=s.max*=a.hp||.5;}break;}
      case'buffAllies':for(const q of en)if(!q.dead&&!q.boss&&Math.hypot(q.x-e.x,q.y-e.y)<(a.r||50)){q.spd*=1.25;q.dmg*=1.15;}fxs('levelup',e.x,e.y,30,.5);break;
      case'heal':castOn(e,{n:'治疗',T:a.T||2,need:a.need||3,then:()=>{const t=en.filter(q=>!q.dead&&!q.prop&&Math.hypot(q.x-e.x,q.y-e.y)<80).sort((x,y)=>x.hp/x.max-y.hp/y.max)[0];if(t){t.hp=Math.min(t.max,t.hp+t.max*(a.pct||.3));fxs('heal',t.x,t.y,20,.5);}}});break;
      case'fear':effAt(e.x,e.y,a.r||40,T,'fear');G.etels.push({t:'circle',x:e.x,y:e.y,r:a.r||40,left:T,dmg:0,col:'#b46aff'});break;
      case'mc':G.etels.push({t:'circle',x:pl.x,y:pl.y,r:a.r||14,left:T,dmg:0,col:'#b46aff'});effAt(pl.x,pl.y,a.r||14,T,'mc');break;
      case'stacks':case'onHit':if(d<(a.r||14)){if(a.knock)applyEff('knock',e);else if(a.bossEnergy){const B=G.boss;if(B&&B.mpRate)B.mp=(B.mp||0)+a.bossEnergy*5;}else addStack(a.kind||'vuln',a.max||5,a.decay||6);}break;
      case'tel':{const s=a.at==='self'?{x:e.x,y:e.y}:{x:pl.x,y:pl.y};G.etels.push({t:'circle',x:s.x,y:s.y,r:a.r||18,left:T,dmg:D,col:'#ff6a6a'});if(a.eff)effAt(s.x,s.y,a.r||18,T,a.eff);break;}
      case'curse':ENG.curse({skd:e.dmg,name:e.name},{kind:a.kind||'dmg',t:a.t||8,dmg:a.dmg||1,say:a.say||'诅咒'});break;
      case'enrage':{e.castAt=-9;const go=a.after?G.t-(e._born=e._born||G.t)>=a.after:e.hp<e.max*(a.below||a.at||.3);if(!e.enraged&&go){e.enraged=true;e.spd*=a.spd||1.5;e.dmg*=a.dmg||1.5;num(e.x,e.y-12,'激怒','#ff5a5a',true);}a.t=.5;break;}
      case'sprint':e.spdBoost=1.5;e.spd*=1.8;G.sched.push({t:a.t||2,fn:()=>{e.spd/=1.8;}});break;
      case'bomb':if(d<(a.range||80))ENG.playerBomb({skd:e.dmg},{t:a.t||6,r:a.r||30,dmg:a.dmg||1});break;
      // 以下为被动 / 逐帧检查的能力：不播施法动作，自己设下次检查间隔
      case'touchDot':a.t=.4;e.castAt=-9;if(d<(a.aura||(e.r||6)+10)&&!(G.dotT>0)){G.dotT=3;G.dotD=pl.maxHp*.02;}break;
      case'leash':{a.t=.5;e.castAt=-9;if(e._ax===undefined){e._ax=e.x;e._ay=e.y;}const B=a.to?{x:e._ax,y:e._ay}:G.boss;
        if(B&&!e.leashed&&Math.hypot(e.x-B.x,e.y-B.y)>(a.d||80)){e.leashed=true;e.dmg*=a.dmg||2;e.spd*=1.3;e.w=Math.round(e.w*(a.size||1.2));e.h=Math.round(e.h*(a.size||1.2));num(e.x,e.y-14,'脱离束缚：狂暴','#ff5a5a',true);}break;}
      case'onlyWhileCursed':{a.t=.2;e.castAt=-9;const c=G.curse&&G.curse.t>0;e.hidden=!c;e.inv=!c;break;}
      case'static':a.t=1e9;e.castAt=-9;e.spd=0;break;
      case'grow':a.t=a.every||3;e.castAt=-9;if((e.growN=(e.growN||0)+1)<=(a.max||5)){e.w=Math.round(e.w*(1+(a.size||.1)));e.h=Math.round(e.h*(1+(a.size||.1)));e.dmg*=1+(a.dmg||.15);num(e.x,e.y-12,'长大','#ff9a4a',true);}break;
      case'frenzy':if(!e._fz){e._fz=1;e.spd*=1.5;e.dmg*=1.5;num(e.x,e.y-12,'狂乱','#ff5a5a',true);G.sched.push({t:4,fn:()=>{e._fz=0;e.spd/=1.5;e.dmg/=1.5;}});}break;
      case'cloud':G.orbs=G.orbs||[];if(G.orbs.length<8)G.orbs.push({x:e.x,y:e.y,t:8,r:a.r||16,dmg:D,spd:a.spd||20});break;
      case'mirror':for(let i=0;i<3;i++){const ang=angTo(e,pl)+(i-1)*.2;shots.push({x:e.x,y:e.y,vx:Math.cos(ang)*80,vy:Math.sin(ang)*80,life:2.5,dmg:D*.6,col:'#c06aff'});}break;
      case'totem':if(!(a._tot&&!a._tot.dead)){ENG.totem(G.boss&&!G.boss.dead?G.boss:e,{n:1,hp:1,effect:a.effect==='healBoss'?'healBoss':'pulse',every:3});a._tot=en[en.length-1];}break;
      case'shield':if(a.kind){e.shield={kind:a.kind,t:6,pct:a.pct};num(e.x,e.y-14,a.kind==='reflect'?'法术反射':'护盾','#9fe8ff',true);}else{a.t=1e9;e.castAt=-9;}break;
      case'colorCycle':{const C=a.colors||[],c=C[(e._ci=(e._ci||0)+1)%(C.length||1)];if(c&&d<50&&c.eff!=='healDown')applyEff(c.eff,e,c.t);break;}
      case'flee':a.t=.5;e.castAt=-9;if(!e._fled&&e.hp<e.max*(a.below||.3)){e._fled=1;e.spd=-Math.abs(e.spd);G.sched.push({t:2,fn:()=>{e.spd=Math.abs(e.spd);}});}break;
      case'heat':a.t=.5;e.castAt=-9;if(!e.brittle&&G.pools.some(p=>p.fire&&Math.hypot(e.x-p.x,e.y-p.y)<p.r+4)&&(e.heat=(e.heat||0)+1)>=(a.poolStacks||10)){e.brittle=true;e.hp=Math.min(e.hp,e.max*(a.brittleHp||.1));num(e.x,e.y-14,'易碎！','#ffd77a',true);}break;
      case'walkTo':{a.t=0;e.castAt=-9;const B=G.boss,tg=a.target==='boss'?B:a.target==='player'?pl:a.target==='prop:egg'?en.find(q=>!q.dead&&q.k==='EGG'&&q.pt2>1):{x:G.rm.cx,y:G.rm.y+G.rm.h/2};
        if(!tg||tg.dead){a.t=1;break;}const q=Math.hypot(tg.x-e.x,tg.y-e.y)||1;if(tg!==pl){e.spd=0;e.x+=(tg.x-e.x)/q*(a.spd||20)*dt;e.y+=(tg.y-e.y)/q*(a.spd||20)*dt;}
        if(q>(e.r||6)+(tg.r||6)+4)break;const o=a.onArrive||{};
        if(o.hatch){tg.pt2=0;break;}
        if((o.healBoss||o.mergeBoss)&&B&&!B.dead){B.hp=Math.min(B.max,B.hp+B.max*(o.healBoss||.03));fxs('heal',B.x,B.y,26,.5);}
        if(o.bossBuff&&B&&!B.dead){B.skd*=1+o.bossBuff;num(B.x,B.y-30,'能量涌入','#c06aff',true);}
        if(o.r)G.etels.push({t:'circle',x:e.x,y:e.y,r:o.r,left:.3,dmg:(o.dmg||1)*e.dmg,col:'#c06aff'});else if(o.dmg){pl.inv=0;hurt(o.dmg*(B?B.skd:e.dmg));}
        if(o.stun)pl.frozenT=Math.max(pl.frozenT,o.stun);
        e.hp=0;kill(e);break;}
      case'carry':{e.castAt=-9;
        if(a.then){a.t=.1;if(d<12){G.etels.push({t:'circle',x:e.x,y:e.y,r:a.then.r||24,left:.4,dmg:(a.then.dmg||1.5)*e.dmg,col:'#7aff5a'});e.hp=0;kill(e);}break;}
        if(a.to==='edge'){a.t=0;if(!e._carry&&d<14){e._carry=1;toast(`${e.name} 抓住了你：快打它！`);}
          if(e._carry){const r=G.rm,ex=pl.x<r.cx?r.x+6:r.x+r.w-6;e.spd=0;e.x+=Math.sign(ex-e.x)*20*dt;pl.x=e.x;pl.y=e.y;pl.frozenT=Math.max(pl.frozenT,.15);
            if(e.hp<e.max*.5){e._carry=0;a.t=1e9;num(e.x,e.y-14,'挣脱','#9fe8ff',true);}else if(Math.abs(e.x-ex)<3){e._carry=0;pl.inv=0;hurt(e.dmg*4);e.hp=0;kill(e);}}break;}
        // 抓握：首次触发定住玩家，之后每 0.1 秒检查是否打掉了 freeAt 比例的血
        if(e._grip===undefined){a.t=.1;e._grip=e.hp;pl.frozenT=Math.max(pl.frozenT,6);G.wrapK=2;toast(`${e.name} 抓住了你：攻击它挣脱`);break;}
        if(e._grip-e.hp>=e.max*(a.freeAt||.2)||pl.frozenT<=0){pl.frozenT=0;e._grip=undefined;a.t=12;}else a.t=.1;break;}
      case'merge':{a.t=.3;e.castAt=-9;const q=en.find(o=>o!==e&&!o.dead&&o.name===e.name&&Math.hypot(o.x-e.x,o.y-e.y)<(e.w+o.w)/2);if(!q)break;
        const h=q.hp;e.mergeN=(e.mergeN||1)+(q.mergeN||1);q.hp=0;kill(q);e.w=Math.round(e.w*1.15);e.h=Math.round(e.h*1.15);e.max*=1.3;e.hp=Math.min(e.max,e.hp+h);num(e.x,e.y-14,'合并 ×'+e.mergeN,'#7aff5a',true);
        if(e.mergeN>=(a.explodeAt||5)){const X=a.explode||{},n=X.n||6;for(let i=0;i<n;i++){const g=i*TAU/n;G.etels.push({t:'circle',x:e.x+Math.cos(g)*30,y:e.y+Math.sin(g)*30,r:X.r||20,left:.9,dmg:(X.dmg||1.2)*e.dmg,col:'#7aff5a'});}toast('大软泥爆炸！');e.hp=0;kill(e);}break;}
      case'revive':case'resist':case'onDeath':case'spawnOn':case'gridMove':case'safeSpot':case'taunt':case'split':case'stream':a.t=1e9;e.castAt=-9;break;
    }
  }
}
// 复活 / 幽灵：按死者复制一只（技能、贴图、名字都保留）
function cloneMob(e,hp,o){const s=spawnAt(e.x,e.y,e.k);Object.assign(s,{name:e.name,def:e.def,art:e.art,artAtk:e.artAtk,w:e.w,h:e.h,animRef:e.animRef,animPer:e.animPer,rig:e.rig,rp:null,dmg:e.dmg,eliteAdd:e.eliteAdd,vis:e.vis,_vk:0},o);
  s.hp=s.max=e.max*hp;s.abx=(e.def.ab||[]).filter(x=>!/^death|packRevive/.test(x.k)).map(x=>Object.assign({},x,{t:1+rand()}));fxs('portal',s.x,s.y,20,.4);return s;}
window.trashDeath=e=>{
  if(G.vamp)G.vampKills=(G.vampKills||0)+1;
  for(const b of en)if(b.boss&&b.attuned>0){b.attuned=Math.max(0,b.attuned-5);}
  for(const a of e.def.ab||[]){
    if(a.k==='deathExplode')G.etels.push({t:'circle',x:e.x,y:e.y,r:a.r||16,left:a.T||.6,dmg:(a.dmg||1.3)*e.dmg,col:'#ff8a2a'});
    if(a.k==='deathPool'&&G.pools.length<14)G.pools.push({x:e.x,y:e.y,r:a.r||10,arm:.3,t:a.t||3,tick:0,dmg:(a.dmg||.5)*e.dmg,fire:a.fire,buff:a.buff,buffT:a.buffT});
    if(a.k==='deathSplit'&&!e.small)for(let i=0;i<(a.n||2);i++){const s=spawnAt(e.x+(i?5:-5),e.y,e.k);s.small=true;s.hp=s.max*=a.hp||.4;s.w=Math.round(s.w*.7);s.h=Math.round(s.h*.7);}
    if(a.k==='revive'&&a.times){const n=(e._rv||0)+1;if(a.pool&&G.pools.length<14)G.pools.push({x:e.x,y:e.y,r:a.pool.r||16,arm:.5,t:a.pool.t||20,tick:0,dmg:(a.pool.dmg||.3)*e.dmg});
      if(n<=a.times)G.sched.push({t:a.after||20,fn:()=>{if(G.boss&&!G.boss.dead){cloneMob(e,1-(a.hpStep||0)*n,{_rv:n});toast(`${e.name} 复活了（${n}/${a.times}）`);}}});continue;}
    if((a.k==='packRevive'||a.k==='revive')&&!e.revived)G.revives.push({x:e.x,y:e.y,t:a.t||3});
    if(a.k==='carry'&&e._grip!==undefined)pl.frozenT=0;
    const B=G.boss&&!G.boss.dead?G.boss:null;
    if(a.k==='heat'&&e.brittle&&B){B.hp=Math.max(1,B.hp-B.max*.05);num(B.x,B.y-30,'碎裂重创','#ffd77a',true);}
    if(a.k!=='onDeath')continue;
    if(a.bossFrenzy&&B){B.frenzyT=1e9;B.dmg*=1.3;toast(`${e.name} 倒下：${B.name} 狂乱了！`);}
    if(a.removeFrenzy&&B&&Math.hypot(B.x-e.x,B.y-e.y)<(a.nearBoss||30)+B.r){B.frenzyT=0;B.at=Math.max(B.at,a.silenceBoss||0);num(B.x,B.y-30,'狂乱解除','#9fe8ff',true);}
    if(a.bossTaken&&B){B.taken=(B.taken||1)*a.bossTaken;num(B.x,B.y-30,'受到伤害提高','#ffd77a',true);}
    if(a.bossDmg&&B){B.hp=Math.max(1,B.hp-B.max*a.bossDmg);num(B.x,B.y-30,'-'+Math.round(a.bossDmg*100)+'%','#ffd77a',true);}
    if(a.playerBuff&&Math.hypot(pl.x-e.x,pl.y-e.y)<(a.near||30)){G.critBuffT=a.playerBuff;toast('能量火花：暴击率 +50%');}
    if(a.blackHole&&B)SPECIAL._spot(B,e.x,e.y,a.blackHole.r||16,{kind:'hole'});
    if(a.ghost&&!e.ghost)G.sched.push({t:1.5,fn:()=>{const s=cloneMob(e,.6,{ghost:true,name:e.name+'（幽灵）'});s.x=G.rm.cx*2-e.x;}});
    // 同组在 revive 秒内没有一起倒下就复活
    if(a.revive)G.sched.push({t:a.revive,fn:()=>{const mate=en.some(q=>q!==e&&!q.dead&&!q.boss&&q.def&&(q.def.ab||[]).some(x=>x.k==='onDeath'&&x.revive));if(mate){cloneMob(e,1);toast(`${e.name} 复活了：要同时击杀`);}}});
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
// d = 持续秒数（技能的 effT），不传用默认值
function applyEff(eff,b,d){
  switch(eff){
    case'stun':case'freeze':pl.frozenT=Math.max(pl.frozenT,d||1.1);if(eff==='freeze')G.wrapK=1;break;
    case'slow':G.pSlowT=Math.max(G.pSlowT||0,d||2.5);break;
    case'dot':G.dotT=d||6;G.dotD=pl.maxHp*.025;break;
    case'fear':G.fearT=Math.min(d||1.3,2.5);G.fearA=b?angTo(b,pl):rand()*TAU;toast('恐惧！');break;
    case'silence':G.sealT=Math.max(G.sealT||0,d||3);toast('沉默：技能被封');break;
    case'vuln':G.vulnT=Math.max(G.vulnT||0,d||6);break;
    case'dispel':pl.shield=0;G.critBuffT=0;G.blessT=0;toast('增益被驱散');break;
    case'blind':G.blindT=Math.max(G.blindT||0,d||3);toast('致盲：伤害减半');break;
    case'mc':G.mcT=Math.max(G.mcT||0,d||2.5);toast('被心灵控制！');break;
    case'pull':if(b){pl.x=b.x+(pl.x-b.x)*.2;pl.y=b.y+(pl.y-b.y)*.2+8;clampRoom(pl,4);}break;
    case'knock':{const a=b?angTo(b,pl):rand()*TAU;pl.x+=Math.cos(a)*40;pl.y+=Math.sin(a)*40;clampRoom(pl,4);break;}
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
  if(G.blindT>0&&o.src!=='ally')m*=.5;
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
// 小怪弹道：按怪名选（飞斧手扔斧子、术士扔暗影箭……）
const PROJ=[[/飞斧|斧/,'green',0],[/暗影|黑暗|死灵|术士|亡灵/,'black_2',4],[/熔岩|火|炎|烈焰|炸弹/,'black_2',3],[/神圣|圣光|牧师|审判/,'black_2',6],[/奥术|法力|魔爆/,'black_2',9],[/血/,'black_3',2]];
function projIm(name){for(const[re,sh,i]of PROJ)if(re.test(name||'')){const f=sheet('fx_raid_'+sh);return f&&f[i]||null;}return null;}
// 首领技能特效：content/skill_fx.js 按技能名给出 c/h/e/k/b/p/f，招牌规则覆盖元素兜底
const SFX=window.SKILL_FX||{sig:[],elem:[]},SPEC={};
function fxSpec(name){name=name||'';if(SPEC[name])return SPEC[name];const el=SFX.elem.find(([re])=>re.test(name)),sg=SFX.sig.find(([re])=>re.test(name));return SPEC[name]=Object.assign({},el&&el[1],sg&&sg[1]);}
function fxImg(key){if(!key)return null;const[t,a,b]=key.split(':');
  if(t==='fx')return FX[a]||null;if(t==='rf')return RF(a,+b);
  const f=sheet(t==='sig'?'bosses_fx_sig_'+a:'bosses_fxfull');return f&&f[t==='sig'?+b:+a]||null;}
function fxKey(key){const im=fxImg(key);if(!im)return null;FX['sk_'+key]=im;return 'sk_'+key;}
// 元素颜色：特效按技能元素着色
const ECOL=[[/血/,'#ff3a4a'],[/火|炎|熔|烈焰|燃|焚|陨|地狱|岩浆|灼/,'#ff7a2a'],[/冰|霜|寒|雪|冻/,'#7ad8ff'],[/闪电|雷|电|风暴|静电/,'#9ff6ff'],[/毒|瘟疫|疫|腐|孢子|酸|软泥|枯萎/,'#7aff5a'],
  [/神圣|圣|光明|审判|阳光/,'#ffe08a'],[/奥术|法力|魔|星|能量|宇宙|虚空之/,'#c06aff'],[/暗|影|虚空|黑|死亡|灵魂|暮光|邪/,'#a14aff'],[/水|潮|漩涡/,'#4ab0ff']];
const elemCol=n=>{const o=fxSpec(n).col;if(o)return o;for(const[re,c]of ECOL)if(re.test(n||''))return c;return '#ffd0a0';};   // skill_fx 里写了 col 就用技能自己的颜色
window.elemCol=elemCol;
// 射线到房间边界的长度，光束不画到墙外
function rayLen(x,y,a,R){const dx=Math.cos(a),dy=Math.sin(a);let t=1e9;
  if(dx>1e-6)t=Math.min(t,(R.x+R.w-x)/dx);if(dx<-1e-6)t=Math.min(t,(R.x-x)/dx);if(dy>1e-6)t=Math.min(t,(R.y+R.h-y)/dy);if(dy<-1e-6)t=Math.min(t,(R.y-y)/dy);return Math.max(0,t);}
// 光束：外层光晕 + 中层主色 + 白热核心，起点 / 终点光斑；宽度按正弦平滑闪动（不随机跳）
function drawBeam(g,x,y,a,len,w,col,al,t){if(al<=0||len<=0)return;const f=1+.07*Math.sin(t*38)+.04*Math.sin(t*21);
  g.save();g.translate(x,y);g.rotate(a);g.globalCompositeOperation='lighter';
  for(const[k,aa]of[[2.4,.28],[1.1,.55]]){const W=w*k*f,gr=g.createLinearGradient(0,-W,0,W);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.5,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=al*aa;g.fillStyle=gr;g.fillRect(0,-W,len,W*2);}
  g.globalAlpha=al*.9;g.fillStyle='#fffbe8';g.fillRect(0,-w*.18*f,len,w*.36*f);
  if(FX.spark){g.globalAlpha=al;const z=w*3.2*f;g.drawImage(FX.spark,-z/2,-z/2,z,z);g.drawImage(FX.spark,len-z/2,-z/2,z,z);}
  g.restore();}
window.drawBeam=drawBeam;
// 特效实例：beam（出现-持续-消散）/ cone（粒子喷射）
window.vfxBeam=o=>{if(G_VFX.length<24)G_VFX.push(Object.assign({k:'beam',t:0,T:o.T||.45,len:rayLen(o.x,o.y,o.a,R())},o));};
window.vfxErupt=o=>{if(G_VFX.length<24){G_VFX.push(Object.assign({k:'erupt',t:0,T:o.T||.6,h:o.h||46,w:o.w||9},o));for(let i=0;i<14&&G.parts.length<300;i++){const a=-Math.PI/2+(rand()-.5)*1.1,sp=60+rand()*90;G.parts.push({x:o.x+(rand()-.5)*10,y:o.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,g:260,life:.6,T:.6,col:o.col,s:2+rand()*1.5});}}};   // 喷发：向上的光柱 + 上抛后落下的火星
window.vfxCone=o=>{if(G_VFX.length<24)G_VFX.push(Object.assign({k:'cone',t:0,T:o.T||.55,acc:0},o));};
function vfxTick(dt){for(const v of G_VFX){v.t+=dt;
    if(v.k==='cone'&&v.t<v.T*.7){v.acc+=dt*90;while(v.acc>=1&&G.parts.length<300){v.acc--;const a=v.a+(rand()-.5)*2*v.ang*.9,sp=v.len*(1.6+rand()*.9);
      G.parts.push({x:v.x+Math.cos(a)*6,y:v.y+Math.sin(a)*6,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.42,T:.42,col:v.col,s:2.4+rand()*1.6});}}}
  G_VFX=G_VFX.filter(v=>v.t<v.T);}
function vfxDraw(g){for(const v of G_VFX){if(v.k!=='erupt')continue;const p=v.t/v.T,al=p<.15?p/.15:1-(p-.15)/.85,h=v.h*(p<.2?p/.2:1);drawBeam(g,v.x,v.y,-Math.PI/2,h,v.w*(1-p*.5),v.col,al,G.t+v.x);}
  for(const v of G_VFX){if(v.k!=='beam')continue;const p=v.t/v.T,al=p<.12?p/.12:p>.7?(1-p)/.3:1;drawBeam(g,v.x,v.y,v.a,v.len,(v.w||8)*(p<.12?.4+p/.2:1),v.col,al,G.t);}
  for(const v of G_VFX){if(v.k!=='cone')continue;const p=v.t/v.T,al=(1-p)*.35;if(al<=0)continue;   // 锥形区域一层淡淡的底光，粒子负责主体
    g.save();g.globalCompositeOperation='lighter';g.globalAlpha=al;const gr=g.createRadialGradient(v.x,v.y,0,v.x,v.y,v.len);gr.addColorStop(0,v.col);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;
    g.beginPath();g.moveTo(v.x,v.y);g.arc(v.x,v.y,v.len,v.a-v.ang,v.a+v.ang);g.closePath();g.fill();g.restore();}}
window.skillCastFx=(b,name,dur)=>{const k=fxKey(fxSpec(name).c);if(k)fxs(k,b.x,b.y+(b.h||40)*.3,(b.w||50)*1.3,Math.min(1.5,Math.max(.5,dur||1)),0,1.2,1.1);};
const ENG={
  tel(b,p,f){
    const n=p.n||1,T=(p.T||.8)*f,gap=p.gap||.12,shape=p.t||'circle';
    for(let i=0;i<n;i++){
      const at=p.at||(shape==='circle'?'player':'boss'),s=spot(b,at,p),rel=shape==='cone'&&at==='fixed',ang=rel?angTo(b,pl)+(p.a<0?Math.PI:0):at==='fixed'?(p.a||0):angTo(b,pl);   // 前/后方向的锥形以玩家为“前方”
      let g;
      if(shape==='circle')g={x:s.x,y:s.y,r:p.r||20};
      else if(shape==='cone')g={x:b.x,y:b.y,a:ang,ang:p.ang||.55,len:p.len||140};
      else if(shape==='beam')g={x:at==='boss'||at==='fixed'?b.x:s.x,y:at==='boss'||at==='fixed'?b.y:s.y,a:ang,w:p.w||8};
      else{const w=p.w||60,h=p.h||40;g={x:clamp(s.x-w/2,R().x,R().x+R().w-w),y:clamp(s.y-h/2,R().y,R().y+R().h-h),w,h};}
      if(p.col)g.col=p.col;
      if(!p.dmg)g.harmless=true;
      const t=tel(shape,g,T+i*gap,(p.dmg||0)*b.skd,p.eff);t.raid=true;
      const af=afterOf(p,b),sp=fxSpec(p._n||p.say);
      t.after=()=>{if(af)af(t);if(!p.dmg)return;let k;   // 纯减益不放爆炸特效
        if(shape==='circle'&&(k=fxKey(t.r>30&&sp.e?sp.e:sp.h)))fxs(k,t.x,t.y,t.r*2.3,.55,0,.6,1.15);
        else if(shape==='cone')vfxCone({x:t.x,y:t.y,a:t.a,ang:t.ang,len:t.len,col:elemCol(p._n||p.say)});
        else if(shape==='beam')vfxBeam({x:t.x,y:t.y,a:t.a||0,w:(t.w||8)*.9,col:elemCol(p._n||p.say)});
        else if(shape==='rect'&&(k=fxKey(sp.e||sp.h)))for(let j=0;j<3;j++)fxs(k,t.x+t.w*(.2+.3*j),t.y+t.h/2,Math.min(t.w,t.h)*.9,.5,0,0,1.1);};
      b.tels.push(t);
    }
    return T+(n-1)*gap+.3;
  },
  curse(b,p){
    G.curse={kind:p.kind,t:p.t||8,T:p.t||8,dmg:(p.dmg||1)*b.skd,n:p.say||'诅咒'};
    if(p.kind==='vuln'||p.kind==='mark')G.vulnT=p.t||8;   // 标记 = 受到伤害提高
    if(p.kind==='silence')G.sealT=p.t||4;
    if(p.kind==='cd')G.skillT+=st.skillCd;
    toast(`${p.say||'诅咒'}：${{delayed:`${p.t||6} 秒后爆发`,cd:'技能冷却变慢',heal:'回复降低',dmg:'伤害降低',vuln:'受到伤害增加',silence:'技能被封'}[p.kind]||''}`);
    return .8;
  },
  stacks(b,p){addStack(p.kind||'vuln',p.max||5,p.decay||8);return .6;},
  playerBomb(b,p){G.bomb={t:p.t||8,r:p.r||40,dmg:(p.dmg||1)*b.skd,per:p.perEnemy??.5,after:p.after};toast('你成为了炸弹！远离其他敌人');return .8;},
  castBar(b,p,f){const th=p.then||{e:'tel',t:'circle',at:'boss',r:80,T:.4,dmg:1.6};castOn(b,{n:p.say||'读条',T:(p.T||2)*f,need:p.need||0,then:()=>runSkill(b,th)});if(th.at==='boss'&&th.r&&th.dmg)b.cast.flee=th.r;return (p.T||2)*f+.2;},
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
    const im=fxImg(fxSpec(p._n||p.say).p)||projIm(p.say||b.name),k0=shots.length;
    if(p.p==='ring')ringShots(b,p.n||12,rand()*TAU,p.spd||55,(p.dmg||.6)*b.skd);
    else if(p.p==='spiral'){b.spiral={t:p.dur||2,n:0};}
    else{const n=p.n||5;for(let i=0;i<n;i++){const a=angTo(b,pl)+(i-(n-1)/2)*(p.p==='aimed'?.05:.18);shots.push({x:b.x,y:b.y,vx:Math.cos(a)*(p.spd||80),vy:Math.sin(a)*(p.spd||80),life:3,dmg:(p.dmg||.6)*b.skd});}}
    if(im)for(let i=k0;i<shots.length;i++)shots[i].im=im;
    return p.dur||1;
  },
  charge(b,p,f){SK.charge.start(b,f);return b.at;},
  addPhase(b,p){b.inv=true;const r=R();if(p.pos!=='stay'){b.x=r.cx;b.y=r.y+22;}b.addPh={t:p.t||20,T0:p.t||20,every:p.adds&&p.adds.every||4,k:0,adds:p.adds||{n:3},until:p.until||'time'};toast(`${b.name}：${p.say||'召唤援军（无敌）'}`);return p.t||20;},
  gaze(b,p){G.gaze={t:p.t||2,x:pl.x,y:pl.y,dmg:(p.dmg||3)*b.skd,b};toast('凝视：别动！');return (p.t||2)+.2;},
  decimate(b,p){pl.hp=Math.max(pl.maxHp*.05,pl.hp*(p.p||.5));for(const e of en)if(p.adds&&!e.boss&&!e.dead)e.hp=Math.max(1,e.max*.05);G.flash=.3;toast('屠戮！');return .8;},
  pull(b,p){applyEff('pull',b);if(p.dmg)hurt(p.dmg*b.skd);if(p.root)pl.frozenT=p.root;return .6;},
  grab(b,p){applyEff('pull',b);pl.frozenT=p.T||2;if(p.dmg)G.sched.push({t:p.T||2,fn:()=>{pl.inv=0;hurt(p.dmg*b.skd);}});toast('被抓住了！');return (p.T||2)+.2;},
  trail(b,p){b.trail={t:p.t||6,dmg:(p.dmg||.25)*b.skd,r:p.r||12,k:0};return .5;},
  totem(b,p){for(let i=0;i<(p.n||1);i++){const s=randInRoom(30),e=spawnAt(s.x,s.y,'SP');e.totem=Object.assign({k:0,b},p);e.hp=e.max=e.max*(p.hp||2);e.name='图腾';if(p.effect==='healBoss'||p.effect==='mc')e.prio=true;}toast(`${b.name} 放下了图腾`);return .8;},
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
    G.hideFrom=b;castOn(b,{n:'冰霜吐息',T:3*f,need:0,then:()=>{G.hideFrom=null;if(los(b,pl)){pl.inv=0;hurt(b.skd*(p.dmg||4));}else toast('躲在冰块后，安全！');for(const o of OBS)if(o.ice)o.dead=true;}});toast('躲到冰块后面！');return 3*f+.3;},
  webWrap(b,p){const r=R(),side=(rand()*4)|0;pl.x=side===0?r.x+8:side===1?r.x+r.w-8:r.cx;pl.y=side===2?r.y+8:side===3?r.y+r.h-8:r.y+r.h/2;pl.frozenT=3;G.wrapK=2;toast('被蛛网包裹！');return .8;},
  marks(b,p){G.markN=(G.markN||0)+1;pl.inv=0;hurt(b.skd*.12*Math.pow(G.markN,1.5));return .6;},
  stomach(b,p){const r=R();pl.x=r.cx;pl.y=r.y+r.h-14;G.stomachT=p.t||10;for(let i=0;i<2;i++){const e=spawnAt(r.cx+(i?-30:30),r.y+r.h-20,'SL');e.spd=0;e.hp=e.max*=2;e.name='血肉触须';}toast('被吞入胃中！击杀触须逃出');return 1;},
  siphon(b,p,f){castOn(b,{n:'血液虹吸',T:3*f,need:0,then:()=>{if(G.poisonBloodT>0){b.hp-=b.max*.05;toast('毒血反噬哈卡！');}else{pl.hp*=.75;b.hp=Math.min(b.max,b.hp+b.max*.1);}}});return 3*f;},
  shatter(b,p){b.shield={kind:'reduce',t:6,pct:.5};return .6;},
  vanish(b,p){b.hidden=true;b.inv=true;G.sched.push({t:p.t||3,fn:()=>{b.hidden=false;b.inv=false;b.x=pl.x-(pl.face||1)*14;b.y=pl.y;clampRoom(b,6);const th=typeof p.then==='string'?(b.skills||{})[p.then]:p.then;if(th)runSkill(b,th);else b.tels.push(tel('circle',{x:b.x,y:b.y,r:20},.6,b.skd*(p.dmg||1.5)));}});return (p.t||3)+.4;},
  channelBeam(b,p,f){return ENG.tel(b,{t:'beam',at:'boss',w:p.w||8,T:p.T||1,dmg:p.dmg||1.2,n:p.n||3,gap:.5},f);},
  randomBreath(b,p,f){if(!b._br){const a=['fireCone','frostCone','timeCone','acidCone'].sort(()=>rand()-.5);b._br=a.slice(0,2);}const k=b._br[(b._bi=(b._bi||0)+1)%2];b.say={n:{fireCone:'焚烧',frostCone:'冰霜吐息',timeCone:'时间流逝',acidCone:'腐蚀酸液'}[k],t:1.4};SK[k].start(b,f);return b.at;},
  classCall(b,p,f){const s=p.byClass&&p.byClass[G.cls];if(!s){SK.classcall.start(b,f);return b.at;}G.sigilT=1.2;toast(`职业召唤：${CLS[G.cls].n}`);return runSkill(b,s);},
  healBrother(b,p,f){const o=en.find(e=>e.boss&&e!==b&&!e.dead);if(o&&(!p.r||Math.hypot(o.x-b.x,o.y-b.y)<p.r+b.r)){o.hp=Math.min(o.max,o.hp+o.max*(p.pct||.05));fxs('heal',o.x,o.y,26,.5);}return .6;},
  twinTeleport(b,p){const o=en.find(e=>e.boss&&e!==b&&!e.dead);if(o){const x=b.x,y=b.y;b.x=o.x;b.y=o.y;o.x=x;o.y=y;fxs('portal',b.x,b.y,30,.4);fxs('portal',o.x,o.y,30,.4);}return .6;},
  essenceOfRed(b){b.essence=true;toast('红龙精华：大招冷却减半');return .4;},
  growingPool(b,p){G.pools.push({x:pl.x,y:pl.y,r:10,arm:.6,t:p.t||12,tick:0,dmg:(p.dmg||.25)*b.skd,grow:p.grow||3,im:RF('black_3',1)});return .6;},
  fixate(b,p){b.fixT=p.t||8;b.spd*=1.3;G.sched.push({t:p.t||8,fn:()=>{b.spd/=1.3;}});toast(`${b.name} 盯上了你！`);return .5;},
  enfeeble(b,p){pl.hp=Math.max(1,pl.hp*(p.p||.1));toast('衰弱！');const th=typeof p.then==='string'?(b.skills||{})[p.then]:p.then;if(th)G.sched.push({t:p.thenAfter||3,fn:()=>{if(!b.dead)runSkill(b,th);}});return .6;},
  demonForm(b,p){b.frenzyT=1e9;if(!b._demon){b._demon=1;b.dmg*=1.3;b.skd*=1.2;}fxs('voidFire',b.x,b.y-10,b.w,.8);toast(`${b.name} 化身恶魔！`);return .8;},
  touchDot(b,p){b.passive=Object.assign({},b.passive,{touchDot:{t:p.t||6}});G.dotT=p.t||6;G.dotD=(p.dmg||.2)*b.skd/2;return .5;},
  aspectCycle(b,p,f){const o=p.order||[];if(!o.length)return .5;const q=o[(b._asp=(b._asp||0)+1)%o.length];if(q.say)b.say={n:q.say,t:1.4};return runSkill(b,q);},
  terrain(b,p){const r=R();for(const side of p.rects||[{side:'left'},{side:'right'}])for(let y=r.y+14;y<r.y+r.h;y+=24)G.pools.push({x:side.side==='left'?r.x+10:r.x+r.w-10,y,r:12,arm:0,t:1e9,tick:0,dmg:b.skd*.04,slow:true,terrain:true});toast('两侧的软泥会减速');return .6;},
  rotatingRect(b,p,f){SK.sweep.start(b,f);return b.at;},
  beamBlock(b,p){G.beams3={t:p.swap||15,b,cols:['#ff4a4a','#5aff6a','#5aa4ff'].map((c,i)=>{const r=R(),a=i*TAU/3+rand();return{c,x:b.x+Math.cos(a)*120,y:b.y+Math.sin(a)*120};})};toast('站进光束挡住它：绿光不挡首领会回血');return .8;},
  chessBoard(b,p){b.shield={kind:'immune',t:1e9};const r=R();for(let i=0;i<6;i++){const e=spawnAt(r.x+20+i*(r.w-40)/5,r.y+r.h-30,i%2?'SK':'SL');e.hp=e.max*=3;e.name='棋子';e.chess=b;}b.chessOn=true;toast('棋局：先吃掉对方的棋子，国王才能被攻击');return .8;},
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
  tsunami(b,p,f){const r=R(),lanes=4,safe=(rand()*lanes)|0,w=r.w/lanes;for(let i=0;i<lanes;i++)if(i!==safe)b.tels.push(tel('rect',{x:r.x+i*w,y:r.y,w,h:r.h},(p.t||3)*f,(p.dmg||2)*b.skd));fullFx('烈焰');toast('烈焰海啸：躲进安全的那一列');return (p.t||3)*f+.4;},
  rangedPunishSkill(b,p){if(Math.hypot(pl.x-b.x,pl.y-b.y)>(p.d||60)){const a=angTo(b,pl);shots.push({x:b.x,y:b.y,vx:Math.cos(a)*110,vy:Math.sin(a)*110,life:3,dmg:(p.dmg||1.6)*b.skd,col:'#9a9a9a'});toast('石化吐息：靠近首领！');}return .6;},
  attuned(b,p){b.attuned=p.stacks||150;b.skd0=b.skd;toast(`自然之力 ${b.attuned} 层：击杀小怪削减层数`);return .5;},
  absorbCheck(b,p){G.absorb={t:p.t||12,need:b.max*(p.need||.05),hp0:b.hp,got:0,b,fail:p.fail};toast('焚化血肉：在倒计时内打出足够伤害！');return .6;},
  championAI(b,p){const ids=CLS_IDS.filter(c=>c!==G.cls);for(let i=0;i<(p.n||4);i++){const c=ids[(rand()*ids.length)|0],C=CLS[c],e=spawnAt(b.x+(i-1.5)*30,b.y+10,AT[C.atk].melee?'SK':'SA');e.hp=e.max=b.max*.12;e.dmg=b.dmg*.6;e.name=C.n+'（冠军）';if(C.port){e.art=[C.port];e.w=e.h=22;}}b.shield={kind:'immune',t:1e9};b.hidden=true;b.champions=true;toast('阵营冠军：击败所有敌方英雄');return 1;},
  deckCannon(b,p){const r=R();b.cannons=[];for(let i=0;i<(p.n||2);i++){const x=r.x+30+i*(r.w-60),y=r.y+r.h-30;b.cannons.push({x,y,k:0});}b.shipDmg=p.shipDmg||.05;b.shield={kind:'immune',t:1e9};toast('站上火炮轰击敌舰');return .8;},
  inhaleBlight(b,p,f){b.inhale=(b.inhale||0)+1;b.skd*=1+(p.dmgAdd||.3);num(b.x,b.y-30,'吸入 ×'+b.inhale,'#7aff5a',true);if(b.inhale>=(p.stacks||3)){b.inhale=0;return runSkill(b,p.then||{e:'tel',t:'rect',at:'fixed',w:192,h:256,T:1.5,dmg:3});}return .8;},
  invocation(b,p){const bs=en.filter(e=>e.boss&&!e.dead),k=bs[(rand()*bs.length)|0];for(const e of bs)e.shield=e===k?null:{kind:'reduce',t:p.every||30,pct:p.otherTaken||.1};if(k){k.empowered=true;num(k.x,k.y-30,'祈求之血','#ff4a4a',true);toast(`只有 ${k.name} 受到全额伤害`);}return .6;},
  vampire(b,p){G.vamp={t:p.thirstT||15,mul:p.playerDmg||2,fail:p.fail};toast('吸血鬼之咬：伤害翻倍，15 秒内多杀敌否则被控制');G.vampKills=0;return .6;},
  // 穿过房间中心的光束按顺序转动：每一道都是带伤害的预警
  twinBeam(b,p,f){const r=R(),x=r.cx,y=r.y+r.h/2,a0=rand()*TAU,n=p.n||8;for(let i=0;i<n;i++)G.sched.push({t:i*.7*f,fn:()=>{if(!b.dead)b.tels.push(tel('beam',{x,y,a:a0+i*(p.spd||.6)*.5,w:p.w||8},.9*f,(p.dmg||2)*b.skd));}});toast('暮光切割者：躲开旋转的光束');return n*.7*f+.5;},
  // 普通预警 + 命中后附加：eff（伤害为 0 时游戏本体不处理，这里补上）、curse（命中才中的诅咒）、spot（落点留下标记区）
  hitTel(b,p,f){const k=b.tels.length,d=ENG.tel(b,p,f);for(const t of b.tels.slice(k)){const a=t.after;t.after=()=>{if(telHit(t,pl.x,pl.y)){if(!p.dmg&&p.eff)applyEff(p.eff,b,p.effT);if(p.curse)runSkill(b,p.curse);}if(p.spot)SPECIAL._spot(b,t.x,t.y,p.spot.r||t.r||20,p.spot);if(a)a();};}return d;},
  // 持续掉血（stack:true 时每次叠加，有上限）
  dot(b,p){const n=p.stack&&G.dotT>0?G.dotD:0;G.dotT=p.t||8;G.dotD=Math.min(pl.maxHp*.06,n+pl.maxHp*(p.pct||.02));toast(`${p.say||'持续伤害'}：持续掉血`);return .5;},
  // 依次放几个技能（先拉近再爆炸 / 预警 + 扩大的水坑）
  combo(b,p,f){let d=0;for(const s of p.seq||[])d=Math.max(d,runSkill(b,s));return d;},
  // 按玩家近战 / 远程设置各首领的减伤（数据里的 resist:{melee,ranged}）
  roleResist(b){const mel=AT[CLS[G.cls].atk].melee,d=b.data||{};G.sched.push({t:.5,fn:()=>{for(const q of en){if(!q.boss||q.dead)continue;const r=q===b?d.resist:((d.multi||[]).find(m=>m.n===q.name)||{}).resist,v=r&&(mel?r.melee:r.ranged);if(v)q.taken=v;}}});return .2;},
  leech(b,p){pl.inv=0;hurt(b.skd*(p.dmg||.8));b.hp=Math.min(b.max,b.hp+b.max*(p.heal||.04));fxs('heal',b.x,b.y,26,.5);return .5;},
  // 光环叠层：farFrom = 离首领太远才叠；losClears = 首领看不到你（躲在石柱后）时清层，场上没有石柱就放两根
  auraStacks(b,p){if(p.losClears){if(!OBS.some(o=>o.losPillar&&!o.dead))for(let i=0;i<2;i++){const s=randInRoom(36);OBS.push({kind:'pillar',x:s.x-7,y:s.y-7,w:14,h:14,hp:999,flash:0,dead:false,losPillar:true});}
      if(!los(b,pl)){if(G.stk&&G.stk.vuln)G.stk.vuln.n=0;return .3;}}
    if(!p.farFrom||Math.hypot(pl.x-b.x,pl.y-b.y)>p.farFrom)addStack(p.kind||'vuln',p.max||10,p.decay||8);return .3;},
  // 停掉所有周期阶段（“不再起飞 / 不再刷星”）
  stopEvery(b){for(const o of b.tph||[])if(o.every){if(o.on)applyPhase(b,o,false);o.on=false;o.every=0;o.done=true;}if(b.phEnd){b.phEnd=null;b.inv=false;b.hidden=false;}return .3;},
  // 唤醒 / 喝水：首领停手 t 秒且受到伤害 ×taken，可附带一个技能
  evocate(b,p){const t=p.t||10;b.taken=p.taken||2;num(b.x,b.y-30,p.say||'虚弱','#9fe8ff',true);G.sched.push({t,fn:()=>{b.taken=1;}});if(p.then)runSkill(b,p.then);return t;},
  stillDot(b,p){const s=G.stk&&G.stk.cold;if(pl.moving){if(s)s.n=0;return .1;}addStack('cold',p.max||10,3);G.dotT=1.5;G.dotD=pl.maxHp*.005*G.stk.cold.n;return .1;},
  airborne(b,p){const r=R();b.x=r.cx;b.y=r.y+24;if(AT[CLS[G.cls].atk].melee){b.taken=p.taken||.5;toast('她在空中：近战伤害降低');}
    const loop=()=>{if(b.dead||!en.includes(b))return;if(b.hp<b.max*(p.until||.7)){b.taken=1;return;}G.sched.push({t:.3,fn:loop});};loop();return .5;},
  // 召唤带技能的小怪（raidAdds 格式）；grip = 召唤时定住玩家，直到它们全死或超时
  addsAb(b,p){const out=raidAdds(b,[p.adds]),r=R();for(const e of out){if(p.at==='player'){e.x=pl.x+(rand()-.5)*16;e.y=pl.y+(rand()-.5)*16;}else if(p.at==='edges'){e.x=rand()<.5?r.x+8:r.x+r.w-8;e.y=r.y+20+rand()*(r.h-40);}}
    if(p.grip){pl.frozenT=Math.max(pl.frozenT,p.grip);G.wrapK=2;toast(p.msg||'被钉住了：打碎它！');const loop=()=>{if(out.every(e=>e.dead)){pl.frozenT=0;return;}if(pl.frozenT>0)G.sched.push({t:.1,fn:loop});};loop();}return .6;},
  // 千魂之暗 / 大爆炸 / 干扰怒吼：全屏伤害，站在安全处（safe）才免疫
  safeZone(b,p,f){const r=R(),T=(p.T||.8)*f,t=tel('rect',{x:r.x,y:r.y,w:r.w,h:r.h,harmless:true},T,0);t.safeP=p;t.after=()=>{if(SPECIAL._safe(b,p))toast('安全！');else{pl.inv=0;hurt(b.skd*(p.dmg||2));}};b.tels.push(t);return T+.3;},
  _safe(b,p){if(p.safe==='pol')return !!G.pol&&(pl.x<R().cx?1:-1)===G.pol.sign;
    if(p.safe==='near')return en.some(q=>!q.dead&&!q.boss&&q.def&&(q.def.ab||[]).some(a=>a.k==='safeSpot')&&Math.hypot(q.x-pl.x,q.y-pl.y)<(p.r||26));
    return (b._spots||[]).some(s=>s.k===p.safe&&G.t<s.until&&Math.hypot(pl.x-s.x,pl.y-s.y)<s.r+4);},
  // 场地标记区：一个持续的淡紫符文圈（不造成伤害），o.t 秒后消失
  _spot(b,x,y,r,o){const m=tel('circle',{x,y,r,harmless:true},1e9,0);b.tels.push(m);(b._spots=b._spots||[]).push({x,y,r,k:o.kind,until:G.t+(o.t||1e9)});if(o.t)G.sched.push({t:o.t,fn:()=>{m.done=true;m.fx=0;}});},
  despair(b,p){if(b._desp)return .3;b._desp=1;toast('无面者的光环：站在暗影冲撞留下的区域里技能才转得动');
    const loop=()=>{if(b.dead||!en.includes(b))return;if(!SPECIAL._safe(b,{safe:'crash'}))G.skillT+=.06;G.sched.push({t:.1,fn:loop});};loop();return .3;},
  // 场地机关（水晶 / 立方体 / 鱼叉炮 / 蓝龙宝珠 / 玛维的陷阱）：站上去 standT 秒触发 mode；trap 判定首领踩上去
  pads(b,p){if(b._pads)return .3;b._padMode=p.mode;const P=b._pads=[],R0=p.r||12,mk=q=>{q.m=tel('circle',{x:q.x,y:q.y,r:R0,harmless:true},1e9,0);b.tels.push(q.m);},um=q=>{if(q.m){q.m.done=true;q.m.fx=0;q.m=null;}};
    for(let i=0;i<(p.n||3);i++){const s=randInRoom(28),q={x:s.x,y:s.y,k:0,off:0};mk(q);P.push(q);}if(p.msg)toast(p.msg);
    const loop=()=>{if(b.dead||!en.includes(b)||(p.mode==='ground'&&!b.phEnd)){P.forEach(um);b._pads=null;return;}
      for(const q of P){if(q.used)continue;if(q.off>0){if((q.off-=.1)<=0)mk(q);continue;}const w=p.mode==='trap'?b:pl;
        if(Math.hypot(w.x-q.x,w.y-q.y)>=R0+(p.mode==='trap'?b.r:4)){q.k=0;continue;}if((q.k+=.1)<(p.standT||1))continue;q.k=0;
        if(p.mode==='interrupt'){if(!b.cast)continue;b.cast=null;num(b.x,b.y-30,'打断！','#9fe8ff',true);}
        else if(p.mode==='weaken'){b.shield=null;b._weakT=G.t+(p.buffT||15);toast(`${b.name} 被削弱：${p.buffT||15} 秒内全力输出`);}
        else if(p.mode==='shield'){pl.shield=Math.max(pl.shield,b.skd*(p.absorb||2));toast('护盾：挡住下一次全屏伤害');G.sched.push({t:p.buffT||10,fn:()=>{pl.shield=0;}});}
        else if(p.mode==='trap'){b.frozenT=p.bossStun||6;b.at=Math.max(b.at,p.bossStun||6);b.taken=p.bossTaken||1.5;G.sched.push({t:p.bossStun||6,fn:()=>{b.taken=1;}});num(b.x,b.y-30,'被困住了！','#9fe8ff',true);}
        else if(p.mode==='ground'){q.used=true;um(q);if(P.every(o=>o.used)){b.phEnd.t=.01;b.phEnd.el=1;toast(`${b.name} 被拉下来了！`);P.length=0;}continue;}
        um(q);q.off=p.cd||15;}
      if(p.mode==='weaken'&&!b.shield&&!(G.t<b._weakT))b.shield={kind:'reduce',t:1e9,pct:p.pct||.15};
      G.sched.push({t:.1,fn:loop});};
    loop();return .3;},
  // 议会战：成员倒下时按数据触发（frenzyOthers / adds / pool），shared.onDeath 时其余成员继承他的技能
  council(b){let d,L,ref=null;const done=new Set();
    const loop=()=>{if(!ref){d=b.data||{};L=[{n:d.n,o:d.onDeath,sk:d.sk,skills:d.skills}].concat((d.multi||[]).map(m=>({n:m.n,o:m.onDeath,sk:m.sk,skills:m.skills})));ref=en.filter(e=>e.boss&&L.some(m=>m.n===e.name));}const live=ref.filter(e=>!e.dead);if(!live.length||!en.includes(live[0]))return;
      for(const e of ref){if(!e.dead||done.has(e))continue;done.add(e);const m=L.find(x=>x.n===e.name),o=m.o||{},r=R();
        if(o.frenzyOthers)for(const q of live){q.frenzyT=1e9;q.dmg*=1.3;}
        if(o.adds)raidAdds(live[0],[{n:'召唤物',base:o.adds.k||'BT',count:o.adds.n||3,hp:o.adds.hp||.3}]);
        if(o.pool)G.pools.push({x:r.cx,y:r.y+r.h/2,r:o.pool.r||40,arm:.6,t:o.pool.t||20,tick:0,dmg:(o.pool.dmg||.3)*live[0].skd});
        if(d.shared&&d.shared.onDeath)for(const q of live){const S=Object.assign({},q.skills);for(const k of m.sk||[]){const s=(m.skills||{})[k]||(d.skills||{})[k];if(s){S[e.name+k]=s;q.sk.push(e.name+k);}else if(SK[k])q.sk.push(k);}wrapSkills(q,S);q.skd*=1.15;}
        toast(`${e.name} 倒下${o.frenzyOthers?'：其余首领狂暴了':d.shared&&d.shared.onDeath?'：其余首领继承了他的技能':''}`);}
      G.sched.push({t:.3,fn:loop});};
    G.sched.push({t:1,fn:loop});return .2;},
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
    p._n=p.say||k;
    b.skx[k]={start(bb,f){const d=(ENG[p.e]||ENG.tel)(bb,p,f);bb.at=Math.max(.4,d||1);if(p.dmg>0||!['tel','curse','hitTel'].includes(p.e))skillCastFx(bb,p._n,bb.at);},tick(){},end(){}};
  }
}
// 首领召唤 / 身边护卫是精英：血量按普通小怪的 ADD_HP 倍
const ADD_HP=2.2;
window.raidAdds=(b,list)=>{const out=[];for(const a of [].concat(list)){if(!a||typeof a!=='object')continue;const n=a.count||3;
  for(let i=0;i<n;i++){const ang=i*TAU/n,t=RAIDS[LV[G.L].ri].trash[a.k||a.n],walker=(a.ab||[]).some(x=>x.k==='walkTo'&&x.target==='altar');
    // 爬向祭坛的单位从房间边缘出现，给玩家留出拦截时间
    const sp=walker?{x:rand()<.5?G.rm.x+12:G.rm.x+G.rm.w-12,y:G.rm.y+12+rand()*(G.rm.h-24)}:{x:b.x+Math.cos(ang)*(a.ring||40),y:b.y+Math.sin(ang)*(a.ring||40)};
    const e=spawnAt(sp.x,sp.y,a.base||(t&&t.base)||'SK');
    if(t)applyTrash(e,t);e.name=a.n||e.name;e.hp=e.max*=(a.hp||1)*ADD_HP;e.eliteAdd=true;if((a.ab||[]).some(x=>x.k==='walkTo'))e.prio=true;
    const fr=frames(a.art,1);if(fr){e.art=[fr[0]];e.w=e.h=a.size||22;}
    if(a.ab){const def={n:a.n,ab:a.ab.filter(x=>x.k!=='unkillable')};if(!t){const hp=e.hp;applyTrash(e,def);e.hp=e.max=hp;}else e.def=Object.assign({},e.def,{ab:def.ab});
      e.abx=def.ab.filter(x=>!/^death|packRevive/.test(x.k)).map(x=>Object.assign({t:2+rand()*2},x));
      const u=a.ab.find(x=>x.k==='unkillable');if(u)e.unk={b,healAt:u.healAt||.5};}
    e.vis=Math.round((e.vis||20)*1.35);e._vk=0;   // 护卫比同种小怪大一号
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
  // BOSS_TUNE（content/boss_tune.js，tools/boss_tune.mjs 自动校准）：[血量倍率, 伤害倍率]
  const BT=(window.BOSS_TUNE||{})[d.n]||[1,1];
  b.name=d.n;b.hp=b.max=b.max*(d.hp||1)*BT[0];
  b.fury=(d.enrage||b.fury)*1.8;   // 首领血量翻倍后狂暴计时同步拉长
  if(d.spd!==undefined)b.spd=Math.max(40,d.spd);   // 数据里的 13 太慢，看起来像站桩
  if(d.fixed)b.spd=0;
  const f=frames(d.art,4)||(fb(d.fallback)&&[fb(d.fallback)])||(ART.bosses&&[ART.bosses[d.fallbackArt]]);
  if(f){b.art=f.length>=2?[f[0],f[1]]:[f[0]];b.artAtk=f[3]||f[2]||null;b.w=b.h=d.size||(v.last?64:54);}
  b.animRef=Array.isArray(d.art)?d.art:null;b.animPer=4;b._an=null;b.vis=VIS[d.id]||58;b._vk=0;
  b.rig=window.rigOf?rigOf('boss',d.n):null;b.rp=null;
  {const m=(d.dmgx||1)*BT[1];b.dmg*=m;b.skd*=m;}   // 单个首领的伤害倍率（平衡用）   // 分件骨骼（有分件图就用，没有就用逐帧图）
  b.r=Math.max(b.r||0,Math.round((b.w||54)*.36));   // 碰撞 / 近战命中半径按贴图大小
  if(d.fixed||b.spd===0){const r=R();b.x=r.cx;b.y=r.y+r.h*.45;b.w=b.h=Math.round((b.w||54)*1.4);b.r=Math.round(b.w*.36);b.stationary=true;}   // 固定首领：居中、放大
  wrapSkills(b,d.skills);
  b.sk=(d.sk&&d.sk.length?d.sk:b.sk).filter(k=>b.skx[k]||SK[k]);
  if(!b.sk.length)b.sk=['slam'];
  b.autoSk=(d.auto||[]).map(a=>Object.assign({t:a.every||6},a));
  b.ph=(d.ph||[]).filter(o=>o.at!==undefined).map(o=>[o.at,o]);b.phi=0;
  b.tph=(d.ph||[]).filter(o=>o.at===undefined&&(o.t!==undefined||o.every)).map(o=>Object.assign({k:o.every?o.every:o.t,on:false},o));   // 按时间 / 周期触发的阶段
  if(d.start&&d.start.hp)b.hp=b.max*d.start.hp;
  for(const a of d.auto||[])if(a.once){const p=(d.skills||{})[a.k];if(p)runSkill(b,p);}
  b.autoSk=b.autoSk.filter(a=>!a.once);
  if(d.objective&&d.objective.mode==='destroy'){const n=d.objective.n||4;b.inv=true;b.objs=[];for(let i=0;i<n;i++){const s=randInRoom(30),e=spawnAt(s.x,s.y,'EGG');e.pt2=1e9;e.hp=e.max=e.max*(d.objective.hp||2);e.name=d.objective.prop||'目标';b.objs.push(e);}toast(d.objective.msg||`先摧毁 ${n} 个${({egg:'龙蛋',crystal:'水晶',manticronCube:'玛瑟里顿之笼'})[d.objective.prop]||'目标'}！`);}
  if(d.passive)b.passive=d.passive;
  b.data=d;
  if(d.adds)raidAdds(b,d.adds.filter(a=>!a.at||a.at==='start'));
  if(d.multi){
    for(const m of d.multi){
      const e={...b,tels:b.tels,sec:true,name:m.n,x:b.x+(rand()<.5?-50:50),y:b.y+20,flash:0,poison:0,dead:false,frozenT:0,slowT:0,burnT:0,cyc:0,at:2+rand(),mode:'walk',say:null};
      e.hp=e.max=b.max*(m.hp||1);
      const mf=frames(m.art,4);if(mf){e.art=[mf[0],mf[1]];e.artAtk=mf[3];}e.rig=window.rigOf?rigOf('boss',m.n):null;e.rp=null;e.animRef=Array.isArray(m.art)?m.art:null;e.animPer=4;e._an=null;
      wrapSkills(e,Object.assign({},d.skills,m.skills));
      e.sk=(m.sk||b.sk).filter(k=>e.skx[k]||SK[k]);if(!e.sk.length)e.sk=['slam'];
      e.ph=(m.ph||[]).map(o=>[o.at,o]);e.phi=0;e.autoSk=(m.auto||[]).map(a=>Object.assign({t:a.every||6},a));
      if(d.shared&&d.shared.hp){e.sharedWith=b;b.sharedWith=e;}
      en.push(e);
    }
  }
  if(d.open){const o=d.open;if(o.msg)toast(o.msg);if(o.inv)b.inv=true;phaseStart(b,o);
    if(o.go&&(b.skx[o.go]||SK[o.go])){b.mode=o.go;b.say={n:skName(b,o.go),t:1.6};skOf(b,o.go).start(b,1);}}

}

function applyPhase(b,o,on){
  if(on){if(o.msg)toast(o.msg);if(o.sk){o._sk=b.sk;b.sk=o.sk.filter(k=>b.skx[k]||SK[k]);}if(o.form!==undefined)b.formArt=formOf(o.form);if(o.inv)b.inv=true;if(o.heal)b.hp=b.max;
    phaseStart(b,o);if(o.go&&(b.skx[o.go]||SK[o.go])){endSkill(b);b.mode=o.go;b.say={n:skName(b,o.go),t:1.6};skOf(b,o.go).start(b,1);}}
  else{if(o._sk)b.sk=o._sk;if(o.form!==undefined)b.formArt=null;if(o.inv)b.inv=false;}
}
// ---------- 每帧：首领附加状态、玩家减益、小怪技能 ----------
window.raidTick=dt=>{
  if(!G)return;
  vfxTick(dt);
  for(const p of G.pools)if(p.buff&&Math.hypot(pl.x-p.x,pl.y-p.y)<p.r+4)G[p.buff+'T']=p.buffT||10;   // 站进带增益的池子（哈卡之子的毒血）
  if(G.poisonBloodT>0)G.poisonBloodT-=dt;
  for(const e of en){if(!e.unk||e.dead)continue;const B=e.unk.b;   // 首领活着就打不死的召唤物（熔火怒犬）：残血回到一半，首领死了一起死
    if(!B||B.dead){e.unk=null;e.hp=0;kill(e);continue;}if(e.hp<=e.max*.03){e.hp=e.max*e.unk.healAt;fxs('heal',e.x,e.y-6,20,.5);num(e.x,e.y-14,'复苏','#7dff8a',true);}}
  if(G.ffx&&(G.ffx.t-=dt)<=0)G.ffx=null;
  for(const b of en){if(!b.boss||b.dead||b.stationary||b.mode!=='walk'||b.hidden||b.frozenT>0)continue;
    b.swingT=(b.swingT||0)-dt;const d=Math.hypot(pl.x-b.x,pl.y-b.y);
    if(b.swingT<=0&&d<b.w*.55+10){b.swingT=1.8;b.castAt=G.t;b.castDur=.7;b.castK='melee';
      G.sched.push({t:.35,fn:()=>{if(!b.dead&&Math.hypot(pl.x-b.x,pl.y-b.y)<b.w*.55+14){hurt(b.skd*.45);fxs('slash',(b.x+pl.x)/2,(b.y+pl.y)/2,26,.25,angTo(b,pl));}}});}}
  for(const e of en){
    if(e.dead)continue;
    if(e.abx&&!e.boss)mobTick(e,dt);
    else if(e.abx&&e.boss&&e.mode==='walk')mobTick(e,dt);
    if(e.cast){e.cast.t-=dt;if(e.cast.t<=0){const c=e.cast;e.cast=null;c.then&&c.then();}}
    if(e.shield&&(e.shield.t-=dt)<=0)e.shield=null;
    if(e.totem){const T=e.totem;if((T.k-=dt)<=0){T.k=T.every||3;if(T.effect==='healBoss'&&T.b&&!T.b.dead){T.b.hp=Math.min(T.b.max,T.b.hp+T.b.max*Math.min(.02,(T.pct||.015)*.4));fxs('heal',T.b.x,T.b.y,20,.4);}
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
    // 吸血：首领回复量 = 吸走玩家血量的 3 倍（不按首领最大生命算，否则血厚的首领回得比低输出职业打得还快，永远打不死）
    if(G.curse.kind==='bossLeech'&&G.boss&&!G.boss.dead){const dr=pl.hp>1?Math.min(pl.hp-1,pl.maxHp*.005*dt*(typeof dotK==="function"?dotK():1)):0;pl.hp-=dr;G.boss.hp=Math.min(G.boss.max,G.boss.hp+dr*3);}
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
  if(G.cutter){const C=G.cutter,r=R(),c={x:r.cx,y:r.y+r.h/2};for(const d of[0,Math.PI])drawBeam(g,c.x,c.y,C.a+d,rayLen(c.x,c.y,C.a+d,r),C.w*.9,'#c06aff',.95,G.t+d);}
  if(G.absorb){const A=G.absorb;A.t-=dt;A.got=A.hp0-A.b.hp;if(A.got>=A.need){toast('吸收盾已打破！');G.absorb=null;}else if(A.t<=0){runSkill(A.b,A.fail||{e:'tel',t:'circle',at:'player',r:60,T:.6,dmg:2});G.absorb=null;}}
  if(B&&B.chess&&!en.some(e=>e.chess&&!e.dead)){}
  for(const e of en){if(e.dead||!e.boss)continue;
    if(e.attuned!==undefined&&e.skd0)e.skd=e.skd0*(1+.004*e.attuned);   // 自然之力：层数越多伤害越高
    if(e.shield&&e.shield.t>1e8&&e.shield.kind==='immune'){
      if(e.cannons){for(const c of e.cannons)if(Math.hypot(pl.x-c.x,pl.y-c.y)<12){if((c.k+=dt)>=1){c.k=0;e.hp-=e.max*e.shipDmg;fxs('explosion',e.x,e.y,40,.4);num(e.x,e.y-20,'开炮！','#ffd77a',true);if(e.hp<=0){e.shield=null;e.hp=0;kill(e);}}}else c.k=0;}
      else if(e.champions){if(!en.some(q=>!q.dead&&!q.boss&&q.name&&q.name.endsWith('（冠军）'))){e.shield=null;e.hidden=false;e.hp=1;}}
      else if(e.chessOn&&!en.some(q=>q.chess===e&&!q.dead)){e.chessOn=false;e.shield=null;toast('国王失去了保护！');}}}
};
// 大招：安抚狂乱、驱散护盾
const _doUlt=doUlt;
doUlt=function(){_doUlt();for(const e of en)if(e.boss&&!e.dead){if(e.frenzyT>0&&e.frenzyT<1e8){e.frenzyT=0;num(e.x,e.y-20,'已安抚','#9fe8ff',true);}if(e.shield&&e.shield.kind!=='immune'){e.shield=null;num(e.x,e.y-26,'驱散','#ffd77a',true);}}};

// ---------- 绘制：读条、光环、炸弹、凝视、极性 ----------
// 团本特效图集（GPT 生成，黑底按亮度抠图）：fx_raid_black_1/2/3、fx_raid_green
const RF=(n,i)=>{const f=sheet('fx_raid_'+n);if(n==='black_2'&&f&&f[4])f[4]._dir=true;return f&&f[i]||null;};   // 暗影箭是朝右画的有向弹
window.raidFx=(n,i)=>RF(n,i);
// 全屏技能特效（bosses_fxfull：火 / 冰 / 暗影 / 神圣 / 奥术 / 瘟疫 / 闪电 / 鲜血），按技能名选
// 全屏技能：按元素颜色从技能中心泛开一层光 + 一圈波纹（程序绘制，不再拉伸低分辨率图片）
window.fullFx=(name,x,y)=>{G.ffx={col:elemCol(name),t:.7,T:.7,x,y};G.shake=Math.max(G.shake||0,.35);};
// 贴图最多放大到原图 2.2 倍（再大就成马赛克）；超出时返回 false，调用方改用程序绘制
const fxAt=(g,f,x,y,s,a=1)=>{if(!f||s>f.width*2.2)return false;g.globalAlpha=a;g.drawImage(f,x-s/2,y-s/2,s,s);g.globalAlpha=1;return true;};
window.raidDraw=g=>{
  if(!G)return;
  vfxDraw(g);
  g.save();g.textAlign='center';const pulse=.85+.15*Math.sin(G.t*6);
  for(const e of en){
    if(e.dead)continue;
    if(e.totem)fxAt(g,RF('black_1',5),e.x,e.y-8,26,.7);
    if(e.cast){const w=30,p=1-e.cast.t/e.cast.T,y=e.y-e.h/2-14;fxAt(g,RF('black_2',8),e.x,y+2,40,.9);g.fillStyle='rgba(0,0,0,.7)';g.fillRect(e.x-w/2,y,w,4);g.fillStyle=e.cast.need?'#9fe8ff':'#ffb84a';g.fillRect(e.x-w/2,y,w*p,4);
      g.font='bold 6px sans-serif';g.fillStyle='#fff';g.fillText(e.cast.n+(e.cast.need?` 打断 ${e.cast.hits}/${e.cast.need}`:''),e.x,y-2);}
    if(e.aura&&e.aura.warm<=0){const r=e.aura.r;if(FX.whirl&&r*2<=FX.whirl.width*2.2){g.globalAlpha=.6;g.drawImage(FX.whirl,e.x-r,e.y-r,r*2,r*2);g.globalAlpha=1;}else{g.save();g.globalAlpha=.18;g.fillStyle='#ff7a3a';g.beginPath();g.arc(e.x,e.y,r,0,TAU);g.fill();g.globalAlpha=.6;g.strokeStyle='#ffb070';g.lineWidth=2;g.setLineDash([6,5]);g.lineDashOffset=-G.t*20;g.stroke();g.restore();}}
    else if(e.aura){g.strokeStyle='rgba(255,60,60,.8)';g.beginPath();g.arc(e.x,e.y,e.aura.r,0,TAU);g.stroke();}
    if(e.shield&&fxAt(g,RF('black_1',e.shield.kind==='reflect'?4:3),e.x,e.y-e.h*.2,e.w*1.4,.55)){}
    else if(e.shield&&FX.shield){g.globalAlpha=.45;g.drawImage(FX.shield,e.x-e.w*.6,e.y-e.h*.7,e.w*1.2,e.w*1.2);g.globalAlpha=1;}
    if(e.burrow&&fxAt(g,RF('black_1',11),e.burrow.x,e.burrow.y-4,22,.8)){}
    else if(e.burrow){g.fillStyle='rgba(120,90,60,.5)';g.beginPath();g.arc(e.burrow.x,e.burrow.y,10,0,TAU);g.fill();}
    if(e.mpRate){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(e.x-15,e.y+e.h/2+2,30,2);g.fillStyle='#5ab4ff';g.fillRect(e.x-15,e.y+e.h/2+2,30*e.mp/100,2);}
  }
  if(G.bomb)fxAt(g,RF('black_1',0),pl.x,pl.y,G.bomb.r*2.2,.55*pulse);
  if(G.bomb){g.strokeStyle='rgba(255,80,40,.9)';g.lineWidth=1;g.beginPath();g.arc(pl.x,pl.y,G.bomb.r,0,TAU);g.stroke();g.font='bold 9px sans-serif';g.fillStyle='#ff6a3a';g.fillText(Math.ceil(G.bomb.t),pl.x,pl.y-18);}
  if(G.gaze&&fxAt(g,RF('black_1',6),pl.x,pl.y-24,18*pulse)){}
  else if(G.gaze){g.font='bold 8px sans-serif';g.fillStyle='#ff3b3b';g.fillText('别动！',pl.x,pl.y-20);}
  if(G.curse&&G.curse.t>0&&G.curse.kind==='delayed'){const f=RF('black_1',1);g.font='bold 8px sans-serif';g.fillStyle='#c060ff';if(fxAt(g,f,pl.x,pl.y-26,16))g.fillText(Math.ceil(G.curse.t),pl.x,pl.y-14);else g.fillText('☠'+Math.ceil(G.curse.t),pl.x,pl.y-22);}
  if(G.pol){const r=R();g.globalAlpha=.12;g.fillStyle='#ff4a4a';g.fillRect(r.x,r.y,r.w/2,r.h);g.fillStyle='#4a9cff';g.fillRect(r.cx,r.y,r.w/2,r.h);g.globalAlpha=1;
    if(!fxAt(g,RF('black_1',G.pol.sign>0?7:8),pl.x,pl.y-22,14)){g.font='bold 8px sans-serif';g.fillStyle=G.pol.sign>0?'#ff6a6a':'#6ab4ff';g.fillText(G.pol.sign>0?'＋':'－',pl.x,pl.y-20);}}
  if(G.stomachT>0)fxAt(g,RF('black_1',10),pl.x,pl.y,30,.6);
  if(pl.frozenT>0&&G.wrapK)fxAt(g,RF('green',G.wrapK),pl.x,pl.y-4,20,.85);else G.wrapK=0;   // 冰冻 = 冰块，蛛网包裹 = 茧
  if(G.markN)fxAt(g,RF('black_1',9),pl.x+10,pl.y-18,10+Math.min(6,G.markN));
  {const rr=R(),FF=sheet('bosses_fxfull');
    g.save();g.beginPath();g.rect(rr.x,rr.y,rr.w,rr.h);g.clip();
    if(G.ffx&&G.ffx.t>0){const F=G.ffx,p=1-F.t/F.T,cx=F.x??rr.x+rr.w/2,cy=F.y??rr.y+rr.h/2,R0=Math.hypot(rr.w,rr.h)*(.25+.85*p);g.save();g.globalCompositeOperation='lighter';
      const gr=g.createRadialGradient(cx,cy,0,cx,cy,R0);gr.addColorStop(0,F.col);gr.addColorStop(.7,F.col);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=Math.sin(Math.PI*p)*.35;g.fillStyle=gr;g.fillRect(rr.x,rr.y,rr.w,rr.h);
      g.globalAlpha=(1-p)*.8;g.strokeStyle=F.col;g.lineWidth=3;g.beginPath();g.arc(cx,cy,R0*.8,0,TAU);g.stroke();g.restore();}
    if(G.realm){fxAt(g,RF('black_2',11),rr.cx,rr.y+rr.h/2,70,.25);g.globalAlpha=.18;g.fillStyle=G.realm.tint;g.fillRect(rr.x,rr.y,rr.w,rr.h);g.globalAlpha=1;}
    g.restore();}
  if(G.beams3)for(const c of G.beams3.cols){const a=Math.atan2(G.beams3.b.y-c.y,G.beams3.b.x-c.x),l=Math.hypot(G.beams3.b.x-c.x,G.beams3.b.y-c.y);drawBeam(g,c.x,c.y,a,l,5,c.c,.9,G.t+c.x);fxAt(g,RF('black_2',11),c.x,c.y,22);}
  if(G.orbs)for(const o of G.orbs){if(fxAt(g,RF('black_2',9),o.x,o.y,o.r*1.4,.9))continue;if(PJ.orb)g.drawImage(PJ.orb,o.x-o.r*.6,o.y-o.r*.6,o.r*1.2,o.r*1.2);}
  if(G.cutter){const C=G.cutter,r=R(),c={x:r.cx,y:r.y+r.h/2};g.save();g.translate(c.x,c.y);g.rotate(C.a);const ct=RF('black_3',3)||FX.beam;if(ct)g.drawImage(ct,-300,-C.w*1.5,600,C.w*3);g.restore();}
  for(const e of en)if(e.cannons&&!e.dead)for(const c of e.cannons){if(IT.turret)g.drawImage(IT.turret,c.x-9,c.y-12,18,18);g.strokeStyle='rgba(255,215,90,.6)';g.beginPath();g.arc(c.x,c.y,12,0,TAU);g.stroke();}
  if(G.absorb){g.font='bold 7px sans-serif';g.fillStyle='#ffb84a';g.fillText(`吸收盾 ${Math.min(100,Math.round(G.absorb.got/G.absorb.need*100))}% · ${Math.ceil(G.absorb.t)}s`,pl.x,pl.y-26);}
  if(G.mcT>0&&fxAt(g,RF('black_1',2),pl.x,pl.y-22,18*pulse)){}
  else if(G.mcT>0){g.font='bold 8px sans-serif';g.fillStyle='#c060ff';g.fillText('👁',pl.x,pl.y-20);}
  g.restore();
};
})();
