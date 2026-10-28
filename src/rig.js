// 2D 分件骨骼动画：GPT 按体型画出同一角色的分件，代码按关节组装、按姿势转动。
// 每帧都用同一套部件，动作再多也不会变形、抽搐。体型：humanoid 人形 / quad 四足 / dragon 龙 / floater 漂浮（元素、幽灵、娜迦）/ insect 多足虫 / serpent 蛇与虫。
// 部件顺序见 content/rigs.js 的 RIG_PARTS（与生图提示词一致）。依赖 raid_engine.js 暴露的 window.raidSheet。
(function(){
'use strict';
const PARTS=window.RIG_PARTS||{};
const MAP=window.RIG_MAP||{boss:{},trash:{},hero:{}};
// 兼容旧原型：鲁西弗隆
MAP.boss=MAP.boss||{};if(!MAP.boss['鲁西弗隆'])MAP.boss['鲁西弗隆']={plan:'humanoid',sheet:'rig_lucifron',grip:.32};
window.rigOf=(kind,key)=>{const m=MAP[kind]&&MAP[kind][key];return m||null;};

function box(c){const w=c.width,h=c.height,d=c.getContext('2d',{willReadFrequently:true}).getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>60){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  return x1<0?null:{x0,y0,x1,y1,w:x1-x0+1,h:y1-y0+1,cx:(x0+x1)/2,cy:(y0+y1)/2};}
const CACHE={};
// 特效部件常被 GPT 画出格子、切图后边缘一刀齐：按到格子边的距离把透明度渐隐掉
const FXP=new Set(['slash','fx','spark']);
// 部件裁到包围盒（留 1 像素），省掉格子里的空白内存；裁完直接替换图集里的帧，不留两份
function crop(c){const b=box(c);if(!b)return c;const o=document.createElement('canvas');o.width=b.w+2;o.height=b.h+2;o.getContext('2d').drawImage(c,b.x0-1,b.y0-1,b.w+2,b.h+2,0,0,b.w+2,b.h+2);return o;}
function fade(c){const w=c.width,h=c.height,o=document.createElement('canvas');o.width=w;o.height=h;const x=o.getContext('2d');x.drawImage(c,0,0);
  const d=x.getImageData(0,0,w,h),a=d.data,m=Math.max(4,Math.min(w,h)*.18);
  for(let y=0;y<h;y++)for(let i=0;i<w;i++){const e=Math.min(i,y,w-1-i,h-1-y);if(e<m)a[(y*w+i)*4+3]*=e/m;}
  x.putImageData(d,0,0);return o;}
// 图集加载后算一次：每个部件的图和包围盒，以及整体高度（用于缩放到游戏里的身高）
function build(R){if(!R)return null;const k=R.sheet;if(CACHE[k]!==undefined)return CACHE[k];const f=window.raidSheet&&raidSheet(k);if(!f)return null;
  const names=PARTS[R.plan]||PARTS.humanoid,im={},b={};names.forEach((n,i)=>{if(f[i]&&!f[i]._rc){f[i]=crop(FXP.has(n)?fade(f[i]):f[i]);f[i]._rc=1;}im[n]=f[i];b[n]=im[n]&&box(im[n]);});
  const need=(PLAN[R.plan]||PLAN.humanoid).need;if(need.some(n=>!b[n]))return CACHE[k]=null;
  const H=(PLAN[R.plan]||PLAN.humanoid).height(b),tw=(b.torso||b.body||{}).w||0;
  // 侧面人形 GPT 常画得偏瘦：躯干宽不足身高 0.3 时横向加宽，最多 1.3 倍
  return CACHE[k]={R,im,b,H,wide:b.torso&&tw?Math.max(1,Math.min(1.3,H*.3/tw)):1};}
window.rigReady=R=>!!build(R);
window.rigCache=CACHE;   // 换团本时由 raid_engine 的 evictOthers 清掉别的团本的部件

const draw=(g,im,ax,ay,ang,px,py)=>{g.save();g.translate(ax,ay);g.rotate(ang);g.drawImage(im,-px,-py);g.restore();};
const top=b=>b.y0+2,bot=b=>b.y1-2;
// 肩关节在肩甲/上臂顶端往下约 0.3 个宽度处：绕这里转，手臂前挥时肩甲不会翻到脸上
const sh=b=>Math.min(b.w,b.h)*.3;

// ---------- 各体型：姿势表 + 组装绘制 ----------
// 正面姿势：l* 为画面左侧手臂（正角向外张），r* 为右侧（负角向外张）；武器全局朝向 = rUp + rLow + wpn
const FP={idle:{torso:0,head:0,lUp:.15,lLow:.05,rUp:-.15,rLow:-.05,wpn:-1.37,dy:0},walk:{torso:0,head:0,lUp:.12,lLow:.05,rUp:-.12,rLow:-.05,wpn:-1.4,dy:0},
 wind:{torso:-.06,head:-.08,lUp:.4,lLow:.2,rUp:-2.6,rLow:-.3,wpn:1,dy:0},atk:{torso:.08,head:.06,lUp:.3,lLow:.2,rUp:-.5,rLow:-.2,wpn:3,dy:1.5},
 rec:{torso:.03,head:.03,lUp:.2,lLow:.1,rUp:-.3,rLow:-.1,wpn:2.3,dy:.5},cast:{torso:0,head:-.1,lUp:2.6,lLow:.2,rUp:-2.6,rLow:-.2,wpn:1.23,dy:-1},
 hurt:{torso:.1,head:.2,lUp:.5,lLow:.3,rUp:-.5,rLow:-.3,wpn:-.4,dy:0}};
const frontArms=(g,L,r,tb,sw,wk,grip)=>{const{im,b}=L;
  const arm=(up,low,x,aUp,aLow,wpn)=>{if(!b[up]||!b[low])return;const ub=b[up],lb=b[low];g.save();g.translate(x,-tb.h*.78+sh(ub));g.rotate(aUp);g.drawImage(im[up],-ub.cx,-top(ub)-sh(ub));
    g.translate(0,ub.h-6-sh(ub));g.rotate(aLow);g.drawImage(im[low],-lb.cx,-top(lb));
    if(wpn&&b[wk]){const wb=b[wk];g.translate(0,lb.h-8);g.rotate(r.wpn);g.drawImage(im[wk],-(wb.x0+wb.w*grip),-wb.cy);}g.restore();};
  arm('lUp','lLow',-tb.w*.4,r.lUp+sw*.1,r.lLow,false);arm('rUp','rLow',tb.w*.4,r.rUp+sw*.1,r.rLow,true);};
const PLAN={
 humanoid:{need:['head','torso','pelvis','nearUp','nearLow','nearLeg'],
  height:b=>Math.max(b.nearLeg.h,b.farLeg?b.farLeg.h:0)+b.pelvis.h*.5+b.torso.h*.85+b.head.h*.85,
  pose:{idle:{torso:0,head:0,farUp:.12,farLow:.18,nearUp:-.05,nearLow:-.55,wpn:0,farLeg:0,nearLeg:0,dy:0},
   walk:{torso:.04,head:-.02,farUp:0,farLow:.2,nearUp:0,nearLow:-.55,wpn:-.05,farLeg:0,nearLeg:0,dy:0},
   wind:{torso:-.18,head:-.1,farUp:.5,farLow:.4,nearUp:-2.3,nearLow:-.9,wpn:.5,farLeg:-.15,nearLeg:.25,dy:0},
   atk:{torso:.22,head:.1,farUp:-.2,farLow:.1,nearUp:-1.2,nearLow:-.1,wpn:1.4,farLeg:.25,nearLeg:-.3,dy:1.5},
   rec:{torso:.08,head:.04,farUp:.1,farLow:.2,nearUp:-.8,nearLow:-.3,wpn:1.2,farLeg:.1,nearLeg:-.1,dy:.5},
   cast:{torso:-.12,head:-.18,farUp:-2.6,farLow:-.3,nearUp:-2.4,nearLow:-.4,wpn:1.2,farLeg:0,nearLeg:0,dy:-1},
   hurt:{torso:-.25,head:-.3,farUp:.4,farLow:.5,nearUp:.3,nearLow:-.2,wpn:-1.5,farLeg:.1,nearLeg:-.1,dy:0}},
  draw(g,L,r,sw,bob){const{im,b}=L,tb=b.torso,pb=b.pelvis,legL=Math.max(b.nearLeg.h,b.farLeg?b.farLeg.h:0),hipY=-legL+r.dy+bob;
   const leg=(k,a)=>{if(b[k])draw(g,im[k],k==='farLeg'?-3:3,hipY,a,b[k].cx,top(b[k]));};
   const arm=(up,low,aUp,aLow,wpn)=>{if(!b[up]||!b[low])return;const ub=b[up],lb=b[low];g.save();g.translate(up==='nearUp'?tb.w*.14:-tb.w*.12,-tb.h*.78+sh(ub));g.rotate(aUp);g.drawImage(im[up],-ub.cx,-top(ub)-sh(ub));
     g.translate(0,ub.h-6-sh(ub));g.rotate(aLow);g.drawImage(im[low],-lb.cx,-top(lb));
     if(wpn&&b.weapon){const wb=b.weapon;g.translate(0,lb.h-8);g.rotate(r.wpn);g.drawImage(im.weapon,-(wb.x0+wb.w*(L.R.grip||.3)),-wb.cy);}g.restore();};
   leg('farLeg',r.farLeg-sw*.45);
   g.save();g.translate(0,hipY-pb.h*.35);g.rotate(r.torso);arm('farUp','farLow',r.farUp+sw*.3,r.farLow,false);g.restore();
   g.drawImage(im.pelvis,-pb.cx,hipY-pb.cy);
   leg('nearLeg',r.nearLeg+sw*.45);
   g.save();g.translate(0,hipY-pb.h*.35);g.rotate(r.torso);g.drawImage(im.torso,-tb.cx,-bot(tb));
   g.save();g.translate(0,-tb.h*.8);g.rotate(r.head);g.drawImage(im.head,-b.head.cx,-(b.head.y1-b.head.h*.14));g.restore();
   arm('nearUp','nearLow',r.nearUp-sw*.3,r.nearLow,true);g.restore();}},
 // 正面（玩家在下方时）：左右对称，手臂在肩两侧，右手持武器；走路两腿交替抬起
 front:{need:['head','torso','pelvis','rUp','rLow','lLeg','rLeg'],
  height:b=>Math.max(b.lLeg.h,b.rLeg.h)+b.pelvis.h*.5+b.torso.h*.85+b.head.h*.85,
  pose:FP,
  draw(g,L,r,sw,bob){const{im,b}=L,tb=b.torso,pb=b.pelvis,legL=Math.max(b.lLeg.h,b.rLeg.h),hipY=-legL+r.dy+bob;
   const leg=(k,x,lift)=>{if(b[k])g.drawImage(im[k],x-b[k].cx,hipY-top(b[k])-lift);};
   leg('lLeg',-pb.w*.2,Math.max(0,sw)*4);leg('rLeg',pb.w*.2,Math.max(0,-sw)*4);
   g.drawImage(im.pelvis,-pb.cx,hipY-pb.cy);
   g.save();g.translate(0,hipY-pb.h*.35);g.rotate(r.torso);g.drawImage(im.torso,-tb.cx,-bot(tb));
   g.save();g.translate(0,-tb.h*.8);g.rotate(r.head);g.drawImage(im.head,-b.head.cx,-(b.head.y1-b.head.h*.14));g.restore();
   frontArms(g,L,r,tb,sw,'weapon',L.R.grip||.3);g.restore();}},
 ffront:{need:['head','torso','lower','rUp','rLow'],
  height:b=>b.lower.h*.8+b.torso.h*.85+b.head.h*.85,
  pose:FP,
  draw(g,L,r,sw,bob){const{im,b}=L,tb=b.torso,lb=b.lower,wy=-lb.h*.75+r.dy+Math.sin(G.t*2.4)*2.5;
   draw(g,im.lower,0,wy+lb.h*.1,Math.sin(G.t*3)*.06,lb.cx,top(lb));
   g.save();g.translate(0,wy+lb.h*.1);g.rotate(r.torso);g.drawImage(im.torso,-tb.cx,-bot(tb));
   g.save();g.translate(0,-tb.h*.8);g.rotate(r.head);g.drawImage(im.head,-b.head.cx,-(b.head.y1-b.head.h*.14));g.restore();
   frontArms(g,L,r,tb,Math.sin(G.t*2)*.5,'item',.3);g.restore();}},
 // 四足：身体为根，四条腿对角交替摆动，头接在身体前上方，尾巴接在后方
 quad:{need:['head','body','fNear','bNear'],
  height:b=>b.body.h*.8+Math.max(b.fNear.h,b.bNear.h)*.9+b.head.h*.35,
  pose:{idle:{body:0,head:0,tail:0,fFar:0,fNear:0,bFar:0,bNear:0,dy:0},walk:{body:0,head:.05,tail:.1,fFar:0,fNear:0,bFar:0,bNear:0,dy:0},
   wind:{body:-.18,head:-.35,tail:.35,fFar:-.3,fNear:-.4,bFar:.3,bNear:.4,dy:2},atk:{body:.15,head:.35,tail:-.2,fFar:.6,fNear:.7,bFar:-.5,bNear:-.6,dy:-1},
   rec:{body:.05,head:.1,tail:0,fFar:.2,fNear:.2,bFar:-.1,bNear:-.1,dy:0},cast:{body:-.3,head:-.5,tail:.4,fFar:-.6,fNear:-.7,bFar:.1,bNear:.1,dy:-2},
   hurt:{body:-.15,head:-.3,tail:.3,fFar:-.2,fNear:-.2,bFar:.2,bNear:.2,dy:0}},
  draw(g,L,r,sw,bob){const{im,b}=L,B=b.body,legH=Math.max(b.fNear.h,b.bNear.h),by=-legH*.85+r.dy+bob;
   const leg=(k,x,a)=>{if(b[k])draw(g,im[k],x,by+B.h*.15,a,b[k].cx,top(b[k]));};
   g.save();g.translate(0,by);g.rotate(r.body);
   leg('bFar',-B.w*.3,r.bFar-sw*.5);leg('fFar',B.w*.28,r.fFar+sw*.5);
   if(b.tail)draw(g,im.tail,-B.w*.45,-B.h*.2,r.tail+Math.sin(G.t*4)*.15,b.tail.x1-2,b.tail.cy);
   g.drawImage(im.body,-B.cx,-B.cy);
   leg('bNear',-B.w*.26,r.bNear+sw*.5);leg('fNear',B.w*.32,r.fNear-sw*.5);
   draw(g,im.head,B.w*.42,-B.h*.25,r.head,b.head.x0+b.head.w*.2,b.head.cy+b.head.h*.2);
   g.restore();}},
 // 龙：四足 + 两扇翅膀扇动 + 长颈
 dragon:{need:['head','body','fNear','bNear'],
  height:b=>b.body.h*.8+Math.max(b.fNear.h,b.bNear.h)*.85+b.head.h*.5,
  pose:{idle:{body:0,head:0,tail:0,wing:0,fFar:0,fNear:0,bFar:0,bNear:0,dy:0},walk:{body:0,head:.05,tail:.1,wing:.2,fFar:0,fNear:0,bFar:0,bNear:0,dy:0},
   wind:{body:-.2,head:-.5,tail:.3,wing:-.6,fFar:-.3,fNear:-.4,bFar:.2,bNear:.3,dy:1},atk:{body:.12,head:.4,tail:-.2,wing:.4,fFar:.4,fNear:.5,bFar:-.3,bNear:-.4,dy:0},
   rec:{body:.05,head:.1,tail:0,wing:.1,fFar:.1,fNear:.1,bFar:0,bNear:0,dy:0},cast:{body:-.25,head:-.6,tail:.4,wing:-.9,fFar:-.5,fNear:-.6,bFar:.1,bNear:.1,dy:-3},
   hurt:{body:-.15,head:-.35,tail:.3,wing:.5,fFar:-.2,fNear:-.2,bFar:.2,bNear:.2,dy:0}},
  draw(g,L,r,sw,bob){const{im,b}=L,B=b.body,legH=Math.max(b.fNear.h,b.bNear.h),by=-legH*.8+r.dy+bob,flap=Math.sin(G.t*5)*.25;
   const leg=(k,x,a)=>{if(b[k])draw(g,im[k],x,by+B.h*.15,a,b[k].cx,top(b[k]));};
   g.save();g.translate(0,by);g.rotate(r.body);
   if(b.wFar)draw(g,im.wFar,-B.w*.05,-B.h*.35,r.wing+flap-.15,b.wFar.cx,b.wFar.y1-4);
   leg('bFar',-B.w*.3,r.bFar-sw*.5);leg('fFar',B.w*.28,r.fFar+sw*.5);
   if(b.tail)draw(g,im.tail,-B.w*.45,-B.h*.1,r.tail+Math.sin(G.t*3)*.12,b.tail.x1-2,b.tail.cy);
   g.drawImage(im.body,-B.cx,-B.cy);
   leg('bNear',-B.w*.26,r.bNear+sw*.5);leg('fNear',B.w*.32,r.fNear-sw*.5);
   draw(g,im.head,B.w*.4,-B.h*.3,r.head,b.head.x0+b.head.w*.18,b.head.y1-b.head.h*.25);
   if(b.wNear)draw(g,im.wNear,B.w*.05,-B.h*.35,r.wing-flap,b.wNear.cx,b.wNear.y1-4);
   g.restore();}},
 // 漂浮：无腿，下半身（火焰/烟雾/长袍/蛇尾）摆动，整体上下浮动
 floater:{need:['head','torso','lower','nearUp','nearLow'],
  height:b=>b.lower.h*.8+b.torso.h*.85+b.head.h*.85,
  pose:{idle:{torso:0,head:0,lower:0,farUp:.15,farLow:.2,nearUp:-.1,nearLow:-.5,wpn:-1.2,dy:0},walk:{torso:.1,head:0,lower:-.15,farUp:.1,farLow:.2,nearUp:-.1,nearLow:-.5,wpn:-1.2,dy:0},
   wind:{torso:-.2,head:-.1,lower:.1,farUp:.5,farLow:.4,nearUp:-2.3,nearLow:-.8,wpn:.5,dy:-2},atk:{torso:.2,head:.1,lower:-.2,farUp:-.2,farLow:.1,nearUp:-1.2,nearLow:-.1,wpn:1.4,dy:1},
   rec:{torso:.05,head:0,lower:-.05,farUp:.1,farLow:.2,nearUp:-.8,nearLow:-.3,wpn:1.2,dy:0},cast:{torso:-.1,head:-.2,lower:.05,farUp:-2.6,farLow:-.3,nearUp:-2.5,nearLow:-.3,wpn:1.2,dy:-3},
   hurt:{torso:-.25,head:-.3,lower:.2,farUp:.4,farLow:.5,nearUp:.3,nearLow:-.2,wpn:-1.4,dy:0}},
  draw(g,L,r,sw,bob){const{im,b}=L,tb=b.torso,lb=b.lower,fl=Math.sin(G.t*2.4)*2.5,wy=-lb.h*.75+r.dy+fl;
   const arm=(up,low,aUp,aLow,wpn)=>{if(!b[up]||!b[low])return;const ub=b[up],l2=b[low];g.save();g.translate(up==='nearUp'?tb.w*.18:-tb.w*.15,-tb.h*.78+sh(ub));g.rotate(aUp);g.drawImage(im[up],-ub.cx,-top(ub)-sh(ub));
     g.translate(0,ub.h-6-sh(ub));g.rotate(aLow);g.drawImage(im[low],-l2.cx,-top(l2));if(wpn&&b.item){const wb=b.item;g.translate(0,l2.h-8);g.rotate(r.wpn);g.drawImage(im.item,-(wb.x0+wb.w*.3),-wb.cy);}g.restore();};
   draw(g,im.lower,0,wy+lb.h*.1,r.lower+Math.sin(G.t*3)*.08,lb.cx,top(lb));
   g.save();g.translate(0,wy+lb.h*.1);g.rotate(r.torso);arm('farUp','farLow',r.farUp+Math.sin(G.t*2)*.1,r.farLow,false);
   g.drawImage(im.torso,-tb.cx,-bot(tb));g.save();g.translate(0,-tb.h*.8);g.rotate(r.head);g.drawImage(im.head,-b.head.cx,-(b.head.y1-b.head.h*.14));g.restore();
   arm('nearUp','nearLow',r.nearUp-Math.sin(G.t*2)*.1,r.nearLow,true);g.restore();}},
 // 多足虫：躯干 + 头 + 腹部，六条腿成三对交替划动
 insect:{need:['body','head','legN1'],
  height:b=>b.body.h*.9+b.legN1.h*.8,
  pose:{idle:{body:0,head:0,abd:0,dy:0},walk:{body:0,head:.05,abd:.05,dy:0},wind:{body:-.25,head:-.4,abd:.3,dy:1},atk:{body:.2,head:.4,abd:-.2,dy:-1},
   rec:{body:.05,head:.1,abd:0,dy:0},cast:{body:-.35,head:-.5,abd:.4,dy:-2},hurt:{body:-.2,head:-.35,abd:.3,dy:0}},
  draw(g,L,r,sw,bob){const{im,b}=L,B=b.body,by=-b.legN1.h*.7+r.dy+bob,ph=G.t*9;
   const leg=(k,x,i,near)=>{if(!b[k])return;const a=(near?1:-1)*.25+Math.sin(ph+i*2.1+(near?0:Math.PI))*(sw?.35:.08);draw(g,im[k],x,by+B.h*.1,a,b[k].cx,top(b[k]));};
   g.save();g.translate(0,by);g.rotate(r.body);
   ['legF1','legF2','legF3'].forEach((k,i)=>leg(k,(i-1)*B.w*.28,i,false));
   if(b.abd)draw(g,im.abd,-B.w*.4,0,r.abd+Math.sin(G.t*2)*.05,b.abd.x1-4,b.abd.cy);
   g.drawImage(im.body,-B.cx,-B.cy);
   ['legN1','legN2','legN3'].forEach((k,i)=>leg(k,(i-1)*B.w*.3,i,true));
   draw(g,im.head,B.w*.42,-B.h*.05,r.head,b.head.x0+4,b.head.cy);
   g.restore();}},
 // 蛇与虫：头 + 若干节身体，按正弦波摆动成一条链
 serpent:{need:['head','seg1'],
  height:b=>b.head.h*1.6+b.seg1.h*1.2,
  pose:{idle:{amp:.15,lift:0,dy:0},walk:{amp:.3,lift:0,dy:0},wind:{amp:.1,lift:-.6,dy:-2},atk:{amp:.05,lift:.5,dy:1},rec:{amp:.15,lift:.1,dy:0},cast:{amp:.2,lift:-.8,dy:-3},hurt:{amp:.25,lift:-.4,dy:0}},
  draw(g,L,r,sw,bob){const{im,b}=L,segs=['tail','seg2','seg1','neck'].filter(k=>b[k]);let x=-b.seg1.w*1.2,y=-b.seg1.h*.5+r.dy;
   segs.forEach((k,i)=>{const s=b[k],a=Math.sin(G.t*3+i*1.1)*r.amp;draw(g,im[k],x,y+Math.sin(G.t*3+i)*2,a,s.cx,s.cy);x+=s.w*.55;});
   draw(g,im.head,x,y-b.head.h*.3,r.lift+Math.sin(G.t*3+4)*r.amp*.5,b.head.x0+6,b.head.cy+b.head.h*.2);}},
};

// update 阶段推进：选目标姿势，当前角度平滑逼近（切姿势不跳帧）
window.rigTick=(e,dt)=>{const L=e.rig&&build(e.rig);if(!L)return;const P=(PLAN[e.rig.plan]||PLAN.humanoid).pose;
  const sp=G.t-(e.castAt||-9),sk=sp<(e.castDur||.6)?sp/(e.castDur||.6):-1,cast=e.boss&&e.mode&&e.mode!=='walk';
  let k='idle';
  if(G.t-(e.hurtAt||-9)<.25)k='hurt';
  else if(sk>=0)k=e.castK==='melee'?(sk<.45?'wind':sk<.75?'atk':'rec'):'cast';
  else if(cast)k='cast';else if(e.wind>0)k='wind';else if(e.dash>0||e.atkPose>0)k='atk';else if(e._wk)k='walk';
  const T=P[k],r=e.rp||(e.rp=Object.assign({},P.idle)),a=Math.min(1,dt*(k==='atk'?22:12));
  for(const q in T)r[q]=(r[q]??0)+(T[q]-(r[q]??0))*a;
  if(e.rig.front||e.rig.back){const F=FP[k],f=e.rpf||(e.rpf=Object.assign({},FP.idle));for(const q in F)f[q]+=(F[q]-f[q])*a;}
  e.rk=k;e.rw=(e.rw||0)+(k==='walk'?dt*7.5:0);};
// 绘制：(x,y) 脚底中心，h 目标身高，fl 朝左翻转；返回 false 时调用方用旧逐帧图
window.drawRig=(g,e,x,y,h,fl)=>{let L=e.rig&&build(e.rig);if(!L)return false;let pl=PLAN[e.rig.plan]||PLAN.humanoid,r=e.rp||pl.pose.idle,fr=0;
  // 侧面按正面躯干宽度的 0.75 倍补宽（同身高下比），转身时不会一下变瘦
  if(L.wideF===undefined&&e.rig.front){const F0=build({plan:e.rig.plan==='floater'?'ffront':'front',sheet:e.rig.front,grip:e.rig.grip});
    if(F0){const sw0=(L.b.torso||{}).w,fw0=(F0.b.torso||{}).w;L.wideF=sw0&&fw0?Math.max(L.wide,Math.min(1.5,(fw0/F0.H)*.75/(sw0/L.H))):L.wide;}}
  const vs=e.rf?e.rig.front:e.rb?e.rig.back:null;   // 正面 / 背面共用一套对称姿势
  if(vs){const fp=e.rig.plan==='floater'?'ffront':'front',F=build({plan:fp,sheet:vs,grip:e.rig.grip});if(F){L=F;pl=PLAN[fp];r=e.rpf||FP.idle;fr=1;}}
  const s=h/L.H,w=e.rw||0,walk=e.rk==='walk';
  const sw=walk?Math.sin(w):0,bob=(walk?-Math.abs(Math.cos(w))*1.4:Math.sin(G.t*2.2)*.5)/s;
  g.save();g.translate(x,y);g.scale((fl?-s:s)*(fr?L.wide:(L.wideF||L.wide)),s);pl.draw(g,L,r,sw,bob);g.restore();
  const fxk=L.im.fx||L.im.slash,fb=L.b.fx||L.b.slash;   // 出手瞬间的攻击特效（挥砍弧 / 吐息 / 爪击）
  if(e.rk==='atk'&&fxk&&fb){g.save();g.translate(x+(fr?0:(fl?-1:1)*h*.4),y-h*(fr?.35:.5));g.scale(fl?-s*1.1:s*1.1,s*1.1);g.globalCompositeOperation='lighter';g.globalAlpha=.85;g.drawImage(fxk,-fb.cx,-fb.cy);g.restore();}
  return true;};
})();
