# 团本内容 DSL（content/raids_data.js 的格式）

游戏通过 `<script src="content/raids_data.js">` 加载 `window.RAID_DATA = {raids:[...]}`。所有数值都是相对量：
伤害 = 首领 `b.skd` 的倍数；时间单位秒（预警时间会乘节奏系数 f，P2/狂乱 f=.75）；距离单位世界像素（普通房 160×192，首领房 192×256，玩家半径≈5）。

## 副本
```js
{id:'mc', name:'熔火之心', exp:'classic'|'tbc'|'wotlk', bio:1..4,   // bio=沿用的地貌（1 火山 2 龙巢 3 亡灵 4 虚空），新瓦片到位前用它回退
 desc:'一句话环境', tiles:'tiles_mc', props:[{n:'熔岩喷口', k:'vent'|'egg'|'grave'|'rift'|自定义}],
 trash:{ /* 名字 → 小怪 */ '熔火恶犬':{base:'BT', hp:1, dmg:1, art:['mobs_mc_1',0], ab:[/* 小怪技能，见下 */]} },
 bosses:[ /* 见下，按顺序，一个首领一关 */ ]}
```

## 首领（一关）
```js
{n:'鲁西弗隆', lv:'关卡名(可选)', rooms:3 /*首领前的小怪房数*/, hp:0.9, enrage:60, elite:'熔火恶犬'|null, trash:['熔火恶犬',...],
 art:['bosses_mc_1',0] /* 精灵表名 + 主体序号（每主体 4 帧：待机/移动/攻击/施法） */, size:54, spd:13, fixed:false /*不移动*/,
 tip:'一句提示',
 sk:['impendingDoom','lucifronCurse','shadowShock'],      // 轮换技能（下面 skills 里的键，或现有 SK 键）
 auto:[{k:'arcaneExplosion',every:4}],                     // 不占轮换、定时穿插的技能
 skills:{ impendingDoom:{e:'curse',kind:'delayed',t:6,dmg:1.2,say:'末日降临'}, ... },
 open:{...阶段对象...},                                     // 开场阶段（可选）
 ph:[{at:.5, msg:'…', sk:[...], go:'skillKey', form:['adds_mc_1',2], frenzy:true, adds:{...}, inv:false, auto:[...]}],
 adds:[{n:'烈焰行者护卫', base:'SK', count:2, hp:2.5, art:['adds_mc_1',0], at:'start'|'phase', ab:[...], link:{bossDmgTaken:.8}}],
 multi:[{n:'维克洛尔大帝', art:[...], hp:1, sk:[...], skills:{...}}], shared:{hp:true, reviveWindow:10},   // 多首领
 passive:{touchDot:{t:4,dmg:.2}, rangedPunish:{d:70,dmg:1.6}, facing:'fixed'}}
```

## 技能（skills 里的值）—— e = 引擎
| e | 参数 | 说明 |
|---|---|---|
| `tel` | `t:'circle'|'cone'|'beam'|'rect'`, `at:'player'|'boss'|'random'|'ahead'|'fixed'|'corner'`, `r`, `len`, `ang`, `w`, `h`, `a`(fixed 角度，弧度，0=右，π/2=下), `T`(预警秒), `dmg`, `eff:'stun'|'slow'|'freeze'|'dot'|'fear'|'knock'|'silence'|'vuln'|'pull'`, `n`(个数), `gap`(间隔秒), `spread`(随机偏移 px), `safe:'behindProps'|...`, `after:{pool:{t,dmg,r}, adds:{k,n,art,hp}, knock:px}` | 数据驱动地面预警，覆盖大多数伤害技能 |
| `curse` | `kind:'delayed'|'cd'|'heal'|'dmg'|'vuln'|'silence'`, `t`, `dmg`(delayed 结束伤害) | 玩家减益，buff 栏显示倒计时 |
| `stacks` | `kind:'vuln'|'heal'|'dmg'|'slow'`, `on:'hit'|'aura'`, `r`(aura 半径), `max`, `decay`(秒) | 叠层减益 |
| `playerBomb` | `t`, `r`, `dmg`, `perEnemy:.5`, `after:{pool|adds}` | 玩家变炸弹：远离小怪 |
| `castBar` | `T`, `need`(命中几次打断), `then:{技能对象}` | 读条，可被普攻打断 |
| `frenzy` | `t`, `perm`, `spd:1.5`, `rate:.5` | 狂乱，大招命中可安抚（perm 除外） |
| `followAura` | `r`, `t`, `dmg`, `tick:.5`, `spd`, `ramp` | 跟随首领的持续伤害圈（旋风斩/地狱火） |
| `teleportPlayer` | `to:'corner'|'boss'|'random'|'pit'`, `root`, `pool:{t,dmg}` | 传送玩家 |
| `bossShield` | `kind:'reflect'|'reduce'|'immune'`, `t`, `pct` | 首领护盾，大招命中驱散 |
| `mindControl` | `t` | 控制：输入反转 + 被拉向首领 + 停止普攻 |
| `summon` | `k:'SK'|'BT'|'SL'|'SA'|trash 名`, `n`, `hp`, `art`, `ring:r`, `at:'boss'|'edges'|'corners'` | 召唤 |
| `shots` | `p:'ring'|'spiral'|'volley'|'aimed'`, `n`, `spd`, `dmg`, `dur` | 弹幕（只在原作确有的技能里用） |
| `charge` | `T`, `dmg`, `spd` | 预警冲锋（复用现有） |
| `addPhase` | `t`, `adds:{k,n,every,art,hp}`, `until:'adds'|'time'`, `pos:'top'` | 首领无敌 + 刷波 |
| `gaze` | `t`, `dmg` | “别动”凝视 |
| `decimate` | `p`, `adds` | 生命降到比例 |
| `pull` / `grab` | `T`, `to:'boss'`, `dmg` | 拉到首领身边 / 抓起（同 webWrap 简化） |
| `trail` | `t`, `dmg`, `r` | 首领经过留下伤害地面 |
| `totem` | `n`, `hp`, `effect:'healBoss'|'pulse'|'mc'`, `every`, `art` | 可击毁的图腾 |
| `energyBar` | `rate`, `then:{技能对象}` | 能量满释放 |
| `mirrorImages` | `n`, `hp` | 分身 |
| `burrow` | `t`, `dmg`, `r` | 钻地追踪 |
| `healTarget` | `pct`, `T`, `need` | 读条治疗友军 |
| `special` | `name:'polarityShift'|'marks'|'losBreath'|'webWrap'|'stomach'|'siphon'|'shatter'|'realm'|'beamBlock'|…`, 其余参数自定 | 专用脚本（游戏里逐个实现） |

技能对象通用字段：`say`（头顶技能名，默认用键名对应中文）、`cd`（仅 auto 用）、`f`（是否乘节奏系数，默认是）。

## 小怪技能（trash.ab）
`{k:'pounce'|'chargeLine'|'nova'|'aoeAtPlayer'|'volley'|'beam'|'blink'|'deathExplode'|'deathSplit'|'deathPool'|'packRevive'|'summon'|'buffAllies'|'heal'|'fear'|'mc'|'stacks', cd, range, r, T, dmg, n, eff, ...}`

## 阶段对象（open / ph[i]）
`{at:HP比例, msg, sk:[新轮换], auto:[...], go:'立即施放的技能键', form:[表名,序号], frenzy:true, inv:true/false, adds:{...}, move:'top'|'center', end:{after:秒}|{adds:true}}`
