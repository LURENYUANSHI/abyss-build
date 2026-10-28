# 把 sim.mjs --levels 的逐关输出按章节汇总：胜率、首领平均用时、最慢的首领
# 用法：node tools/sim.mjs all 2 all 600 --levels | python3 tools/raidsum.py
import sys,re,json,subprocess
data=json.loads(subprocess.check_output(['node','-e',"global.window={};eval(require('fs').readFileSync('content/raids_data.js','utf8'));console.log(JSON.stringify(window.RAID_DATA.raids.slice(0,5).map(r=>[r.name,r.bosses.length])))"]))
rows=[]
for line in sys.stdin:
    sys.stdout.write(line) if line.startswith(('职业','首领房','levels')) else None
    m=re.match(r'L(\d+) (.+?): (\d+)%\s+首领用时 (\S+)',line)
    if m:rows.append((int(m.group(1)),m.group(2),int(m.group(3)),None if m.group(4)=='-' else int(m.group(4).rstrip('s'))))
L=1
for name,n in data:
    rs=[r for r in rows if L<=r[0]<L+n];L+=n
    if not rs:continue
    ts=[r[3] for r in rs if r[3]]
    print(f"{name}: 胜率 {sum(r[2] for r in rs)/len(rs):.0f}%  首领平均 {sum(ts)/max(1,len(ts)):.0f}s  最慢 {max(rs,key=lambda r:r[3] or 0)[1]} {max(ts) if ts else '-'}s  最难 {min(rs,key=lambda r:r[2])[1]} {min(r[2] for r in rs)}%")
