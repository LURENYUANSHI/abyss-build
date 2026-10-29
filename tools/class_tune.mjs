// 按职业校准 TUNE=[血量倍率, 伤害倍率, 受到伤害倍率]：首领用时中位压到 ~35 秒（调伤害），整章通关率拉向各职业平均（调受到伤害，血量各职业统一）
// 用法：node tools/class_tune.mjs [轮数=4] [每章每职业局数=4] [章节=0,2,4]
import {execSync} from 'child_process';import fs from 'fs';
const rounds=+(process.argv[2]||4),runs=+(process.argv[3]||4),CH=process.argv[4]||'0,2,4',TIME=35;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
for(let k=0;k<=rounds;k++){
  const out=execSync(`node tools/sim.mjs --run ${runs} --ch ${CH}`,{maxBuffer:1<<26}).toString();
  const tm=Object.fromEntries([...out.match(/职业首领用时中位：(.*)/)[1].matchAll(/(\w+) (\d+)s/g)].map(m=>[m[1],+m[2]]));
  const cl=Object.fromEntries([...out.match(/职业整章通关：(.*)/)[1].matchAll(/(\w+) (\d+)%/g)].map(m=>[m[1],+m[2]/100]));
  console.log(`--- 第 ${k} 轮\n`+out.split('\n').filter(l=>/整章通关|首领用时中位/.test(l)).join('\n'));if(k===rounds)break;
  const avg=Object.values(cl).reduce((a,b)=>a+b,0)/Object.keys(cl).length;
  let s=fs.readFileSync('game.html','utf8');const m=s.match(/const TUNE=\{([^}]*)\};/);
  const T=Object.fromEntries([...m[1].matchAll(/(\w+):\[([\d.]+),([\d.]+),([\d.]+)\]/g)].map(x=>[x[1],[+x[2],+x[3],+x[4]]]));
  for(const c in T){if(!(c in tm))continue;const dm=clamp(T[c][1]*Math.pow((tm[c]||TIME)/TIME,.6)*(['paladin','brawler'].includes(c)&&cl[c]>avg+.1?.9:1),.5,6),tk=clamp(T[c][2]*Math.exp(-1.2*(avg-cl[c])),.4,['paladin','brawler'].includes(c)?1:2);T[c]=[T[c][0],+dm.toFixed(3),+tk.toFixed(3)];}
  s=s.replace(m[0],'const TUNE={'+Object.entries(T).map(([c,v])=>`${c}:[${v[0]},${v[1]},${v[2]}]`).join(',')+'};');fs.writeFileSync('game.html',s);console.log('TUNE',JSON.stringify(T));}
