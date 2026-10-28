// 逐首领自动校准：每轮跑一遍模拟，首领用时超过目标就降血量，胜率偏离本章目标就调伤害，写回 content/boss_tune.js
// 用法：node tools/boss_tune.mjs [轮数=5] [每关每职业局数=2]
import {execSync} from 'child_process';import fs from 'fs';
const rounds=+(process.argv[2]||5),runs=+(process.argv[3]||2);
const WIN=[90,80,72,66,60],TIME=50;
global.window={};eval(fs.readFileSync('content/raids_data.js','utf8'));
const raids=window.RAID_DATA.raids.slice(0,5),byL=[];raids.forEach((r,ri)=>r.bosses.forEach(b=>byL.push({n:b.n,ri})));
let T={};try{global.window={};eval(fs.readFileSync('content/boss_tune.js','utf8'));T=window.BOSS_TUNE||{};}catch(e){}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
for(let k=0;k<rounds;k++){
  fs.writeFileSync('content/boss_tune.js','// 自动生成（tools/boss_tune.mjs）：每个首领的 [血量倍率, 伤害倍率]\nwindow.BOSS_TUNE='+JSON.stringify(T)+';\n');
  const out=execSync(`node tools/sim.mjs all ${runs} all 600 --levels`,{maxBuffer:1<<26}).toString();
  let off=0,n=0;
  for(const m of out.matchAll(/^L(\d+) (.+?): (\d+)%\s+首领用时 (\S+)/gm)){const L=+m[1],w=+m[3],t=m[4]==='-'?null:parseInt(m[4]),e=byL[L-1];if(!e)continue;
    const cur=T[e.n]||[1,1],tw=WIN[e.ri];
    // 用时：按比例压到目标附近；没人打赢时先降血
    const hp=t?clamp(cur[0]*Math.pow(TIME/t,.7),.35,1.6):cur[0]*.85;
    const dm=clamp(cur[1]*(w<tw-8?(w<tw-30?.8:.9):w>tw+8?1.08:1),.3,1.8);
    T[e.n]=[+hp.toFixed(3),+dm.toFixed(3)];off+=Math.abs(w-tw);n++;}
  const sum=out.split('\n').filter(l=>/^职业胜率/.test(l)).join('');
  console.log(`第 ${k+1} 轮 平均胜率偏差 ${(off/Math.max(1,n)).toFixed(1)} · ${sum}`);
}
fs.writeFileSync('content/boss_tune.js','// 自动生成（tools/boss_tune.mjs）：每个首领的 [血量倍率, 伤害倍率]\nwindow.BOSS_TUNE='+JSON.stringify(T)+';\n');
console.log(execSync(`node tools/sim.mjs all ${runs} all 600 --levels | python3 tools/raidsum.py`).toString());
