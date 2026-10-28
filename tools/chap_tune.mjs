// 按章节校准：每轮跑整章连打（每局独立存档），按通关率与目标的差距调该章敌人伤害系数（game.html 的 RC），写回游戏
// 用法：node tools/chap_tune.mjs [轮数=4] [每章每职业局数=6]
import {execSync} from 'child_process';import fs from 'fs';
const rounds=+(process.argv[2]||4),runs=+(process.argv[3]||6),CLEAR=[.9,.8,.72,.66,.6],J='/private/tmp/claude-501/chap_stats.json';
for(let k=0;k<=rounds;k++){
  const out=execSync(`node tools/sim.mjs --run ${runs} --json`,{env:{...process.env,RUN_JSON:J},maxBuffer:1<<26}).toString();
  console.log(`--- 第 ${k} 轮\n`+out.split('\n').filter(l=>/整章通关|首领用时中位/.test(l)).join('\n'));if(k===rounds)break;
  let s=fs.readFileSync('game.html','utf8');const m=s.match(/const RC=(\[\[.*?\]\]);/);const RC=JSON.parse(m[1]);
  for(const R of JSON.parse(fs.readFileSync(J,'utf8'))){const gap=R.clear-CLEAR[R.ri];RC[R.ri][1]=+Math.max(.2,RC[R.ri][1]*Math.exp(Math.max(-.5,Math.min(.4,gap*1.6)))).toFixed(3);}
  s=s.replace(m[0],'const RC='+JSON.stringify(RC)+';');fs.writeFileSync('game.html',s);console.log('RC',JSON.stringify(RC));}
