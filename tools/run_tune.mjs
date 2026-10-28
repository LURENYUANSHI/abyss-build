// 按“整章连打”校准每个首领：首领用时压到目标附近（调血量），死人多的首领降伤害，整章通关率对准章节目标（整章伤害倍率）
// 用法：node tools/run_tune.mjs [轮数=4] [每章每职业局数=2]
import {execSync} from 'child_process';import fs from 'fs';
const rounds=+(process.argv[2]||4),runs=+(process.argv[3]||2),CLEAR=[.9,.8,.72,.66,.6],TIME=45,J='/private/tmp/claude-501/run_stats.json';
let T={};try{global.window={};eval(fs.readFileSync('content/boss_tune.js','utf8'));T=window.BOSS_TUNE||{};}catch(e){}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),save=()=>fs.writeFileSync('content/boss_tune.js','// 自动生成（tools/run_tune.mjs，整章连打校准）：每个首领的 [血量倍率, 伤害倍率]\nwindow.BOSS_TUNE='+JSON.stringify(T)+';\n');
for(let k=0;k<=rounds;k++){save();
  const out=execSync(`node tools/sim.mjs --run ${runs} --json`,{env:{...process.env,RUN_JSON:J},maxBuffer:1<<26}).toString();console.log(`--- 第 ${k} 轮\n`+out.trim());if(k===rounds)break;
  for(const R of JSON.parse(fs.readFileSync(J,'utf8'))){const gap=R.clear-CLEAR[R.ri],chap=gap>.08?1.05:gap<-.08?.94:1;
    for(const b of R.per){const cur=T[b.n]||[1,1],t=b.t.sort((a,c)=>a-c)[b.t.length>>1],dieRate=b.reach?b.die/b.reach:0;
      const hp=t?clamp(cur[0]*Math.pow(TIME/t,+(process.env.HPEXP||.5)),.3,8):cur[0];
      const dm=clamp(cur[1]*chap*(dieRate>.25?.8:dieRate>.12?.9:1),.25,2);
      T[b.n]=[+hp.toFixed(3),+dm.toFixed(3)];}}}
