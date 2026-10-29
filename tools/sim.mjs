// 无界面平衡模拟：node tools/sim.mjs [levels=all|1,5,9|raid:mc] [runs=3] [classes=all]
// 用桩替代 DOM / 画布 / 音频，载入 game.html 的脚本 + content/raids_data.js + src/raid_engine.js，直接循环 update(dt)。
import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';

function stub(name='stub'){
  const store={};
  const f=function(){};
  return new Proxy(f,{
    get(t,p){
      if(p in store)return store[p];
      if(p===Symbol.toPrimitive)return()=>'';
      if(p==='classList')return store[p]=new Proxy({},{get:()=>()=>false});
      if(p==='style'||p==='dataset')return store[p]={};
      if(p==='getContext')return()=>ctx2d();
      if(p==='getBoundingClientRect')return()=>({left:0,top:0,width:390,height:693});
      if(p==='querySelectorAll'||p==='children')return()=>[];
      if(p==='querySelector'||p==='closest')return()=>null;
      if(p==='width'||p==='height')return store[p]=1;
      if(p==='innerHTML'||p==='textContent'||p==='innerText')return store[p]='';
      if(p==='then')return undefined;
      return store[p]=stub(p);
    },
    set(t,p,v){store[p]=v;return true;},
    apply(){return undefined;},
  });
}
function ctx2d(){
  return new Proxy({},{get(t,p){
    if(p==='getImageData'||p==='createImageData')return(x,y,w,h)=>({data:new Uint8ClampedArray(Math.max(1,(w||x||1)*(h||y||1))*4)});
    if(p==='createLinearGradient'||p==='createRadialGradient'||p==='createPattern')return()=>({addColorStop(){}});
    if(p==='measureText')return()=>({width:0});
    if(p in t)return t[p];
    return()=>{};
  },set(t,p,v){t[p]=v;return true;}});
}
const els={};
const document={
  getElementById:id=>els[id]||(els[id]=stub(id)),
  createElement:()=>stub('el'),
  querySelector:()=>null,querySelectorAll:()=>[],
  addEventListener(){},body:stub('body'),hidden:false,
};
const store=new Map();
const ctx={
  document,window:null,console,Math,Date,JSON,Set,Map,WeakMap,Array,Object,Number,String,Boolean,Promise,Symbol,Uint8Array,Uint8ClampedArray,Float32Array,Infinity,NaN,isFinite,parseInt,parseFloat,
  navigator:{},location:{search:'',reload(){}},
  localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
  performance:{now:()=>Date.now()},
  setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},requestAnimationFrame:()=>0,cancelAnimationFrame(){},
  Image:class{set src(v){}},Audio:class{play(){return Promise.resolve();}setAttribute(){}},
  addEventListener(){},confirm:()=>false,alert(){},
  URLSearchParams,devicePixelRatio:1,innerWidth:390,innerHeight:693,
};
ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;ctx.SIM=true;
vm.createContext(ctx);
const html=readFileSync('game.html','utf8'),a=html.lastIndexOf('<script>'),b=html.indexOf('</script>',a);
vm.runInContext(readFileSync('content/raids_data.js','utf8'),ctx,{filename:'raids_data.js'});
vm.runInContext(readFileSync('content/boss_tune.js','utf8'),ctx,{filename:'boss_tune.js'});
vm.runInContext(readFileSync('src/loop.js','utf8'),ctx,{filename:'loop.js'});
vm.runInContext(html.slice(a+8,b),ctx,{filename:'game.js'});
vm.runInContext(readFileSync('content/skill_fx.js','utf8'),ctx,{filename:'skill_fx.js'});
vm.runInContext(readFileSync('src/raid_engine.js','utf8'),ctx,{filename:'raid_engine.js'});
vm.runInContext(readFileSync('content/rigs.js','utf8'),ctx,{filename:'rigs.js'});
vm.runInContext(readFileSync('src/rig.js','utf8'),ctx,{filename:'rig.js'});

// 测试辅助（在游戏上下文里执行）
vm.runInContext(`
// 到达第 ri 章时的账号等级：按正常首通一路打过来的经验估算
var setMeta=ri=>{PROG.acc={lv:[1,14,16,25,34][ri]??Math.min(80,Math.round(1+ri*8)),xp:0};PROG.inv=[];PROG.eq={};PROG.party=[];
  if(ri===0)return;
  for(const[slot]of SLOTS){const it=makeItem(ri-1);it.slot=slot;it.rar=ri>=3?3:2;it.set=it.rar>=3?[0,1,1,3,3][ri-1]??3:null;
    it.st=slot==='wpn'?{atk:.06*1.7*(1+.25*ri)}:slot==='trk'?{crit:.04*1.7*(1+.25*ri)}:{hp:.07*1.7*(1+.25*ri)};PROG.inv.push(it);PROG.eq[slot]=it.id;}};
var lvSim=(cls,L,T)=>{selCls=cls;selLevel=L;startGame();const dt=1/30;let t=0,bt0=-1;
  while(t<T){
    if(G.state==='play'){const bx=G.boss&&G.boss.x,by=G.boss&&G.boss.y;update(dt);if(G.boss&&bx!==undefined&&bt0>=0){globalThis.MV=(globalThis.MV||0)+Math.hypot(G.boss.x-bx,G.boss.y-by);globalThis.MVT=(globalThis.MVT||0)+dt;}if(bt0<0&&G.boss&&G.cfg&&G.cfg.type==='big')bt0=t;if(G.L!==L)return{w:1,t,ri:G.ri,bossT:bt0<0?0:t-bt0};}
    else if(G.state==='pick')choose((rand()*G.offer.cards.length)|0);
    else if(G.state==='cutin'){G.cutT-=dt;if(G.cutT<=0){G.state='play';doUlt();}}
    else return{w:G.state==='win'?1:0,bossT:G.state==='win'&&bt0>=0?t-bt0:0,t,ri:G.ri,boss:G.rooms&&G.ri===G.rooms.length-1,bhp:G.boss?Math.round(G.boss.hp/G.boss.max*100):-1,binv:G.boss&&G.boss.inv,bmode:G.boss&&G.boss.mode};
    if(G.state==='play'&&G.pickQ.length)openPick(G.pickQ.shift());t+=dt;}
  return{w:0,t,ri:G.ri,timeout:1,bhp:G.boss?Math.round(G.boss.hp/G.boss.max*100):-1,binv:G.boss&&G.boss.inv,bmode:G.boss&&G.boss.mode,ens:en.filter(e=>!e.dead).length};};
// 像真人一样选卡：优先选已经拿得最多的流派（凑套装加成），其次品质高的
var smartPick=()=>{let bi=0,bs=-1;G.offer.cards.forEach((h,i)=>{const sc=(G.tags[h.tag]||0)*10+h.tier;if(sc>bs){bs=sc;bi=i;}});return bi;};
// 整章连打：从章首关开始一路打到章末（海克斯整章保留），返回是否通关、死在哪关、各首领用时
// --exw：给本职业装上专武（--star N 指定星级）
var giveExw=cls=>{if(!globalThis.EXW_ON)return;const it={id:PROG.iid++,slot:'wpn',rar:5,ri:0,set:null,st:{atk:.35,skill:.12,crit:.05},fx:[],n:'exw',il:90,up:0,ex:cls,star:globalThis.EXW_STAR||0};PROG.inv.push(it);PROG.eq.wpn=it.id;};
// 无尽深渊：从第一章打到死，返回到达层数、轮数
var endlessSim=(cls,metaRi)=>{setMeta(metaRi);giveExw(cls);PROG.best={};selCls=cls;selLevel=firstL(0);ENDLESS_GO=true;startGame();const dt=1/30;let t=0;
  while(t<30000){
    if(G.state==='play')update(dt);
    else if(G.state==='pick')choose(globalThis.SMART?smartPick():(rand()*G.offer.cards.length)|0);
    else if(G.state==='cutin'){G.cutT-=dt;if(G.cutT<=0){G.state='play';doUlt();}}
    else return{floor:G.endless?G.endless.floor:0,loop:G.endless?G.endless.loop:0,t};
    if(G.state==='play'&&G.pickQ.length)openPick(G.pickQ.shift());t+=dt;}
  return{floor:G.endless.floor,loop:G.endless.loop,t,timeout:1};};
var runSim=(cls,ri)=>{const L0=firstL(ri);setMeta(ri);giveExw(cls);PROG.best={};selCls=cls;selLevel=L0;startGame();const dt=1/30;let t=0,bt0=-1,curL=L0,bts=[];
  let lastHit=0,hsum=-1,stuckN=0;
  while(t<9000){
    // 卡位检测：战斗中有活敌人，却 15 秒没有任何一方掉血（主角或怪被卡在墙角 / 够不着）
    if(G.state==='play'&&G.phase==='fight'){const alive=en.filter(e=>!e.dead&&!e.prop),hs=alive.reduce((a,e)=>a+e.hp,0)+pl.hp;if(!alive.length||hs!==hsum){hsum=hs;lastHit=t;}else if(t-lastHit>15){stuckN++;(globalThis.STUCK=globalThis.STUCK||[]).push({cls,L:G.L,room:G.ri,boss:!!G.boss,px:Math.round(pl.x),py:Math.round(pl.y),ens:alive.slice(0,3).map(e=>(e.name||e.k)+'@'+Math.round(e.x)+','+Math.round(e.y)+(e.inv?'(无敌)':'')+(e.hidden?'(隐身)':''))});lastHit=t;}}
    if(G.state==='play'){update(dt);if(bt0<0&&G.boss&&G.cfg&&G.cfg.type==='big')bt0=t;if(G.L!==curL){bts.push(bt0<0?0:t-bt0);bt0=-1;curL=G.L;}}
    else if(G.state==='pick')choose(globalThis.SMART?smartPick():(rand()*G.offer.cards.length)|0);
    else if(G.state==='cutin'){G.cutT-=dt;if(G.cutT<=0){G.state='play';doUlt();}}
    else{if(G.state==='win')bts.push(bt0<0?0:t-bt0);return{w:G.state==='win'?1:0,L:G.L,k:G.L-L0,bts,t,room:G.ri,boss:!!(G.cfg&&G.cfg.type==='big'),bhp:G.boss&&G.boss.max?Math.round(G.boss.hp/G.boss.max*100):-1};}
    if(G.state==='play'&&G.pickQ.length)openPick(G.pickQ.shift());t+=dt;}
  return{w:0,L:G.L,k:G.L-L0,bts,t,timeout:1};};
`,ctx);

const args=process.argv.slice(2);
if(args.includes('--smart'))ctx.SMART=true;
process.on('exit',()=>{const S=ctx.STUCK||[];if(args.includes('--stuck')){console.log(`卡位 ${S.length} 次`);for(const x of S.slice(0,15))console.log(JSON.stringify(x));}});
if(args.includes('--exw')){ctx.EXW_ON=true;const si=args.indexOf('--star');if(si>0)ctx.EXW_STAR=+args[si+1];}
if(args.includes('--endless')){const ev0=e=>vm.runInContext(e,ctx),CL0=ev0('CLS_IDS'),ai=args.indexOf('--cls'),CL=ai>0?args[ai+1].split(','):CL0,mi=args.indexOf('--meta'),meta=mi>0?+args[mi+1]:2,runs=+(args[args.indexOf('--endless')+1]||2),es=ev0('endlessSim'),all=[];
  for(const c of CL){const f=[];for(let i=0;i<runs;i++){let r;try{r=es(c,meta);}catch(e){console.error('ERR',c,e.message);r={floor:-1};}f.push(r.floor);all.push(r.floor);}f.sort((a,b)=>a-b);console.log(`无尽 ${c}: 层数 ${f.join(',')}  中位 ${f[f.length>>1]}`);}
  all.sort((a,b)=>a-b);console.log(`无尽 全职业中位 ${all[all.length>>1]}  最少 ${all[0]}  最多 ${all[all.length-1]}`);process.exit(0);}
if(args.includes('--run')){const ev0=e=>vm.runInContext(e,ctx),RA=ev0('RAIDS'),CL0=ev0('CLS_IDS'),ai=args.indexOf('--cls'),CL=ai>0?args[ai+1].split(','):CL0,ci=args.indexOf('--ch'),CH=ci>0?args[ci+1].split(',').map(Number):null,runSim=ev0('runSim'),setMeta0=ev0('setMeta');const runs=+(args[1]||2);const t0=Date.now();const cw={};
  const J=[];for(let ri=0;ri<RA.length;ri++){if(CH&&!CH.includes(ri))continue;setMeta0(ri);let w=0,n=0,bt=[],deaths={};const per=RA[ri].bosses.map(b=>({n:b.n,t:[],reach:0,die:0}));for(const c of CL)for(let i=0;i<runs;i++){let r;try{r=runSim(c,ri);}catch(e){console.error('ERR',c,ri,e.message);r={w:0,k:-1,bts:[]};}
      w+=r.w;n++;bt.push(...r.bts.filter(x=>x>0));r.bts.forEach((x,k)=>{if(per[k]&&x>0)per[k].t.push(x);});for(let k=0;k<=Math.min(r.k,per.length-1);k++)per[k].reach++;if(!r.w&&per[r.k]){per[r.k].die++;(per[r.k].where=per[r.k].where||[]).push(r.boss?'首领'+r.bhp+'%':'房'+r.room);}if(!r.w)deaths[r.k+1]=(deaths[r.k+1]||0)+1;(cw[c]=cw[c]||[0,0,[]]);cw[c][0]+=r.w;cw[c][1]++;cw[c][2].push(...r.bts.filter(x=>x>0));}
    J.push({ri,clear:w/n,per});    bt.sort((a,b)=>a-b);console.log(`${RA[ri].name}: 整章通关 ${Math.round(w/n*100)}%  首领用时 中位 ${Math.round(bt[bt.length>>1]||0)}s 最慢 ${Math.round(bt[bt.length-1]||0)}s  死在第几关 ${JSON.stringify(deaths)}`);}
  if(args.includes('--json'))writeFileSync(process.env.RUN_JSON||'run_stats.json',JSON.stringify(J));
  const md=a=>{a.sort((x,y)=>x-y);return Math.round(a[a.length>>1]||0);};console.log('职业首领用时中位：'+CL.map(c=>`${c} ${md(cw[c][2])}s`).join(' | '));
  console.log('职业整章通关：'+CL.map(c=>`${c} ${Math.round(cw[c][0]/cw[c][1]*100)}%`).join(' | ')+`  (${((Date.now()-t0)/1000).toFixed(0)}s)`);process.exit(0);}

const ev=e=>vm.runInContext(e,ctx);
const NLV=ev('NLV()'),RAIDS=ev('RAIDS'),firstL=ev('firstL'),LV=ev('LV'),CLS_IDS=ev('CLS_IDS'),setMeta=ev('setMeta'),lvSim=ev('lvSim');
let levels=[];
const spec=args[0]||'sample';
if(spec==='all')for(let L=1;L<=NLV;L++)levels.push(L);
else if(/^every\d+$/.test(spec))for(let L=1;L<=NLV;L+=+spec.slice(5))levels.push(L);
else if(spec==='sample')RAIDS.forEach((r,i)=>{const f=firstL(i);levels.push(f+Math.min(1,r.bosses.length-1));});
else if(spec.startsWith('raid:')){const i=RAIDS.findIndex(r=>r.id===spec.slice(5));const f=firstL(i);for(let k=0;k<RAIDS[i].bosses.length;k++)levels.push(f+k);}
else levels=spec.split(',').map(Number);
const runs=+(args[1]||3),classes=args[2]&&args[2]!=='all'?args[2].split(','):CLS_IDS,T=+(args[3]||600);
const tot={};for(const c of classes)tot[c]={w:0,n:0,t:0,bossDeath:0};const bossTs={};
const perLevel=[];
const t0=Date.now();
for(const L of levels){
  const v=LV[L];setMeta(v.ri);const row={L,n:v.b.n,w:0,n2:0};ctx.MV=0;ctx.MVT=0;
  for(const c of classes)for(let i=0;i<runs;i++){
    let r;try{r=lvSim(c,L,T);}catch(e){console.error(`ERR ${c} L${L} ${v.b.n}: ${e.message}\n${(e.stack||'').split('\n').slice(1,3).join('\n')}`);r={w:0,t:0};}
    if(args.includes('--debug')&&!r.w)console.log(`  ${c} L${L} ${v.b.n}: ${r.timeout?'超时':'阵亡'} 房${r.ri} 首领血${r.bhp}% inv=${r.binv} mode=${r.bmode} 剩敌${r.ens??''} t=${Math.round(r.t)}`);
    if(r.w&&r.bossT)(bossTs[L]=bossTs[L]||[]).push(r.bossT);
    tot[c].w+=r.w;tot[c].n++;tot[c].t+=r.t;if(!r.w&&r.boss)tot[c].bossDeath++;row.w+=r.w;row.n2++;}
  if(args.includes('--move'))console.log(`L${L} ${v.b.n} 首领移动 ${Math.round(ctx.MV/Math.max(1,ctx.MVT))} px/s · spd ${Math.round((ctx.G&&0)||0)}`);
  perLevel.push(row);
}
console.log(`levels=${levels.length} runs=${runs} time=${((Date.now()-t0)/1000).toFixed(1)}s`);
console.log('职业胜率：'+classes.map(c=>`${c} ${Math.round(tot[c].w/tot[c].n*100)}%`).join(' | '));
console.log('首领房阵亡：'+classes.map(c=>`${c} ${tot[c].bossDeath}`).join(' | '));
if(args.includes('--levels'))for(const r of perLevel){const b=bossTs[r.L]||[];console.log(`L${r.L} ${r.n}: ${Math.round(r.w/r.n2*100)}%  首领用时 ${b.length?Math.round(b.reduce((a,x)=>a+x,0)/b.length)+'s':'-'}`);}

// --tune N：自动校准。每轮跑全部样本关卡 × 全职业，按偏离均值修正职业系数，按偏离目标胜率修正全局难度
const ti=args.indexOf('--tune');
if(ti>=0){
  const rounds=+args[ti+1]||3,target=+(process.env.TARGET||.65),CLS=ev('CLS'),BAL=ev('BAL');
  const fac={};for(const c of CLS_IDS)fac[c]=[1,1];
  for(let k=0;k<rounds;k++){
    const rate={};let sum=0;
    for(const c of CLS_IDS){let w=0,n=0;for(const L of levels){setMeta(LV[L].ri);for(let i=0;i<runs;i++){let r;try{r=lvSim(c,L,T);}catch(e){r={w:0};}w+=r.w;n++;}}rate[c]=w/n;sum+=rate[c];}
    const mean=sum/CLS_IDS.length;
    console.log(`第 ${k+1} 轮：均值 ${Math.round(mean*100)}% · `+CLS_IDS.map(c=>`${c} ${Math.round(rate[c]*100)}%`).join(' ')+` · BAL ${JSON.stringify(BAL)}`);
    for(const c of CLS_IDS){const f=Math.min(1.18,Math.max(.85,1+1.1*(mean-rate[c])));CLS[c].dmg*=Math.pow(f,.6);CLS[c].hp=Math.round(CLS[c].hp*Math.pow(f,.4));fac[c][0]*=Math.pow(f,.4);fac[c][1]*=Math.pow(f,.6);}
    const g=Math.min(1.35,Math.max(.75,1+1.4*(mean-target)));BAL.bossHp*=g;BAL.bossDmg*=Math.sqrt(g);BAL.mobHp*=Math.sqrt(g);BAL.mobDmg*=Math.pow(g,.3);
  }
  console.log('建议 TUNE 乘数：'+JSON.stringify(Object.fromEntries(CLS_IDS.map(c=>[c,fac[c].map(x=>+x.toFixed(3))]))));
  console.log('建议 BAL：'+JSON.stringify(Object.fromEntries(Object.entries(BAL).map(([k,v])=>[k,+v.toFixed(3)]))));
}
