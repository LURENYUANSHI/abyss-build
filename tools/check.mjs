// 提交前检查：node tools/check.mjs
// 1) game.html 内联脚本语法；2) 行尾注释里出现代码（“注释吞代码”事故已发生两次）；3) content/*.js 语法
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';import {join} from 'node:path';
let bad=0;const fail=m=>{console.error('✗ '+m);bad++;};
const html=readFileSync('game.html','utf8'),a=html.lastIndexOf('<script>'),b=html.indexOf('</script>',a);
const js=html.slice(a+8,b),tmp=join(tmpdir(),'abyss_check.js');writeFileSync(tmp,js);
try{execFileSync(process.execPath,['--check',tmp],{stdio:'pipe'});}catch(e){fail('game.html 脚本语法错误：\n'+e.stderr);}
js.split('\n').forEach((l,i)=>{const k=l.indexOf('   // ');if(k<0)return;const tail=l.slice(k+6);
  if(/[;{}]\s*$|\w\(|=>|\+=|\bconst\b|\blet\b/.test(tail))fail(`行尾注释疑似吞掉代码（脚本第 ${i+1} 行）：${tail.slice(0,80)}`);});
for(const dir of ['content','src'])if(existsSync(dir))for(const f of readdirSync(dir).filter(f=>f.endsWith('.js'))){
  try{execFileSync(process.execPath,['--check',join(dir,f)],{stdio:'pipe'});}catch(e){fail(`${dir}/${f} 语法错误：\n`+e.stderr);}}
console.log(bad?`检查失败：${bad} 处`:'检查通过');process.exit(bad?1:0);
