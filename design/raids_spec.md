# 团本移植设计规格（spec-1 · 2026-10-27）

> 机器可读版本：`design/raids.json`（本文由同一份数据生成，两者一致）。

**范围：** 经典旧世 60 级团本：熔火之心 → 奥妮克希亚的巢穴 → 黑翼之巢 → 祖尔格拉布 → 安其拉废墟 → 安其拉神殿 → 纳克萨玛斯（60 级版）。一个团本 = 一章，一个首领 = 一关。燃烧的远征 / 巫妖王之怒（含冰封王座、80 级纳克萨玛斯）不在本期范围，列为后续资料片。

**规模：** 7 个团本（章） · 59 个首领（= 59 关） · 40 种小怪 · 30 个新引擎 · 165 个 NEW 技能键

## 通用约定

- **units**：伤害一律写成首领 b.skd 的倍数（skd×1.2）；预警时长写成 T 秒并乘以现有节奏系数 f（P2/狂乱时 f=.75）；半径/长度单位为世界像素（普通房间 160×192，首领房 192×256，玩家半径约 5）。
- **hpMult**：首领血量 = BIG_HP × hpCurve × 本表 hpMult。多首领（multiBoss）每个单位单独写 hpMult。
- **enrageSec**：游戏内秒数，直接写入 b.fury（现有“狂怒”软狂暴：之后每 2 秒全屏 skd×.8）。原作没有硬狂暴的首领也给一个值，保证节奏。
- **rooms**：首领房之前的小怪房数量（2~6）。rooms≥3 时倒数第二间小怪房改为精英房，精英取 boss.elite（trash 里的名字，血量 ×4、技能冷却 ×.7）。
- **trash**：boss.trash 指定本关小怪房刷哪些小怪（按名字引用 raid.trash）；不写则用全部。每间房至少 30% 远程（SA）。
- **skills**：首领常规技能轮换（现有 SK 键名，或 NEW:xxx 新键名）。NEW:xxx 的具体做法见同一首领 mechanics 里 key 相同的条目；[引擎名] 指向顶层 newPrimitives。
- **telegraph**：所有会造成伤害的首领/小怪技能都必须有地面预警（tel 或 G.etels），预警出现 ≥ .6 秒；头顶显示技能中文名（b.say）。
- **mobAbility**：小怪技能统一由 [mobAbility] 数据驱动：pounce 扑击、chargeLine 预警直线冲锋、nova 自身圆形、aoeAtPlayer 玩家脚下圆、volley n 连发、beam 直线光束、blink 瞬移、deathExplode 死亡自爆、deathSplit 死亡分裂、deathPool 死亡留池、packRevive 群体复活、summon 召唤、buffAllies 鼓舞、heal 读条治疗、fear 恐惧、mc 控制、stacks 叠层减益。

## 需要新增的引擎（NEW 原语）

| 引擎 | 做法 | 用到它的首领/小怪 |
|---|---|---|
| `tel` | 数据驱动预警技能：SK.tel(b,{t:'circle'|'cone'|'beam'|'rect',at:'player'|'boss'|'random'|'fixed',r|len,ang|w,T,dmg,eff,n,spread,after})。n 个预警依次 +.1s；after 支持 'pool'(留火/毒池) 'adds:k,n' 'knock'。替代大部分写死的单一技能（slam/multi/hateful/wrath 都可以改成配置）。 | 其拉鞭笞者、加兹兰卡、加尔、勒什雷尔、古拉巴什狂暴者、哈卡、哈霍兰公主、基赫纳斯、堕落的瓦拉斯塔兹、奈法利安、奥妮克希亚、奥妮克希亚守卫、奥妮克希亚雏龙、奥罗、妖术师金度、库林纳克斯、拉贾克斯将军、教官拉苏维奥斯、无疤者奥斯里安、格罗布鲁斯、沙尔图拉、沙斯拉尔、狂野的拉佐格尔、玛格曼达、疯狂之缘、管理者埃克索图斯、维希度斯、缝合傀儡、肮脏的希尔盖、莫阿姆、萨弗隆先驱者、萨菲隆、血领主曼多基尔、费尔默、迈克斯纳、阿努布雷坎、顽强的范克瑞斯、高阶祭司塞卡尔、高阶祭司娅尔罗、高阶祭司温诺希斯、高阶祭司玛尔里、高阶祭司耶克里克、鲁西弗隆、黑女巫法琳娜、黑翼军团士兵 |
| `mobAbility` | 把 update 里的 e.k==='SK'&&ch===N 硬编码改成查表：G.roster[k].ab=[{kind,cd,range,...}]；每种 kind 3~5 行，复用 e.wind/e.dash/G.etels/shots/G.revives/G.pools。 | 其拉洗脑者、其拉角斗士、加尔、古拉巴什掷斧者、古拉巴什狂暴者、古拉巴什蝙蝠骑士、哈卡莱巫医、奥妮克希亚守卫、奥妮克希亚雏龙、感染食尸鬼、拉扎什寡妇蛛、札拉蜂巢毒刺者、死爪龙卫、火焰之王、烈焰行者、熔岩奔腾者、熔火巨人、熔火恶犬、祖利安猛虎、维克尼斯毒刺者、缝合傀儡、腐化的雏龙、腐肉织网者、高阶祭司娅尔罗、高阶祭司耶克里克、黑曜石抹除者、黑曜石毁灭者、黑翼军团士兵、黑翼技师、黑翼法师、黑翼缚法者、黑龙卫兵、黑龙法师 |
| `addPhase` | 首领 b.inv=true（可 b.hidden 或移到房间顶部/平台），按 adds 配置每 N 秒刷一波；结束条件：所有召唤物死亡 或 T 秒 或 击杀计数达标。复用 submerge/p1adds/drakes 的结构，参数化。 | 拉贾克斯将军、收割者戈提克 |
| `multiBoss` | spawnBoss 额外 push 若干 boss:true 单位（各自 sk/hp/画像），G.bosses 数组；全部死亡才算过关。选项：sharedHp（共用血量：每次伤害同步到兄弟）、reviveWindow 秒（一个死后计时，超时其余未死则复活死者满血）、onDeath（死亡时给存活者加狂乱/留毒云/召唤）。顶部血条显示多条。 | 双子皇帝、塔迪乌斯、天启四骑士、安其拉三宝、高阶祭司塞卡尔 |
| `frenzy` | b.frenzyT=8：移速 ×1.5、技能间隔 ×.5、身上红色光环；玩家释放大招命中首领 = 宁神射击，立即解除并显示“已安抚”。可配置 perm:true（阶段性永久狂乱，不可解）。 | 克洛玛古斯、哈霍兰公主、弗莱格尔、格拉斯、玛格曼达、萨弗隆先驱者、高阶祭司塞卡尔、黑女巫法琳娜 |
| `followAura` | 跟随首领的圆形持续伤害：开始前 .8s 红圈预警，之后 T 秒内每 .5s 对圈内玩家 skd×k；期间首领移速 ×m（旋风斩可设随机转向）。用于 地狱火/旋风斩/虫群风暴/奥术爆炸脉冲。复用 fxs('whirl')。 | 其拉鞭笞者、死亡骑士队长、沙尔图拉、血领主曼多基尔、迦顿男爵、阿努布雷坎、高阶祭司娅尔罗 |
| `playerBomb` | 玩家身上挂炸弹 G.bomb={t,r,dmg,after}：玩家脚下画跟随红圈 + 倒计时数字；到时以玩家为圆心 r 爆炸：玩家受 skd×dmg×(1+.5×圈内敌人数)，after 可留池/刷怪/清技能冷却。教学：带着炸弹远离小怪。 | 克尔苏加德、格罗布鲁斯、迦顿男爵 |
| `curse` | 玩家减益 G.curse={kind,t}：'cd' 技能冷却 ×2；'heal' 回复 ×.25；'dmg' 玩家伤害 ×.5；'delayed' 结束时受 skd×k；'vuln' 复用 G.vulnT。在 buff 栏显示图标与倒计时。 | 勒什雷尔、哈卡莱巫医、基赫纳斯、奈法利安、妖术师金度、无疤者奥斯里安、沙斯拉尔、瘟疫使者诺斯、肮脏的希尔盖、萨弗隆先驱者、萨菲隆、血领主曼多基尔、迈克斯纳、鲁西弗隆 |
| `mindControl` | G.mcT=T：输入方向反转、自动普攻停止、玩家被拉向首领（每秒 20px）。头顶紫色眼睛特效。期间受到伤害不减时长。 | 克尔苏加德、其拉洗脑者、哈卡、预言者斯克拉姆、鲁西弗隆、黑翼缚法者 |
| `bossShield` | b.shield={kind,t}：'reflect' 玩家打出的伤害 15% 反弹给玩家（dmg() 里 hurt）；'reduce' 受伤 ×.3；'immune' 无敌。玩家大招命中 = 驱散。外观：气泡贴图。 | 无疤者奥斯里安、沙斯拉尔、管理者埃克索图斯 |
| `castBar` | 首领/小怪头顶读条 T 秒（b.cast={n,t,T,hits:0,need}）；读条期间被玩家命中 need 次即打断（显示“打断！”），否则结算 effect（治疗/大范围伤害/召唤）。 | 克尔苏加德、安其拉三宝、教官拉苏维奥斯、烈焰行者牧师、焚化者古雷曼格、石皮石像鬼、管理者埃克索图斯、萨弗隆先驱者、阿努比萨斯防御者、预言者斯克拉姆、高阶祭司塞卡尔、高阶祭司温诺希斯、高阶祭司耶克里克 |
| `totem` | 不动的召唤物（prop 型，spd 0，可被攻击）：每 p 秒执行 effect（给首领回血 X%/s、脉冲伤害、对范围内玩家 mindControl）。在小地图上标红。 | 妖术师金度 |
| `gaze` | G.gaze={t:2,x0,y0}：玩家头顶红眼 + 文本“别动！”；2 秒内移动超过 6px → 首领 charge 到玩家并 hurt(skd×3)，首领 +10% 伤害（升级）。自动走位在 gaze 期间暂停。 | 血领主曼多基尔 |
| `stacks` | 玩家叠层减益 G.stk[k]={n,t}：每次命中 +1 层，6 秒未命中清零；类型：'heal' 回复 −10%/层、'vuln' 受伤 +6%/层、'dmg' 伤害 −8%/层。buff 栏显示层数。 | 克尔苏加德、双子皇帝、哈霍兰公主、基赫纳斯、库林纳克斯、感染食尸鬼、收割者戈提克、教官拉苏维奥斯、格拉斯、烈焰行者、焚化者古雷曼格、维克尼斯毒刺者、血领主曼多基尔、费尔默、顽强的范克瑞斯 |
| `teleportPlayer` | 把玩家移到指定点（角落/坑/首领身边/随机），可选 root 秒数（pl.frozenT），落点放 portal 特效。 | 妖术师金度、狩猎者阿亚米斯、管理者埃克索图斯、顽强的范克瑞斯 |
| `safeSpots` | tel 扩展字段 safe:[{x,y,r}|unit]：玩家位于任一安全区内则不受该预警伤害（用于拉苏维奥斯学员、冰块后、毒血池）。 | 教官拉苏维奥斯 |
| `decimate` | 把玩家生命降为当前值 ×p（不低于 5% 上限，不致死）；同时把场上某类小怪降到 5%（格拉斯的僵尸）。 | 拉贾克斯将军、格拉斯 |
| `energyBar` | 首领能量 b.mp 0→100（每秒 +x；玩家施放技能 +5）；满能量释放 effect 并清零。血条下方画蓝条。 | 莫阿姆 |
| `mirrorImages` | 在血量阈值复制 n 个分身：同贴图、同技能，hp=本体 15%、伤害 ×.4；真身随机交换位置。分身死亡无奖励。 | 疯狂之缘、预言者斯克拉姆 |
| `burrow` | 首领 b.hidden+b.inv，地面土堆预警圈缓慢追踪玩家（速度 30）T 秒，结束时在当前位置钻出：circle r36 skd×1.6 + knock。 | 奥罗 |
| `shatter` | 维希度斯专用：计数玩家命中次数 → 10 次减速、20 次更慢、30 次冻结 12s；冻结期间再命中 15 次碎裂成 n 个粘液团（SL 小怪）向房间中心爬行，被杀死的粘液团才真正扣首领血（每个 = 首领最大血量 /(n×3)）；爬到中心的粘液团合体回血。 | 维希度斯 |
| `siphon` | 哈卡专用：读条 3s 血液虹吸；结算时若玩家身上有 G.poisonBloodT（站在哈卡之子死亡毒池里获得，持续 10s），首领受到 5% 最大生命伤害；否则玩家损失 25% 当前生命、首领回复 10%。 | 哈卡 |
| `stomach` | 克苏恩 P2：每 15s 吞下玩家 → teleportPlayer 到房间底部紫色“胃”区（rect 160×48），消化酸液每秒叠 1 层 vuln；胃内刷 2 只血肉触须（SL，不动）；两只都死 → 首领虚弱 15s（取消 inv、受伤 ×2），玩家被吐回中央。 | 克苏恩 |
| `polarityShift` | 塔迪乌斯专用：每 20s 读条 2s 后给玩家随机 +/−；房间左半区为 +、右半区为 −（地面蓝/红光）；站在与自身同号半区：伤害 +50%；站在异号半区：每秒 skd×.4。取代现有 polarity 的“轮流半场炸”。 | 塔迪乌斯 |
| `marks` | 四骑士专用：四个首领各占一角（不移动）；每 12s 对 70px 内的玩家施加该骑士印记 +1 层（各自独立），每层印记立即受 skd×.12×层数^1.5 伤害，层数 20s 无新增则清零。逼玩家按角落轮换。 | 天启四骑士 |
| `losBreath` | 萨菲隆专用：空中阶段 3 次寒冰箭在玩家位置生成冰块（加入 OBS，14×14，可挡视线），之后读条 3s 冰霜吐息：los(首领,玩家) 为真则 hurt(skd×4)，否则安全；吐息后冰块碎裂。 | 萨菲隆 |
| `webWrap` | 迈克斯纳专用：把玩家传送到随机一面墙边并包裹（pl.frozenT=3、茧贴图覆盖）；受到 3 次自己普攻（自动挣扎）或 3 秒后破茧。 | 迈克斯纳 |
| `objectiveProps` | 房间放置 n 个目标物件（prop，有血或可激活）：destroy 型全部击毁 → 触发 onDone（拉佐格尔龙蛋、布鲁之卵爆炸伤首领）；activate 型玩家站上 1s → 给首领挂减益（奥斯里安水晶），用后在别处刷新。复用 PROP_ART/propTick。 | 吞咽者布鲁、无疤者奥斯里安、狂野的拉佐格尔 |
| `rangedPunish` | 玩家与首领距离 > D 持续 2s → 首领向玩家发射强力弹 skd×k（拉格纳罗斯岩浆冲击、克苏恩/防御者暗影风暴、斯克拉姆地震术）。提示“回到近战范围”。 | 拉格纳罗斯、阿努比萨斯防御者、预言者斯克拉姆 |
| `bossFacing` | 首领可选 fixedFace（固定朝向，不转身），用来做前方吐息 + 后方尾扫、两侧安全的龙类首领（奥妮克希亚、瓦拉斯塔兹、克洛玛古斯、三小龙）。 | 堕落的瓦拉斯塔兹、奥妮克希亚、萨菲隆 |

## 章节总览

| 章 | 资料片 | 团本 | 等级 | 首领（关卡） |
|---|---|---|---|---|
| 1 | 经典旧世（60） | 熔火之心 | 60 | 鲁西弗隆 → 玛格曼达 → 基赫纳斯 → 加尔 → 迦顿男爵 → 沙斯拉尔 → 萨弗隆先驱者 → 焚化者古雷曼格 → 管理者埃克索图斯 → 拉格纳罗斯 |
| 2 | 经典旧世（60） | 奥妮克希亚的巢穴 | 60 | 奥妮克希亚 |
| 3 | 经典旧世（60） | 黑翼之巢 | 60 | 狂野的拉佐格尔 → 堕落的瓦拉斯塔兹 → 勒什雷尔 → 费尔默 → 埃博诺克 → 弗莱格尔 → 克洛玛古斯 → 奈法利安 |
| 4 | 经典旧世（60） | 祖尔格拉布 | 60 | 高阶祭司耶克里克 → 高阶祭司温诺希斯 → 高阶祭司玛尔里 → 血领主曼多基尔 → 疯狂之缘 → 高阶祭司塞卡尔 → 加兹兰卡 → 高阶祭司娅尔罗 → 妖术师金度 → 哈卡 |
| 5 | 经典旧世（60） | 安其拉废墟 | 60 | 库林纳克斯 → 拉贾克斯将军 → 莫阿姆 → 吞咽者布鲁 → 狩猎者阿亚米斯 → 无疤者奥斯里安 |
| 6 | 经典旧世（60） | 安其拉神殿 | 60 | 预言者斯克拉姆 → 安其拉三宝 → 沙尔图拉 → 顽强的范克瑞斯 → 维希度斯 → 哈霍兰公主 → 双子皇帝 → 奥罗 → 克苏恩 |
| 7 | 经典旧世（60） | 纳克萨玛斯 | 60 | 阿努布雷坎 → 黑女巫法琳娜 → 迈克斯纳 → 瘟疫使者诺斯 → 肮脏的希尔盖 → 洛欧塞布 → 教官拉苏维奥斯 → 收割者戈提克 → 天启四骑士 → 帕奇维克 → 格罗布鲁斯 → 格拉斯 → 塔迪乌斯 → 萨菲隆 → 克尔苏加德 |

## 第 1 章 · 熔火之心（Molten Core，60 级，经典旧世（60））

### 环境

黑石深渊之下的火山腹地：黑曜石地面被发光的熔岩河切开，岩浆瀑布与喷口不断喷发；入口有熔火之心水晶，走廊上散落烈焰行者的营火与火焰符文。终点是熔岩湖中央的岩石平台，拉格纳罗斯从岩浆中升起。

- 瓦片集：tiles_c1.png（熔岩洞，可直接复用，建议补一块“火焰符文”地砖）
- 音乐：低沉战鼓 + 管风琴式持续低音，节奏中速、压迫

**地图机关**

- **熔岩喷口**：现有 ventTick：每 6~9s 预警 .9s 后喷发 r22，敌我皆伤并留 2.5s 火池。每间小怪房 1~2 个。
- **熔岩河**：走廊横向 rect 岩浆带（宽 16）：站上去每秒 skd×.15 + 灼烧；首领房四周边缘也是熔岩（墙内 8px）。纯地形，用 pools 的 rect 版。
- **火焰符文**：7 个首领房（鲁西弗隆~焚化者）各有 1 个符文（可攻击 prop，hp 60）：击碎后本关剩余时间玩家伤害 +10%（致敬“用水之精华熄灭符文召唤管理者”）。
- **熔岩之池（拉格纳罗斯）**：拉格纳罗斯房上半部为熔岩湖（不可进入，挡路），首领固定在湖边平台。

### 小怪

| 名称 | 基础行为 | 技能 |
|---|---|---|
| 熔火恶犬 | BT | **锯齿撕咬**：[mobAbility pounce] 蓄力 .35s 闪白后扑击 150px/s、.28s；命中 dmg×1.2 + 2s 流血（G.dotT）。<br>**群体复活**：[mobAbility packRevive] 3 只一组（同 pack id）；组内第一只死后 10s 内未全灭，则死去的恶犬原地以 50% 血复活一次（复用 G.revives，地面画“灰烬”标记）。 |
| 熔岩奔腾者 | BT | **奔涌**：[mobAbility chargeLine] 距离<100 时画红色直线预警 len90 w6 .6s，然后 160px/s 冲撞，命中 dmg×1.5 + knock 25。冷却 5s。 |
| 烈焰行者 | SK | **破甲**：[stacks vuln] 每次近身命中 +1 层（受伤 +6%/层，最多 5 层）。<br>**拉格纳罗斯之拳**：[mobAbility nova] 每 7s：自身 r24 红圈 .7s，命中 dmg×1 + 眩晕 1s（stun）。 |
| 熔火巨人 | SL ×3血 | **践踏**：[mobAbility nova] 每 6s：自身 r30 .9s，dmg×1.2 + knock 30。死亡不分裂（覆盖 SL 默认分裂）。<br>**击退**：近身命中时 knock 20（打断玩家连击节奏）。 |
| 火焰之王 | SA | **灵魂燃烧**：[mobAbility aoeAtPlayer] 每 5s：玩家脚下 r16 预警 1.0s，dmg×1.3 + dot（G.dotT 4s）。<br>**召唤熔岩之子**：[mobAbility summon] 每 9s 召唤 1 只 熔岩之子（BT 小怪 50% 血，死亡分裂为 2 只 30% 血），场上最多 3 只。<br>**火球**：远程普通射击：fire 弹 70px/s，命中地面留 1.5s 小火池（现有 fire:1）。 |
| 烈焰行者牧师 | SA | **暗影箭**：紫色弹 80px/s dmg×1.1，射击前头顶“!” .45s。<br>**黑暗治疗**：[castBar] 读条 2s 治疗血量最低的友军 30%；被命中 3 次打断。冷却 8s。<br>**暗言术：痛**：每 10s 对玩家 dot 6s（G.dotT），无预警但 buff 栏显示。 |

### 首领

#### MC-1 鲁西弗隆（Lucifron）

- 关卡：3 间小怪房 + 首领房；精英：熔火恶犬；小怪：熔火恶犬、烈焰行者、烈焰行者牧师
- 血量 ×0.9 · 狂暴 60s · 技能轮换：NEW:impendingDoom → NEW:lucifronCurse → NEW:shadowShock
- **玩家提示**：先杀两名护卫防止被支配；末日降临倒数结束必掉血，别在残血时贴脸。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 末日降临 | `NEW:impendingDoom` | [curse:delayed] 每 12s 给玩家挂 6s 倒计时（头顶骷髅），结束 hurt(skd×1.2)。无法躲，提示留血。 |
| 鲁西弗隆的诅咒 | `NEW:lucifronCurse` | [curse:cd] 每 15s：10s 内技能冷却 ×2。 |
| 暗影震击 | `NEW:shadowShock` | [tel] circle@boss r48 T.8 skd×.8，惩罚贴身。 |
| 护卫 | `adds` | 开场两名烈焰行者护卫站在首领左右，护卫存活时首领受伤 ×.8。 |

**召唤物 / 同伴**

- **烈焰行者护卫**（SK，×2，血 ×2.5）：顺劈斩：[tel] cone@self 朝玩家 ang.6 len30 T.6 dmg×1.2，每 4s。；支配心灵：[mindControl] 每 15s：玩家脚下紫圈 1.0s，命中则被控 3s。

#### MC-2 玛格曼达（Magmadar）

- 关卡：2 间小怪房 + 首领房；小怪：熔火恶犬、熔岩奔腾者、火焰之王
- 血量 ×1.0 · 狂暴 60s · 技能轮换：roar → NEW:lavaBomb → NEW:lavaBomb → NEW:frenzyMagmadar
- **玩家提示**：恐慌前远离；狂乱时用大招安抚；熔岩炸弹落地会留火，别站进去。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 恐慌 | `roar` | 现有 roar：circle@boss r260 T1.0 skd×.3 fear 1.3s。每 15s。 |
| 熔岩炸弹 | `NEW:lavaBomb` | [tel] circle@player r18 T.9 skd×1，n=2（第 2 个落在玩家移动方向前方 30px），after:'pool' 火池 6s 每 .5s skd×.2。 |
| 狂乱 | `NEW:frenzyMagmadar` | [frenzy] 8s，可被大招安抚；头顶“狂乱！” |
| 熔岩喷吐 | `passive` | 贴身接触伤害附带 2s 灼烧 dot。 |

#### MC-3 基赫纳斯（Gehennas）

- 关卡：3 间小怪房 + 首领房；精英：烈焰行者；小怪：烈焰行者、烈焰行者牧师、熔岩奔腾者
- 血量 ×0.95 · 狂暴 60s · 技能轮换：NEW:rainOfFire → frostbolt → NEW:gehennasCurse
- **玩家提示**：诅咒期间回血几乎无效，先清两只烈焰行者，火雨要立刻离开。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 火焰之雨 | `NEW:rainOfFire` | [tel] circle@player r24 T1.0 n=3 spread30，after:'pool' 火池 4s。 |
| 暗影箭 | `frostbolt` | 复用 frostbolt（瞄准线 .75s 后快弹 skd×1.5），颜色改紫 #9a5aff。 |
| 基赫纳斯的诅咒 | `NEW:gehennasCurse` | [curse:heal] 12s 回复 ×.25，每 20s。 |

**召唤物 / 同伴**

- **烈焰行者**（SK，×2，血 ×2）：拉格纳罗斯之拳：同小怪：自身 r24 .7s 眩晕 1s。；破甲：[stacks vuln]。

#### MC-4 加尔（Garr）

- 关卡：3 间小怪房 + 首领房；精英：火焰之王；小怪：火焰之王、熔火巨人、熔岩奔腾者
- 血量 ×1.1 · 狂暴 70s · 技能轮换：NEW:antimagicPulse → NEW:magmaShackles → slam
- **玩家提示**：火誓者死亡会爆炸：引到加尔身边一只只打，别一次 AOE 一堆贴着你炸。

**阶段**

- 血量 100%：开场 8 只火誓者环绕加尔（summonRing r44）。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 反魔法脉冲 | `NEW:antimagicPulse` | [tel] circle@boss r200 harmless 预警 .8s：清除玩家护盾（pl.shield=0）与临时增益（G.rushT/G.songT 等）。每 12s。 |
| 熔岩镣铐 | `NEW:magmaShackles` | 全屏减速 3s（G.pSlowT=3），预警：屏幕边缘红闪 .6s。 |
| 火誓者死亡强化加尔 | `onAddDeath` | 每死 1 只火誓者：加尔移速 +5%、伤害 +5%（层数显示在血条旁）。 |
| 重击 | `slam` | 复用 slam（玩家脚下 r26，召唤改为 0）。 |

**召唤物 / 同伴**

- **火誓者**（SK，×8，血 ×0.8）：献祭：接触伤害附带灼烧 dot 3s。；爆发：[mobAbility deathExplode] 死亡时 r30 预警 .5s，skd×.8；连锁：爆炸也伤其他火誓者。；分离焦虑：离加尔 >80px 时伤害 ×2、体型 +20%（红光）。

#### MC-5 迦顿男爵（Baron Geddon）

- 关卡：3 间小怪房 + 首领房；精英：熔火巨人；小怪：熔火巨人、火焰之王、熔岩奔腾者
- 血量 ×1.0 · 狂暴 70s · 技能轮换：NEW:livingBomb → NEW:inferno → NEW:igniteMana
- **玩家提示**：成为活体炸弹时远离所有小怪；地狱火开始立刻拉开距离；残血时大灾变，跑到对角。

**阶段**

- 血量 5%：大灾变：首领无敌，读条 6s，r120 圈 skd×3；玩家必须跑到房间对角。读完后首领自爆死亡（算击杀）。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 活体炸弹 | `NEW:livingBomb` | [playerBomb] t=8 r40 dmg 1.0，圈内每多 1 个敌人伤害 +50%，爆炸留火池 4s。每 18s。 |
| 地狱火 | `NEW:inferno` | [followAura] r40 6s，每 .5s skd×.35，首领停止移动；递增：后 3s 伤害 ×1.5。 |
| 点燃法力 | `NEW:igniteMana` | G.skillT += 3（技能冷却倒退）+ 4s dot；头顶蓝色火焰提示。每 14s。 |
| 大灾变 | `phase` | 见 phases：castBar 不可打断。 |

**召唤物 / 同伴**

- **熔岩奔腾者（巡逻）**（BT，×1，血 ×1.5）：奔涌：同小怪。每 20s 从门口进来 1 只（场上最多 2 只），用来教学“带炸弹远离小怪”。

#### MC-6 沙斯拉尔（Shazzrah）

- 关卡：2 间小怪房 + 首领房；小怪：熔火巨人、熔火恶犬
- 血量 ×0.9 · 狂暴 55s · 技能轮换：NEW:arcaneExplosion → blink → NEW:shazzrahCurse → NEW:counterspell → NEW:deadenMagic
- **玩家提示**：他会闪现到你身上再放奥术爆炸：看到“闪现”就准备走开；护盾出现用大招破掉。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 奥术爆炸 | `NEW:arcaneExplosion` | [tel] circle@boss r50 T.6 skd×.9，每 4s 自动穿插（不占轮换）。 |
| 闪现 | `blink` | 复用 blink：消失→出现在玩家位置，落地后立刻接一次奥术爆炸。 |
| 沙斯拉尔的诅咒 | `NEW:shazzrahCurse` | [curse:vuln] 10s 受伤 +30%（G.vulnT）。 |
| 法术反制 | `NEW:counterspell` | [tel] circle@boss r70 T.8，命中 G.sealT=3（封技能）。 |
| 魔法抑制 | `NEW:deadenMagic` | [bossShield:reduce] 10s 受伤 ×.5，大招命中驱散。 |

#### MC-7 萨弗隆先驱者（Sulfuron Harbinger）

- 关卡：3 间小怪房 + 首领房；精英：烈焰行者；小怪：烈焰行者、烈焰行者牧师、熔火恶犬
- 血量 ×1.0 · 狂暴 70s · 技能轮换：NEW:handOfRagnaros → NEW:inspire → NEW:demoShout → NEW:flameSpear
- **玩家提示**：先打断并击杀 4 名祭司，否则萨弗隆会被不停治疗。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 拉格纳罗斯之手 | `NEW:handOfRagnaros` | [tel] circle@boss r40 T.9 skd×1 stun 1s + knock 30。 |
| 鼓舞 | `NEW:inspire` | [frenzy] 作用于所有祭司 10s（施法速度 ×2）。 |
| 挫志怒吼 | `NEW:demoShout` | [curse:dmg] 8s 玩家伤害 ×.5（原作降攻强）。 |
| 烈焰之矛 | `NEW:flameSpear` | [tel] circle@random r22 n=2 + circle@player r22，T1.0 skd×1.2。 |

**召唤物 / 同伴**

- **烈焰行者祭司**（SA，×4，血 ×1.6）：黑暗治疗：[castBar] 2s 治疗萨弗隆 15% 或友军 30%，命中 3 次打断。冷却 8s，4 个错开。；暗言术：痛：dot 6s。；暗影箭：紫弹 dmg×1。

#### MC-8 焚化者古雷曼格（Golemagg the Incinerator）

- 关卡：3 间小怪房 + 首领房；精英：熔火巨人；小怪：熔火巨人、火焰之王、熔火恶犬
- 血量 ×1.2 · 狂暴 75s · 技能轮换：NEW:pyroblast → NEW:magmaSplash → erupt
- **玩家提示**：别管两只熔火怒犬，它们杀不死；岩浆飞溅层数高了就拉开一下。

**阶段**

- 血量 10%：地震：每 3s 全屏脉冲 skd×.3（无预警，屏幕震动），直到击杀。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 炎爆术 | `NEW:pyroblast` | [castBar] 1.5s 后向玩家发射大火球 skd×1.6 + dot 6s，命中 4 次可打断。 |
| 岩浆飞溅 | `NEW:magmaSplash` | [stacks vuln] 玩家在首领 24px 内每 2s +1 层。 |
| 熔岩喷发 | `erupt` | 复用 erupt。 |
| 地震 | `phase` | 10% 以下进入（见 phases）。 |

**召唤物 / 同伴**

- **熔火怒犬**（BT，×2，血 ×3）：不死：血量低于 50% 立即回满（“熔岩之怒”），古雷曼格死亡时一起死亡；只需控制不需击杀。；重伤：[stacks heal] 每次命中 +1。

#### MC-9 管理者埃克索图斯（Majordomo Executus）

- 关卡：2 间小怪房 + 首领房；小怪：烈焰行者、烈焰行者牧师
- 血量 ×1.0 · 狂暴 80s · 技能轮换：NEW:shieldSwap → NEW:teleportPit → NEW:aegis
- **玩家提示**：管理者本人打不动：先打断医师的治疗，护盾亮起时停止输出。

**阶段**

- 血量 100%：管理者本人全程无敌（b.inv）；8 名随从全部死亡 → 他投降（台词“不可能！……我将服从你们”）并消失，关卡完成，下一关解锁拉格纳罗斯。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 魔法反射 / 伤害护盾 | `NEW:shieldSwap` | [bossShield] 每 25s 给所有随从 8s 护盾，交替 reflect（远程/技能伤害反弹 15%）与 damage shield（近战命中者每次受 skd×.15）。护盾期间提示“停手/换打法”。 |
| 传送 | `NEW:teleportPit` | [teleportPlayer] 把玩家传送到房间一角的火坑（火池 3s 每 .5s skd×.25），每 18s。 |
| 拉格纳罗斯之盾 | `NEW:aegis` | 管理者自身装饰性护盾，提示“管理者无法被击杀，击败他的随从”。 |

**召唤物 / 同伴**

- **烈焰行者精英**（SK，×4，血 ×2.5）：火焰冲击：[tel] circle@player r16 T.7 dmg×1.2。；冲击波：[tel] circle@self r30 T.8 dmg×1 slow。
- **烈焰行者医师**（SA，×4，血 ×2）：强效治疗：[castBar] 2.5s 治疗友军 30%，命中 4 次打断。；暗影箭：紫弹。

#### MC-10 拉格纳罗斯（Ragnaros）

- 关卡：2 间小怪房 + 首领房；小怪：熔岩奔腾者、火焰之王
- 血量 ×1.6 · 狂暴 90s · 技能轮换：wrath → erupt → NEW:magmaBlast → wrath → erupt
- **玩家提示**：别离他太远（会被岩浆冲击点名），也别贴太近被击退进熔岩；潜入后尽快清掉烈焰之子。

**阶段**

- 血量 50%：潜入熔岩（submerge）：首领无敌消失 20s，房间刷 8 只烈焰之子，全部击杀或 20s 后浮出。
- 60 秒：若 60s 时还没到 50%，同样触发一次潜入（原作 3 分钟潜入）。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 拉格纳罗斯之怒 | `wrath` | 现有 wrath：circle@boss r48 T.9 skd×1.2 knock 45。 |
| 熔岩爆裂 | `erupt` | 现有 erupt：5（P2 8）个圈，第一个在玩家脚下。 |
| 岩浆冲击 | `NEW:magmaBlast` | [rangedPunish] D=70：玩家离开近战范围 2s → 大火球 skd×1.6。 |
| 元素之火 | `passive` | 首领接触伤害附带 dot 4s。首领 spd=0，固定在熔岩湖边（上半部）。 |
| 潜入熔岩 / 烈焰之子 | `submerge` | 现有 submerge，改为按 phases 触发而不是轮换技能。 |

**召唤物 / 同伴**

- **烈焰之子**（SK，×8，血 ×1.5）：燃烧：接触伤害 + 灼烧；移速 ×1.2。；法力燃烧：命中时 G.skillT += 1。


## 第 2 章 · 奥妮克希亚的巢穴（Onyxia's Lair，60 级，经典旧世（60））

### 环境

尘泥沼泽南部的火山洞穴：一条向下盘旋的狭长隧道，两侧有守卫驻守，尽头是巨大的圆形龙巢，地面散落骸骨与金币，两侧有孵满雏龙蛋的侧洞，地面裂缝在 P3 会喷出熔岩。

- 瓦片集：tiles_c2.png（黑石龙巢，近似可复用；需补金币/裂缝地砖）
- 音乐：空旷洞穴回响 + 龙翼扇动低频，P2 转为急促鼓点

**地图机关**

- **雏龙蛋**：首领房两侧侧洞各 4 个（现有 EGG：倒计时孵化 2 只雏龙）；P2 起每 15s 一侧整排孵化。可提前打碎。
- **熔岩裂缝**：首领房地面 6 条裂缝，P3 低沉咆哮时随机 3 条喷发（rect 预警 .9s，skd×1）。

### 小怪

> 原作巢穴只有守卫与雏龙两种小怪；为满足 4 槽位与远程比例，补了 2 种黑龙军团扩展（faithful:false），可删。

| 名称 | 基础行为 | 技能 |
|---|---|---|
| 奥妮克希亚守卫 | SK ×2血 | **火焰新星**：[mobAbility nova] 每 6s 自身 r32 .8s dmg×1.1。<br>**顺劈斩**：[tel] cone@self ang.6 len28 T.5 dmg×1。<br>**拳击**：近身命中 G.sealT=1.5（打断施法）。 |
| 奥妮克希亚雏龙 | BT | **扑咬**：[mobAbility pounce] 蓄力 .3s。成群出现（4~6 只）。<br>**火焰吐息**：[tel] cone@self 朝玩家 ang.4 len30 T.5 dmg×.8，每 5s（小火苗，教学“锥形预警”）。 |
| 黑龙卫兵（扩展） | SL ×2.5血 | **龙鳞护甲**：受到远程伤害 ×.7，近战正常。<br>**岩石践踏**：[mobAbility nova] r26 .9s knock。 |
| 黑龙法师（扩展） | SA | **火球术**：3 连发火球（现有 n=3 扇形）。<br>**烈焰冲击**：[mobAbility aoeAtPlayer] r16 T1.0 dmg×1.2。 |

### 首领

#### ONY-1 奥妮克希亚（Onyxia）

- 关卡：3 间小怪房 + 首领房；精英：奥妮克希亚守卫；小怪：奥妮克希亚守卫、奥妮克希亚雏龙、黑龙卫兵、黑龙法师
- 血量 ×1.5 · 狂暴 100s · 技能轮换：NEW:onyBreath → NEW:tailSweep → NEW:wingBuffet → NEW:onyCleave
- **玩家提示**：站在龙的侧面：前面是吐息、后面是尾扫；她起飞后注意“深呼吸”，落地后恐惧会把你吓进裂缝。

**阶段**

- 血量 65%：P2 起飞（现有 fly）：无敌，悬停上方；火球点名、深呼吸横扫一整条纵带、两侧雏龙涌出；持续到血量阈值改为“14s 或 雏龙全灭”后落地（因为无敌时血量不降，这里用时间）。
- 血量 40%：P3 落地：轮换改为 roar、erupt（来自熔岩裂缝）、onyBreath、tailSweep；雏龙每 20s 仍从侧洞来 3 只。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 火焰吐息 | `NEW:onyBreath` | [bossFacing] P1 固定在房间中央朝下；[tel] cone fixed a=π/2 ang.55 len150 T1.0 skd×1.5。站侧面安全。 |
| 尾部横扫 | `NEW:tailSweep` | [tel] cone fixed a=-π/2（身后）ang.7 len80 T.8 skd×1 knock 40。 |
| 龙翼打击 | `NEW:wingBuffet` | [tel] circle@boss r40 T.8 skd×.8 knock 50。 |
| 顺劈斩 | `NEW:onyCleave` | [tel] cone fixed 正前 ang.4 len40 T.5 skd×1，穿插使用。 |
| 深呼吸 | `fly` | 现有 fly 内的 rect 纵带 48 宽 1.5s 预警 skd×2；说“深呼吸”。 |
| 火球 | `fly` | 现有 fly 内每 1.3s 对玩家火球 skd×.8。 |
| 低沉咆哮 | `roar` | 现有 roar（恐惧 1.3s），同时熔岩裂缝喷发 3 条。 |

**召唤物 / 同伴**

- **奥妮克希亚雏龙**（BT，×8，血 ×0.8）：扑咬：同小怪，P2 从两侧侧洞涌出（现有 whelps）。


## 第 3 章 · 黑翼之巢（Blackwing Lair，60 级，经典旧世（60））

### 环境

黑石塔顶端奈法利安的巢穴：黑色玄武岩大厅与铁质栅门，墙上挂黑龙旗；拉佐格尔的孵化场满地龙蛋；勒什雷尔前是布满压制装置的走廊；之后是三小龙的龙穴、克洛玛古斯的实验室（彩色化学瓶与笼子），最后是奈法利安的王座大厅（龙人尸骨遍地）。

- 瓦片集：tiles_c2.png（黑石龙巢，近似；需补实验室/化学桶）
- 音乐：厚重铜管 + 金属敲击，奈法利安关加入合唱

**地图机关**

- **黑龙蛋**：拉佐格尔关：首领房 6 个（objectiveProps destroy），全部击碎进入 P2；小怪房里也有，现有 EGG 孵化逻辑。
- **压制装置**：勒什雷尔关小怪房每间 2 个（prop，hp 40）：每 5s 预警 .8s 后 r40 脉冲，命中减速 2.5s + 封技能 1s；击毁 12s 后重新激活（原作需盗贼解除）。
- **化学药剂桶**：克洛玛古斯关装饰 + 可打碎（hp 20）：打碎后 4s 内玩家清除龙血痛苦（致敬时光沙漏）。

### 小怪

| 名称 | 基础行为 | 技能 |
|---|---|---|
| 黑翼军团士兵 | SK | **顺劈斩**：[tel] cone@self ang.6 len28 T.5 dmg×1.1。<br>**狂怒**：[mobAbility buffAllies] 附近 60px 内友军死亡时：自身伤害 +30% 移速 +20%（可叠 3 层）。 |
| 腐化的雏龙 | BT | **扑咬**：[mobAbility pounce]。<br>**五色腐化**：生成时按 红/蓝/绿/青铜 轮流着色；命中附带对应效果：红 dot、蓝 slow、绿 heal-50%、青铜 眩晕 .6s（按顺序，不随机）。 |
| 死爪龙卫 | SL ×3血 | **元素抗性轮换**：每 8s 切换：抵抗近战（近战伤害 ×.3，身上蓝光）↔ 抵抗远程（远程 ×.3，红光）。<br>**战争践踏**：[mobAbility nova] r30 .9s stun .8s。死亡不分裂。 |
| 黑翼法师 | SA | **火球术**：火球 80px/s dmg×1.1，留小火池。<br>**奥术爆炸**：[mobAbility nova] 玩家 <30px 时自身 r30 .6s dmg×1。 |
| 黑翼技师 | SA | **投掷炸弹**：[mobAbility aoeAtPlayer] r18 T1.0 dmg×1.3，炸弹贴图抛物线。<br>**逃跑**：血量 <30% 向远离玩家方向跑 2s（e.flee）。 |
| 黑翼缚法者 | SA | **强效变形术**：[mobAbility aoeAtPlayer] r14 T1.2 → 眩晕 2s（stun，变羊贴图）。冷却 10s。<br>**暗影指令**：[mindControl] 2s，冷却 15s。<br>**魔法免疫**：技能伤害 ×.5（普攻正常）。 |

### 首领

#### BWL-1 狂野的拉佐格尔（Razorgore the Untamed）

- 关卡：2 间小怪房 + 首领房；小怪：黑翼军团士兵、黑翼法师、死爪龙卫
- 血量 ×1.0 · 狂暴 80s · 技能轮换：NEW:conflagration → NEW:warStomp → volley
- **玩家提示**：先砸龙蛋！四角会不停来人，边打蛋边处理靠近的法师。

**阶段**

- 血量 100%：P1 龙蛋阶段：拉佐格尔无敌待在房顶（原作被控制宝珠控制），房内 6 个黑龙蛋（objectiveProps destroy），四角持续刷军团；蛋全碎 → P2。超时 45s 未碎完则一次刷 6 只精英士兵。
- 血量 99%：P2：拉佐格尔下场，残余小怪保留。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 摧毁龙蛋 | `objectiveProps` | [objectiveProps destroy] 6 个 EGG（hp 30，不孵化），全部击碎触发 P2。 |
| 爆燃 | `NEW:conflagration` | [tel] circle@player r20 T.9 skd×1 + dot 6s + fear .8s（迷失）。 |
| 战争践踏 | `NEW:warStomp` | [tel] circle@boss r40 T.8 skd×.8 stun .8。 |
| 火球齐射 | `volley` | 现有 volley。 |

**召唤物 / 同伴**

- **黑翼军团士兵**（SK，持续刷新，血 ×1）：涌入：P1 每 4s 从四角各刷 1 只（随机：士兵/法师/龙卫=6:3:1，按计数轮转）。
- **黑翼法师**（SA，持续刷新，血 ×1）：涌入：同上。

#### BWL-2 堕落的瓦拉斯塔兹（Vaelastrasz the Corrupt）

- 关卡：2 间小怪房 + 首领房；小怪：黑翼军团士兵、黑翼技师
- 血量 ×1.0 · 狂暴 45s · 技能轮换：adrenaline → fireCone → NEW:fireNova → NEW:vaelTail
- **玩家提示**：纯输出检定：他只剩 30% 血，精华让你大招转得飞快，全力输出；站侧面躲吐息和尾扫。

**阶段**

- 血量 30%：开场即 30% 血（现有 start:.3），开场 2.6s 给玩家“红龙精华”：大招冷却减半、能量无限（现有 essence）。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 燃烧刺激 | `adrenaline` | 现有：伤害 ×2、持续掉血 8s；改为每 15s 一次并有 1s 头顶预警。 |
| 红龙精华 | `essence` | 现有 essence。 |
| 烈焰吐息 | `fireCone` | [bossFacing] 固定朝下，cone ang.55 len150 T1.0 skd×1.3。 |
| 火焰新星 | `NEW:fireNova` | 每 3s 全屏脉冲 skd×.12（无法躲，靠精华爆发打穿）。 |
| 龙尾横扫 | `NEW:vaelTail` | [tel] cone fixed 身后 ang.7 len80 T.8 skd×1 knock。 |

#### BWL-3 勒什雷尔（Broodlord Lashlayer）

- 关卡：4 间小怪房 + 首领房；精英：死爪龙卫；小怪：黑翼军团士兵、死爪龙卫、黑翼技师、黑翼缚法者
- 血量 ×1.1 · 狂暴 70s · 技能轮换：NEW:mortalStrike → NEW:knockAway → NEW:blastWave → NEW:lashCleave
- **玩家提示**：关键在路上：压制装置会减速封技能，先拆掉再清怪；首领致死打击会削减回血。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 致死打击 | `NEW:mortalStrike` | [tel] circle@player r16 T.6 skd×1.5 + [curse:heal] 5s。 |
| 击退 | `NEW:knockAway` | [tel] cone@boss ang.5 len40 T.6 skd×.8 knock 70（把你打远，随后他冲过来）。 |
| 冲击波 | `NEW:blastWave` | [tel] circle@boss r40 T.8 skd×.9 slow。 |
| 顺劈斩 | `NEW:lashCleave` | [tel] cone@boss ang.6 len30 T.5 skd×1。 |

#### BWL-4 费尔默（Firemaw）

- 关卡：2 间小怪房 + 首领房；小怪：黑翼军团士兵、死爪龙卫
- 血量 ×1.1 · 狂暴 65s · 技能轮换：NEW:wingBuffet → shadowflame → NEW:wingBuffet → shadowflame
- **玩家提示**：烈焰打击层数会越叠越痛：层数高了躲到石柱后面断视线清层。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 龙翼打击 | `NEW:wingBuffet` | [tel] circle@boss r48 T.8 skd×.8 knock 50。 |
| 暗影烈焰 | `shadowflame` | 现有 shadowflame（cone + dot）。 |
| 烈焰打击 | `NEW:flameBuffet` | [stacks vuln] 首领对玩家有视线时每 2s +1 层（被动，不占轮换）；躲到房内石柱后（los 为假）3s 清空。首领房必须有 2 根挡视线的石柱。 |

#### BWL-5 埃博诺克（Ebonroc）

- 关卡：2 间小怪房 + 首领房；小怪：黑翼技师、黑翼缚法者
- 血量 ×1.1 · 狂暴 65s · 技能轮换：NEW:wingBuffet → shadowflame → NEW:shadowOfEbonroc
- **玩家提示**：身上有埃博诺克之影时被他打中会给他回血：这 8 秒保持距离。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 龙翼打击 | `NEW:wingBuffet` | 同费尔默。 |
| 暗影烈焰 | `shadowflame` | 现有。 |
| 埃博诺克之影 | `NEW:shadowOfEbonroc` | 玩家减益 8s（紫色影子贴图）：期间首领每次对玩家造成伤害回复自身 3% 最大生命；提示“拉开距离，别被他打到”。 |

#### BWL-6 弗莱格尔（Flamegor）

- 关卡：2 间小怪房 + 首领房；小怪：黑翼军团士兵、黑翼法师
- 血量 ×1.1 · 狂暴 65s · 技能轮换：NEW:wingBuffet → shadowflame → NEW:frenzyFlamegor
- **玩家提示**：狂乱时会不停火焰新星：立刻用大招安抚。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 龙翼打击 | `NEW:wingBuffet` | 同费尔默。 |
| 暗影烈焰 | `shadowflame` | 现有。 |
| 狂乱 | `NEW:frenzyFlamegor` | [frenzy] 8s；狂乱期间每 1s 全屏火焰新星 skd×.25。大招安抚立即停止新星。 |

#### BWL-7 克洛玛古斯（Chromaggus）

- 关卡：3 间小怪房 + 首领房；精英：死爪龙卫；小怪：腐化的雏龙、死爪龙卫、黑翼法师
- 血量 ×1.3 · 狂暴 80s · 技能轮换：NEW:breathA → affliction → NEW:breathB → NEW:frenzyChromaggus
- **玩家提示**：每场随机两种吐息，开打先看清是哪两种；龙血痛苦集满 5 色会失控，打碎药剂桶能清除。

**阶段**

- 血量 20%：永久狂乱（frenzy perm），提示“克洛玛古斯 狂暴！”

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 随机两种吐息 | `NEW:breathA` | 开战时从 5 种中抽 2 种作为 breathA/breathB 固定整场（现有 breaths 逻辑，补第 5 种）：焚化（fireCone）/冰霜灼烧（frostCone slow）/时间流逝（timeCone stun）/腐蚀酸液（acidCone dot）/点燃躯体（NEW：cone + dot 8s 伤害递增）。 |
| 随机两种吐息（第二种） | `NEW:breathB` | 同上，与 breathA 交替，间隔约 10s。 |
| 龙血痛苦 | `affliction` | 现有 affliction（红 dot / 蓝 slow / 黑 vuln / 青铜 stun），补 绿：回复 −50%；同时身上 5 色齐全 → mindControl 4s（“克洛玛古斯的血液”）。 |
| 狂乱 | `NEW:frenzyChromaggus` | [frenzy] 8s，大招安抚。 |

#### BWL-8 奈法利安（Nefarian）

- 关卡：3 间小怪房 + 首领房；精英：黑翼缚法者；小怪：黑翼军团士兵、黑翼法师、黑翼缚法者、死爪龙卫
- 血量 ×1.8 · 狂暴 100s · 技能轮换：shadowflame → roar → NEW:classCall → NEW:nefCleave → NEW:veilOfShadow
- **玩家提示**：P1 先清龙人（注意颜色对应的吐息）；职业召唤每个职业不同，看清提示再动；20% 后骨头会站起来。

**阶段**

- 血量 100%：P1：维克多·奈法里奥斯（人形）无敌站在王座，左右两门每 3.6s 刷龙人（现有 drakes，改为按颜色轮转），他施放暗影箭齐射（volley）、恐惧（roar）、变形术（circle@player stun 1.5s）；击杀 12 只龙人 → 奈法利安降临。
- 血量 99%：P2：奈法利安本体，轮换 skills。
- 血量 20%：P3：骸骨复苏（现有 raise）：在 P1 龙人尸骨处复苏骨构造体（数量 = 击杀龙人数 /2）。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 暗影烈焰 | `shadowflame` | 现有。 |
| 低沉咆哮 | `roar` | 现有。 |
| 职业召唤 | `NEW:classCall` | 取代现有 classcall 的统一封技能。按职业：剑士/斗士→战士（10s 受伤 +30%）；法师→法师（8s 内每 2s 玩家脚下 r14 变形圈，中则 stun 1.5s）；射手/工程师→猎人（8s 攻击距离 ×.5）；刺客/忍者→盗贼（被传送到奈法利安面前并定身 1.5s）；吟游诗人→牧师（8s 治疗变为伤害）；圣骑士→圣骑士（奈法利安获得保护祝福：无敌 4s）。 |
| 顺劈 / 尾扫 | `NEW:nefCleave` | [tel] cone@boss ang.6 len40 T.6 skd×1.1。 |
| 暗影之幕 | `NEW:veilOfShadow` | [curse:heal] 6s 回复 ×.25。 |

**召唤物 / 同伴**

- **龙人（五色）**（SK，持续刷新，血 ×1.6）：颜色吐息：按颜色：红 火焰锥 dot、蓝 冰锥 slow、绿 毒锥 heal−、青铜 时间锥 stun、黑 暗影锥；cone len40 T.7。；骨头：死亡留下尸骨标记，P3 可复苏。


## 第 4 章 · 祖尔格拉布（Zul'Gurub，60 级，经典旧世（60））

### 环境

荆棘谷北部丛林中的古拉巴什巨魔神庙城：长满藤蔓的阶梯金字塔、石雕神像与血祭祭坛，五座兽神祭坛（蝙蝠、蛇、蜘蛛、虎、豹），中央水潭（加兹兰卡），最深处是哈卡的血神祭坛，地面流淌着血色水渠。

- 瓦片集：无（需新做）
- 音乐：巨魔手鼓 + 丛林虫鸣，节奏轻快但紧张

**地图机关**

- **蜘蛛卵**：玛尔里关与小怪房：现有 EGG 逻辑换皮，9~13s 孵化 2 只小蜘蛛（BT）。
- **豹笼**：娅尔罗关：房间四边各 1 个（prop hp 40），每 8s 放出 1 只祖利安猎豹；击毁后不再放出。
- **血祭祭坛**：哈卡关中心装饰；阿亚米斯式献祭不用。纯视觉 + 哈卡出场时喷血。
- **毒血池**：哈卡之子死亡留下（r18，10s）：站进去获得“毒性之血”抵消血液虹吸。

### 小怪

| 名称 | 基础行为 | 技能 |
|---|---|---|
| 古拉巴什狂暴者 | SK ×3血 | **威慑怒吼**：[mobAbility fear] 自身 r60 T.9 → fear 1.2s。冷却 12s。<br>**击飞**：[tel] cone@self ang.6 len30 T.6 dmg×1.3 knock 50。<br>**狂暴**：血量 <30% 伤害 +50%、移速 +30%（永久，红光）。 |
| 祖利安猛虎 | BT | **猛扑**：[mobAbility pounce] 蓄力 .35s，命中 dmg×1.2 + 流血 dot。<br>**疾跑**：每 8s 移速 ×1.8 持续 2s（尾迹）。 |
| 拉扎什寡妇蛛 | SL ×2血 | **蛛网**：[mobAbility aoeAtPlayer] r18 T1.0 → root 1.5s（pl.frozenT，无伤）。<br>**产卵**：[mobAbility deathSplit] 死亡时生出 4 只小蜘蛛（BT 25% 血），取代史莱姆分裂。 |
| 古拉巴什掷斧者 | SA | **投掷飞斧**：2 连发旋转飞斧（spread .25）90px/s dmg×1.1，射击前“!” .45s。<br>**斧舞**：玩家 <26px 时 [mobAbility nova] r26 .6s dmg×1（近身反击）。 |
| 哈卡莱巫医 | SA | **妖术**：[mobAbility aoeAtPlayer] r14 T1.2 → stun 1.5s（青蛙贴图）。冷却 10s。<br>**收缩**：[curse:dmg] 6s 玩家伤害 ×.6（角色缩小 20%）。<br>**暗影箭**：紫色弹 dmg×1。 |
| 古拉巴什蝙蝠骑士 | SA | **液态火**：[mobAbility aoeAtPlayer] r20 T1.0 dmg×1 after:'pool' 火池 4s。<br>**不稳定的混合物**：血量 <30%：直线预警 len120 w8 .8s 后俯冲，终点 r30 爆炸 dmg×2，自身死亡。 |

### 首领

#### ZG-1 高阶祭司耶克里克（High Priestess Jeklik）

- 关卡：3 间小怪房 + 首领房；精英：古拉巴什狂暴者；小怪：古拉巴什狂暴者、古拉巴什蝙蝠骑士、哈卡莱巫医
- 血量 ×1.0 · 狂暴 65s · 技能轮换：charge → NEW:sonicBurst → whelps → NEW:swoop
- **玩家提示**：50% 后她会读条强效治疗——一定要打断；精神鞭笞可以躲到柱子后断开。

**阶段**

- 血量 50%：P2 变回人形（formArt）：轮换改为 NEW:mindFlay、NEW:greatHeal、NEW:fireBombs、NEW:swPain。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 冲锋 | `charge` | 现有 charge。 |
| 刺耳尖啸 | `NEW:sonicBurst` | [tel] circle@boss r60 T.8 skd×.6 → G.sealT=2（沉默）。 |
| 俯冲 | `NEW:swoop` | [tel] beam@boss→player w12 T.9 skd×1 knock 30。 |
| 精神鞭笞 | `NEW:mindFlay` | 引导 3s：首领与玩家间画紫色光束，每 .5s skd×.25 + slow；los 被石柱挡住则中断。 |
| 强效治疗 | `NEW:greatHeal` | [castBar] 3s 回复 20%，命中 6 次打断。 |
| 火焰炸弹（蝙蝠骑士） | `NEW:fireBombs` | [tel] circle@random r20 n=5 T1.2 skd×1 after:'pool' 火池 5s（上方飞过的蝙蝠投下）。 |
| 暗言术：痛 | `NEW:swPain` | dot 8s。 |

**召唤物 / 同伴**

- **血顶蝙蝠**（BT，×6，血 ×0.6）：扑咬：[mobAbility pounce]。P1 每 20s 从两侧涌入 6 只（现有 whelps）。

#### ZG-2 高阶祭司温诺希斯（High Priest Venoxis）

- 关卡：3 间小怪房 + 首领房；精英：拉扎什寡妇蛛；小怪：拉扎什寡妇蛛、祖利安猛虎、古拉巴什掷斧者
- 血量 ×1.0 · 狂暴 65s · 技能轮换：NEW:holyWrath → NEW:holyFire → NEW:renew
- **玩家提示**：P1 打断恢复、躲开神圣之火；P2 变蛇后会到处留毒云，别回头踩。

**阶段**

- 血量 50%：P2 变成巨蛇（formArt，移速 +30%）：轮换改为 NEW:poisonCloud、NEW:venomSpit、NEW:parasites。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 神圣之怒 | `NEW:holyWrath` | 金色弹 60px/s 命中玩家后弹回首领再弹向玩家，共 3 次，每次伤害 ×1.3（skd×.5 起）。 |
| 神圣之火 | `NEW:holyFire` | [tel] circle@player r16 T1.0 skd×1 + dot 6s。 |
| 恢复 | `NEW:renew` | [castBar] 1.5s 后 6s 内回 8%，命中 3 次打断。 |
| 毒云 | `NEW:poisonCloud` | 沿玩家路径每 .8s 留 1 个毒池（r14，6s，skd×.2/.5s），持续 4s。 |
| 毒液喷吐 | `NEW:venomSpit` | acidCone（cone + dot）。 |
| 寄生毒蛇 | `NEW:parasites` | 每次召唤 2 条小蛇（BT 40% 血）从首领身边钻出。 |

**召唤物 / 同伴**

- **拉扎什眼镜蛇**（BT，×4，血 ×1.5）：毒牙：接触 dot 4s。开场 4 只。

#### ZG-3 高阶祭司玛尔里（High Priestess Mar'li）

- 关卡：3 间小怪房 + 首领房；精英：拉扎什寡妇蛛；小怪：拉扎什寡妇蛛、哈卡莱巫医、古拉巴什狂暴者
- 血量 ×1.0 · 狂暴 65s · 技能轮换：NEW:spawnEggs → NEW:poisonVolley → NEW:drainLife
- **玩家提示**：蜘蛛卵出现马上打掉，幼蛛会越长越大；巨魔形态的吸取生命要打断。

**阶段**

- 血量 66%：切换为蜘蛛形态 25s：轮换 NEW:envelopingWeb、charge、NEW:corrosivePoison；之后变回巨魔形态。
- 血量 33%：再次切蜘蛛形态直到死亡。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 产卵 | `NEW:spawnEggs` | 在房间 4 处放蜘蛛卵 prop（8s 孵化 → 玛尔里幼蛛）。 |
| 毒箭齐射 | `NEW:poisonVolley` | ring 10 发绿色毒弹 50px/s，命中 dot。 |
| 吸取生命 | `NEW:drainLife` | 引导 3s 光束，每 .5s 吸 skd×.2 给首领回血；命中 4 次打断或断视线。 |
| 包裹之网 | `NEW:envelopingWeb` | [tel] circle@boss r50 T.8 → root 2s（无伤），随后接 charge。 |
| 冲锋 | `charge` | 现有 charge（冲向玩家）。 |
| 腐蚀毒药 | `NEW:corrosivePoison` | 接下来 6s 接触伤害附 dot。 |

**召唤物 / 同伴**

- **玛尔里幼蛛**（BT，×4，血 ×0.6）：成长：孵出后每 3s 体型 +10%、伤害 +15%（最多 5 次），早杀。

#### ZG-4 血领主曼多基尔（Bloodlord Mandokir）

- 关卡：3 间小怪房 + 首领房；精英：古拉巴什狂暴者；小怪：古拉巴什狂暴者、祖利安猛虎、古拉巴什掷斧者
- 血量 ×1.1 · 狂暴 70s · 技能轮换：NEW:threateningGaze → NEW:whirlwind → charge → NEW:mortalStrikeM
- **玩家提示**：头顶出现红眼时站着别动！先杀奥根会让他狂乱，建议先打曼多基尔。

**阶段**

- 血量 100%：开场骑乘奥根，奥根在 3s 后下坐骑与首领分开行动（formArt 切下马）。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 威胁凝视 | `NEW:threateningGaze` | [gaze] 2s 别动；违反 → 冲锋 + skd×3 + 曼多基尔“升级”（伤害 +10%，可叠）。 |
| 旋风斩 | `NEW:whirlwind` | [followAura] r34 3s 每 .5s skd×.4，首领移速 ×1.2。 |
| 冲锋 | `charge` | 现有 charge。 |
| 致死打击 | `NEW:mortalStrikeM` | [tel] circle@player r16 T.6 skd×1.4 + [curse:heal] 5s。 |
| 恐吓怒吼 | `roar` | 每 25s 穿插现有 roar。 |

**召唤物 / 同伴**

- **奥根**（BT，×1，血 ×4）：破甲：[stacks vuln]。；主人之怒：奥根死亡 → 曼多基尔永久狂乱（frenzy perm）。

#### ZG-5 疯狂之缘（Edge of Madness）

- 关卡：2 间小怪房 + 首领房；小怪：哈卡莱巫医、古拉巴什掷斧者
- 血量 ×1.0 · 狂暴 60s · 技能轮换：variant
- **玩家提示**：每次是 4 个巨魔之魂中的随机一个：看清是谁再决定打法。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 随机降临 | `variant` | 进入关卡时按种子从 4 名疯狂之缘首领中选 1（关卡信息里显示本次是谁）；每名用自己的 3 个机制轮换。 |

**变体 · 格里雷克**：化身（每 20s：体型 ×1.4、移速 ×1.3、锁定玩家追击 8s（fixate）。）；践踏（[tel] circle@boss r40 T.8 skd×1 knock。）；纠缠根须（[tel] circle@player r18 T1.0 root 2s。）

**变体 · 哈扎拉尔**：法力燃烧（G.skillT += 3。）；沉睡（[tel] circle@player r18 T1.2 → stun 2.5s（受击提前醒）。）；梦魇幻象（[mirrorImages] 召唤 3 个幻象（BT 型 20% 血），10s 后消失。）

**变体 · 雷纳塔基**：消失（b.hidden 3s 后出现在玩家身后：circle@player r16 T.5 skd×1.6（伏击）。）；千刃（ring 16 发短刀弹 60px/s。）；凿击（[tel] circle@player r14 T.6 stun 1.5s。）

**变体 · 乌苏雷**：闪电链（3 发快速闪电弹（eyebeam 样式，蓝色）。）；闪电云（在玩家位置生成移动雷云 pool（r22，8s，每 .5s skd×.25，缓慢追踪玩家）。）；强制闪电（[tel] beam@boss w8 T1.0 n=3 旋转 120°。）

#### ZG-6 高阶祭司塞卡尔（High Priest Thekal）

- 关卡：3 间小怪房 + 首领房；精英：祖利安猛虎；小怪：祖利安猛虎、古拉巴什狂暴者、哈卡莱巫医
- 血量 ×0.9 · 狂暴 80s · 技能轮换：NEW:thekalBash → NEW:silenceT
- **玩家提示**：三个人血量压到一起再同时击杀，否则会复活；P2 猛虎形态打断不了，注意力量之拳把你打飞。

**阶段**

- 血量 100%：P1 [multiBoss reviveWindow 10]：塞卡尔 + 洛卡恩 + 札斯，三者都要在 10s 内死亡，否则死者满血复活。
- 血量 0%：P2：三者全灭后塞卡尔以猛虎形态满血复活（hpMult .9），轮换 charge、NEW:forcePunch、NEW:summonTigers、NEW:frenzyThekal。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 重击 | `NEW:thekalBash` | [tel] circle@player r16 T.7 skd×1.2 stun .8。 |
| 沉默 | `NEW:silenceT` | [tel] circle@boss r50 T.8 → sealT 2。 |
| 冲锋 | `charge` | 现有。 |
| 力量之拳 | `NEW:forcePunch` | [tel] cone@boss ang.5 len40 T.6 skd×1.3 knock 70。 |
| 召唤祖利安猛虎 | `NEW:summonTigers` | 每次 2 只猛虎从墙边进入。 |
| 狂乱 | `NEW:frenzyThekal` | [frenzy] 8s，大招安抚。 |

**召唤物 / 同伴**

- **狂热者洛卡恩**（SA，×1，血 ×0.8）：闪电箭：蓝弹 dmg×1.2。；强效治疗：[castBar] 2.5s 治疗同伴 25%，命中 4 次打断。
- **狂热者札斯**（SK，×1，血 ×0.8）：致盲：[tel] circle@player r14 T.7 stun 1.5s。；暗影步：blink 到玩家身后。

#### ZG-7 加兹兰卡（Gahz'ranka）

- 关卡：2 间小怪房 + 首领房；小怪：古拉巴什掷斧者、拉扎什寡妇蛛
- 血量 ×1.0 · 狂暴 55s · 技能轮换：frostCone → NEW:geyser → NEW:gahzSlam
- **玩家提示**：喷泉会把你喷上天，看到脚下水圈就走开；冰霜吐息会拖慢技能。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 冰霜吐息 | `frostCone` | 现有 frostCone（slow），额外 G.skillT += 2（法力吸取）。 |
| 巨型喷泉 | `NEW:geyser` | [tel] circle@player r24 T1.2 skd×1.2 → 击飞（stun 1s + knock 30），n=2。 |
| 猛击 | `NEW:gahzSlam` | [tel] circle@boss r40 T.8 skd×1 knock 50。 |
| 水潭 | `env` | 首领房中央 rect 水潭：玩家在水中移速 ×.7；首领出生在水中。 |

#### ZG-8 高阶祭司娅尔罗（High Priestess Arlokk）

- 关卡：3 间小怪房 + 首领房；精英：祖利安猛虎；小怪：祖利安猛虎、古拉巴什掷斧者、古拉巴什蝙蝠骑士
- 血量 ×1.0 · 狂暴 70s · 技能轮换：NEW:markOfArlokk → NEW:vanish → NEW:whirlwindA → NEW:gouge
- **玩家提示**：先拆豹笼；被印记时猎豹全冲你，边退边打；她消失后会从背后出现。

**阶段**

- 血量 50%：黑豹形态（formArt）：移速 +30%，消失间隔缩短。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 召唤猎豹 | `env` | 豹笼 prop 每 8s 放出 1 只（见 env.props）。 |
| 娅尔罗印记 | `NEW:markOfArlokk` | 玩家头顶豹爪印记 10s：所有猎豹锁定玩家并 +50% 移速。 |
| 消失 | `NEW:vanish` | b.hidden+b.inv 6s，期间猎豹 ×2 刷新速度；结束时出现在玩家身后接 NEW:gouge。 |
| 旋风斩 | `NEW:whirlwindA` | [followAura] r30 2.5s。 |
| 凿击 | `NEW:gouge` | [tel] circle@player r14 T.6 skd×1 stun 1.2s。 |

**召唤物 / 同伴**

- **祖利安猎豹**（BT，持续刷新，血 ×1）：猛扑：[mobAbility pounce]；被印记时移速 ×1.5 锁定玩家。

#### ZG-9 妖术师金度（Jin'do the Hexxer）

- 关卡：3 间小怪房 + 首领房；精英：哈卡莱巫医；小怪：哈卡莱巫医、古拉巴什狂暴者、古拉巴什掷斧者
- 血量 ×1.0 · 狂暴 75s · 技能轮换：NEW:hex → NEW:healingWard → NEW:delusions → NEW:brainWash → NEW:pitTeleport
- **玩家提示**：图腾优先：治疗结界和洗脑图腾一出来就打掉；被传进坑里先清骷髅再爬出来。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 妖术 | `NEW:hex` | [tel] circle@player r14 T1.0 → stun 2s（青蛙）。 |
| 强力治疗结界 | `NEW:healingWard` | [totem] 在首领旁放 1 个，场上最多 1 个。 |
| 金度之惑 | `NEW:delusions` | [curse] 10s：同时刷 2 只金度之影追击玩家。 |
| 洗脑图腾 | `NEW:brainWash` | [totem] 放在房间随机处。 |
| 传送入坑 | `NEW:pitTeleport` | [teleportPlayer] 传到房间左下角 rect 坑（40×40，地面暗红），刷 3 只骷髅；坑边有 1 格出口阶梯，需走出去。 |

**召唤物 / 同伴**

- **强力治疗结界**（SL，持续刷新，血 ×1.2）：治疗：[totem] 每秒为金度回复 1.5%。
- **洗脑图腾**（SL，持续刷新，血 ×1）：洗脑：[totem] 每 6s 对 80px 内玩家 mindControl 3s。
- **金度之影**（BT，持续刷新，血 ×0.6）：幻影：只在玩家身负“金度之惑”时出现并攻击；诅咒结束即消失。
- **献祭骷髅**（SK，×3，血 ×0.6）：坑中守卫：玩家被传送入坑时出现。

#### ZG-10 哈卡（Hakkar）

- 关卡：4 间小怪房 + 首领房；精英：古拉巴什狂暴者；小怪：古拉巴什狂暴者、哈卡莱巫医、古拉巴什蝙蝠骑士、祖利安猛虎
- 血量 ×1.8 · 狂暴 100s · 技能轮换：NEW:corruptedBlood → NEW:causeInsanity → NEW:aspect → NEW:corruptedBlood
- **玩家提示**：血液虹吸前一定要站进哈卡之子留下的毒血池，否则会被吸走大量生命并给他回血。

**阶段**

- 25 秒：血液虹吸 每 30s 一次（第一次在 25s）。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 血液虹吸 | `NEW:bloodSiphon` | [siphon] 定时触发（不占轮换），读条前 5s 提示“快去吃毒血！”。 |
| 堕落之血 | `NEW:corruptedBlood` | [tel] circle@player r20 T.9 skd×.6 + dot 10s；若有小怪在 30px 内，小怪也被感染并在死亡时把 dot 传回给玩家。 |
| 致疯 | `NEW:causeInsanity` | [mindControl] 4s。 |
| 祭司化身 | `NEW:aspect` | 按顺序轮流（不随机）：耶克里克之影（circle@boss r60 沉默 2s）→ 温诺希斯之影（acidCone）→ 玛尔里之影（circle@player stun 1.5s + 拉近）→ 塞卡尔之影（frenzy 8s）→ 娅尔罗之影（vanish 2s 后背刺 circle@player r14 skd×1.5）。 |

**召唤物 / 同伴**

- **哈卡之子**（SK，×2，血 ×1.5）：毒性之血：死亡留下毒血池（r18，10s）；站入获得 G.poisonBloodT=10。每 15s 刷 2 只。


## 第 5 章 · 安其拉废墟（Ruins of Ahn'Qiraj，60 级，经典旧世（60））

### 环境

希利苏斯南端、甲虫之墙后的露天废墟：黄沙覆盖的砂岩柱廊与坍塌的其拉神殿，虫巢土丘与流沙坑，黑曜石方尖碑；终点是奥斯里安所在的水晶广场，场上散布能削弱他的黑曜石水晶，沙尘龙卷来回游荡。

- 瓦片集：无（需新做）
- 音乐：中东风格弦乐 + 沙漠风声 + 虫鸣窸窣

**地图机关**

- **流沙陷阱**：小怪房每间 1~2 个（不可破坏）：每 7s 微弱预警 1.2s 后 r20 → 致盲（curse:dmg 4s）。库林纳克斯会主动放置。
- **布鲁之卵**：布鲁关首领房 6 个（objectiveProps destroy）：被击碎 → r30 爆炸，布鲁在圈内受 8% 最大生命伤害，并孵出 2 只小虫。
- **黑曜石水晶**：奥斯里安关 3 个（objectiveProps activate）：站上 1s → 奥斯里安失去“奥斯里安之力”15s；用过熄灭，在其他位置亮起新的。
- **沙尘龙卷**：奥斯里安关 2 个移动 hazard（r14，速度 25 随机游走）：接触 skd×.6 + knock 30 + stun .8。
- **虫巢土丘**：小怪房装饰 + 每 10s 钻出 1 只札拉蜂巢黄蜂（可破坏，hp 40；复用现有 GRV 生怪逻辑）。

### 小怪

| 名称 | 基础行为 | 技能 |
|---|---|---|
| 其拉角斗士 | SK ×2血 | **践踏**：[mobAbility nova] r28 .8s dmg×1 knock 30。<br>**复仇**：成对出现；同伴死亡后 +50% 伤害与攻速（红光）。 |
| 札拉蜂巢毒刺者 | BT | **冲锋**：[mobAbility chargeLine] len80 w5 .6s，命中 stun .8。<br>**毒刺**：命中附带 dot 4s。 |
| 札拉蜂巢黄蜂 | BT | **蜂群**：成群 5 只，体型小、血低，移速 ×1.3；无扑击，贴身持续 dot。 |
| 阿努比萨斯守卫者 | SL ×4血 | **随机两项能力**：生成时按房间序号从 5 项中固定取 2：陨石（circle@player r26 T1.2 dmg×2）/瘟疫（nova r40 dot）/雷霆一击（nova r30 slow）/法术反射（bossShield reflect 6s）/召唤（2 只黄蜂）。头顶显示两种图标。<br>**狂暴**：血量 <10% 伤害 ×2。死亡不分裂。 |
| 黑曜石毁灭者 | SA ×2血 | **法力吸取**：[mobAbility beam] 直线光束 len110 w4 .8s 预警，命中 G.skillT += 2（技能冷却倒退）。<br>**满能冲击**：吸取 3 次后：自身 r40 .9s nova dmg×1.5，层数清零。 |
| 尖啸甲虫 | SA | **刺耳尖啸**：声波弹（音波贴图）70px/s dmg×.8，命中 fear .6s。<br>**甲壳**：受远程伤害 ×.8。 |

### 首领

#### AQ20-1 库林纳克斯（Kurinnaxx）

- 关卡：3 间小怪房 + 首领房；精英：其拉角斗士；小怪：札拉蜂巢毒刺者、札拉蜂巢黄蜂、尖啸甲虫、其拉角斗士
- 血量 ×1.0 · 狂暴 60s · 技能轮换：NEW:sandTrap → NEW:wideSlash → NEW:sandTrap → charge
- **玩家提示**：致死创伤会让你回不了血：别贴太久；脚下沙子在转就离开。

**阶段**

- 血量 30%：狂怒（frenzy perm）。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 致死创伤 | `NEW:mortalWound` | [stacks heal] 被动：每次接触伤害 +1 层。 |
| 沙陷阱 | `NEW:sandTrap` | 在玩家脚下放置流沙陷阱 prop（1.2s 后触发 r20 → 致盲 curse:dmg 4s）。 |
| 宽阔斩击 | `NEW:wideSlash` | [tel] cone@boss ang.8 len40 T.7 skd×1.2 stun .5。 |
| 冲锋 | `charge` | 现有。 |

#### AQ20-2 拉贾克斯将军（General Rajaxx）

- 关卡：2 间小怪房 + 首领房；小怪：其拉角斗士、尖啸甲虫
- 血量 ×1.1 · 狂暴 85s · 技能轮换：NEW:thundercrash → NEW:disarm → NEW:rajaxxCleave
- **玩家提示**：先打三波军团（优先上尉）；雷霆轰击会砍掉你一半血，提前留好血量。

**阶段**

- 血量 100%：[addPhase] 3 波其拉军团（原作 7 波压缩），每波 4 战士 + 2 针刺者 + 1 上尉（奎兹→图比德→德雷恩），清完一波 3s 后下一波；拉贾克斯在房顶喊话（无敌）。
- 血量 99%：三波后拉贾克斯亲自下场。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 雷霆轰击 | `NEW:thundercrash` | [decimate] p=.5 + knock 40，预警：首领举刀 1.2s + 全屏红边。每 18s。 |
| 缴械 | `NEW:disarm` | [tel] circle@player r16 T.8 → 3s 自动普攻停止（技能可用）。 |
| 顺劈斩 | `NEW:rajaxxCleave` | [tel] cone@boss ang.6 len36 T.6 skd×1.1。 |

**召唤物 / 同伴**

- **其拉战士**（SK，持续刷新，血 ×1.2）：雷霆一击：nova r24 slow。
- **虫群卫士针刺者**（SA，持续刷新，血 ×1）：针刺：3 连发针。
- **奎兹上尉**（SK，×1，血 ×3）：威慑怒吼：fear r60。
- **图比德上尉**（SK，×1，血 ×3）：攻击命令：该波所有小怪锁定玩家 +30% 移速。
- **德雷恩上尉**（SA，×1，血 ×3）：闪电云：移动雷云 pool。

#### AQ20-3 莫阿姆（Moam）

- 关卡：3 间小怪房 + 首领房；精英：阿努比萨斯守卫者；小怪：阿努比萨斯守卫者、黑曜石毁灭者、其拉角斗士
- 血量 ×1.2 · 狂暴 75s · 技能轮换：NEW:trample → NEW:arcaneDrain
- **玩家提示**：他的蓝条满了会全屏爆发：少放技能、多打本体；石化时立刻清掉法力恶魔。

**阶段**

- 30 秒：石化：每 30s（游戏内）变成石像 10s（inv，formArt），召唤 3 只法力恶魔；石化期间能量快速回满 → 若未打掉恶魔，复原时直接奥术爆发。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 能量 | `NEW:moamEnergy` | [energyBar] 30s 涨满，玩家每放一次技能 +5（他吸你的法力）；满了 → 奥术爆发：全屏 skd×(1.5+能量/50)，立即清零。 |
| 践踏 | `NEW:trample` | [tel] circle@boss r36 T.8 skd×1 knock 30。 |
| 法力吸取 | `NEW:arcaneDrain` | [tel] beam@boss→player w6 T.8，命中能量 +15、G.skillT += 2。 |

**召唤物 / 同伴**

- **法力恶魔**（SA，×3，血 ×1.2）：奥术爆炸：nova r28 .6s dmg×1。；法力燃烧：G.skillT += 1.5，弹道。

#### AQ20-4 吞咽者布鲁（Buru the Gorger）

- 关卡：3 间小怪房 + 首领房；精英：其拉角斗士；小怪：札拉蜂巢毒刺者、尖啸甲虫、其拉角斗士
- 血量 ×1.2 · 狂暴 80s · 技能轮换：NEW:fixateBuru → NEW:dismember
- **玩家提示**：他追着你走：把他引到卵旁边打碎卵，爆炸才是主要伤害；20% 破壳后全力输出。

**阶段**

- 血量 20%：破壳（formArt）：受伤恢复正常、移速 +40%、爬行瘟疫（全屏 dot 每秒 skd×.1，逐渐 +.02）。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 盯住 | `NEW:fixateBuru` | 首领只追玩家（移速 ×.7，大体型），甲壳：玩家直接伤害 ×.3（P1）。 |
| 肢解 | `NEW:dismember` | 接触伤害叠 dot（stacks vuln 也可），每次 +1 层。 |
| 布鲁之卵 | `objectiveProps` | [objectiveProps destroy] 6 个卵，击碎时 r30 爆炸：布鲁在圈内受 8% 最大生命伤害；技巧：把他引到卵旁再打碎。 |

**召唤物 / 同伴**

- **布鲁幼虫**（BT，持续刷新，血 ×0.5）：扑咬：蛋爆炸时孵出 2 只。

#### AQ20-5 狩猎者阿亚米斯（Ayamiss the Hunter）

- 关卡：3 间小怪房 + 首领房；精英：札拉蜂巢毒刺者；小怪：札拉蜂巢黄蜂、札拉蜂巢毒刺者、黑曜石毁灭者
- 血量 ×1.1 · 狂暴 75s · 技能轮换：NEW:stingerSpray → NEW:paralyze → NEW:poisonStinger
- **玩家提示**：P1 她在天上，近战职业多用技能；被麻痹时立刻攻击爬过来的幼虫。

**阶段**

- 血量 100%：P1 飞行（formArt）：悬停在房顶，近战伤害 ×.3（打不到），远程正常。
- 血量 70%：P2 落地：近战正常，狂乱（frenzy perm 但较弱：移速 ×1.2），轮换加入 charge。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 毒刺喷射 | `NEW:stingerSpray` | acidCone（cone + dot）。 |
| 麻痹 | `NEW:paralyze` | [teleportPlayer] 把玩家放到中央祭坛，root 6s；同时刷 1 只幼虫从最远边爬向祭坛（速度 20）；玩家可原地攻击它（远程/技能），杀死则提前解除。 |
| 毒刺 | `NEW:poisonStinger` | 3 连发毒弹 dmg×.8 dot。 |

**召唤物 / 同伴**

- **札拉蜂巢虫群**（BT，×4，血 ×0.5）：蜂群：每 12s 4 只。
- **札拉蜂巢幼虫**（SL，×1，血 ×1）：献祭：从房间边缘爬向祭坛（玩家被麻痹处），到达 → 玩家受 skd×3。

#### AQ20-6 无疤者奥斯里安（Ossirian the Unscarred）

- 关卡：3 间小怪房 + 首领房；精英：阿努比萨斯守卫者；小怪：阿努比萨斯守卫者、其拉角斗士、黑曜石毁灭者、尖啸甲虫
- 血量 ×1.5 · 狂暴 90s · 技能轮换：NEW:warStompO → NEW:envelopingWinds → NEW:curseOfTongues
- **玩家提示**：他平时几乎不掉血：先踩亮着的水晶让他虚弱，再在 15 秒内全力输出，循环直到击杀。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 奥斯里安之力 | `NEW:strengthOfOssirian` | [bossShield reduce] 常驻：受伤 ×.15、伤害 +30%；激活水晶后获得“弱点”15s 失去该效果。 |
| 黑曜石水晶 | `objectiveProps` | [objectiveProps activate] 3 个，同时只亮 1 个；小地图标黄。 |
| 沙尘龙卷 | `env` | 2 个游走龙卷（见 env.props）。 |
| 战争践踏 | `NEW:warStompO` | [tel] circle@boss r40 T.8 skd×1 stun .8。 |
| 包围之风 | `NEW:envelopingWinds` | [tel] circle@player r18 T1.0 stun 2s。 |
| 语言诅咒 | `NEW:curseOfTongues` | [curse:cd] 10s。 |


## 第 6 章 · 安其拉神殿（Temple of Ahn'Qiraj，60 级，经典旧世（60））

### 环境

沉睡的古神克苏恩的地下神殿：入口是金色其拉建筑与巨大雕像，越往深处越是有机的虫巢——紫色与青绿色的血肉墙壁、搏动的脉络、粘液池；双子皇帝的金色王座厅；最底层是克苏恩的巨眼大厅与其胃部。

- 瓦片集：tiles_c4.png（虚空神殿，近似；需补金色其拉建筑元素）
- 音乐：古神低语（反转人声 + 低频心跳），克苏恩 P2 心跳加速

**地图机关**

- **虫洞**：范克瑞斯关 3 个（不可破坏）：每 12s 轮流钻出范克瑞斯之子；缠绕时的落点。
- **圣甲虫土堆**：奥罗 P2 刷出 4 个（可破坏 hp 50）：每 5s 钻出 2 只圣甲虫（BT 30% 血）。
- **眼球触须坑**：克苏恩关地面 8 个固定点：眼球触须从此处冒出（装饰 + 出生点）。
- **胃部出口**：胃区中央的上升气流圈：站上 1s 被吐回大厅（击杀两只血肉触须后出现）。

### 小怪

| 名称 | 基础行为 | 技能 |
|---|---|---|
| 阿努比萨斯哨兵 | SK ×3血 | **哨兵能力**：3 只一组，每只按顺序拿 1 种：法术反射（自身 reflect）/雷霆一击（nova slow）/冲击波（nova knock）/暗影风暴（rangedPunish D60）。<br>**能力转移**：一只死亡时，存活哨兵获得它的能力（头顶图标 +1），所以最后一只最强。 |
| 维克尼斯毒刺者 | BT | **冲锋**：[mobAbility chargeLine] len90 w5 .6s。<br>**维克尼斯催化剂**：[stacks vuln] 命中 +1 层；≥3 层时下一次冲锋附带 stun 1.5s。 |
| 其拉鞭笞者 | SK | **旋风斩**：[followAura] r24 2s 每 .5s dmg×.5，每 8s。<br>**击退**：[tel] cone@self ang.6 len26 T.5 knock 40。 |
| 阿努比萨斯防御者 | SL ×5血 | **暗影风暴**：[rangedPunish] 玩家距离 >60 时每 1s 一发暗影弹 dmg×1.2（逼近身）。<br>**陨石 / 召唤**：按房间序号固定取一：陨石（circle@player r26 T1.2 dmg×2）或召唤 2 只哨兵小怪（BT）。<br>**自爆**：血量 <10%：[castBar] 3s 后 nova r60 dmg×3，可打断（6 次命中）。死亡不分裂。 |
| 其拉洗脑者 | SA | **精神鞭笞**：[mobAbility beam] 引导 2s 紫色光束，每 .5s dmg×.3 + slow。<br>**心灵控制**：[mindControl] 2.5s，冷却 14s，预警紫圈 1.0s。 |
| 黑曜石抹除者 | SA ×2血 | **法力吸取**：[mobAbility beam] len110 .8s，命中 G.skillT += 2，自身充能 +1。<br>**冲击爆炸**：充能 3 层 → 自身 r40 .9s dmg×1.5 stun 1s。 |

### 首领

#### AQ40-1 预言者斯克拉姆（The Prophet Skeram）

- 关卡：3 间小怪房 + 首领房；精英：阿努比萨斯哨兵；小怪：阿努比萨斯哨兵、其拉洗脑者、维克尼斯毒刺者
- 血量 ×1.1 · 狂暴 70s · 技能轮换：NEW:arcaneExplosionS → NEW:trueFulfillment → blink → NEW:earthShock
- **玩家提示**：分身血很少，但真身会随机换位：认准头顶读条打断奥术爆炸。

**阶段**

- 血量 75%：分裂 2 个幻象，真身随机换位。
- 血量 50%：再次分裂。
- 血量 25%：再次分裂。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 奥术爆炸 | `NEW:arcaneExplosionS` | [castBar] 1.2s → circle@boss r50 skd×1.2，命中 4 次打断。 |
| 真实之满 | `NEW:trueFulfillment` | [mindControl] 4s，预警紫圈 1.0s。 |
| 闪现 | `blink` | 现有 blink（随机位置而不是玩家脚下）。 |
| 地震术 | `NEW:earthShock` | [rangedPunish] D=50：远离时快弹 skd×1.4。 |

**召唤物 / 同伴**

- **斯克拉姆幻象**（SA，×2，血 ×0.15）：同本体：[mirrorImages] 同技能，伤害 ×.4。

#### AQ40-2 安其拉三宝（Silithid Royalty (Bug Trio)）

- 关卡：3 间小怪房 + 首领房；精英：其拉鞭笞者；小怪：其拉鞭笞者、维克尼斯毒刺者、黑曜石抹除者
- 血量 ×1.0 · 狂暴 90s · 技能轮换：multiBoss
- **玩家提示**：三只一起上：先打断并击杀亚尔基公主，最后再杀维姆（他死了另外两只会狂暴）。

**阶段**

- 血量 100%：[multiBoss] 三只同时出场，各自独立血量与技能轮换；全部死亡过关。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 三宝 | `multiBoss` | [multiBoss onDeath] 维姆死亡 → 其余狂乱；克里死亡 → 毒云；亚尔基死亡 → 后代。推荐顺序：亚尔基 → 克里 → 维姆。 |

**召唤物 / 同伴**

- **克里勋爵**（SK，×1，血 ×0.6）：毒箭齐射：ring 8 发毒弹 + dot。；雷霆一击：nova r36 slow。；剧毒云雾：死亡留下 r40 毒云 20s（房间中央）。
- **维姆**（SL，×1，血 ×0.6）：冲锋：现有 charge。；击退：cone knock 60。；复仇：维姆死亡 → 另外两只永久狂乱。
- **亚尔基公主**（SA，×1，血 ×0.5）：恐惧：roar。；强效治疗：[castBar] 2s 治疗同伴 15%，命中 5 次打断。；后代：死亡时生出 4 只亚尔基后代（BT 30% 血）。

#### AQ40-3 沙尔图拉（Battleguard Sartura）

- 关卡：3 间小怪房 + 首领房；精英：其拉鞭笞者；小怪：其拉鞭笞者、阿努比萨斯哨兵、其拉洗脑者
- 血量 ×1.1 · 狂暴 75s · 技能轮换：NEW:whirlwindS → NEW:sarturaCleave
- **玩家提示**：四个人都会旋风斩：看清谁在转就离谁远一点，先清掉三名卫士。

**阶段**

- 血量 25%：狂怒（frenzy perm）。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 旋风斩 | `NEW:whirlwindS` | [followAura] r36 4s 每 .5s skd×.45；期间每 .7s 随机换方向移动（不追玩家）。 |
| 顺劈斩 | `NEW:sarturaCleave` | [tel] cone@boss ang.6 len36 T.6 skd×1.1。 |

**召唤物 / 同伴**

- **沙尔图拉的皇家卫士**（SK，×3，血 ×2）：旋风斩：[followAura] r28 3s，每 8s，转向随机。；击退：cone knock 40。

#### AQ40-4 顽强的范克瑞斯（Fankriss the Unyielding）

- 关卡：3 间小怪房 + 首领房；精英：维克尼斯毒刺者；小怪：维克尼斯毒刺者、其拉鞭笞者、黑曜石抹除者
- 血量 ×1.2 · 狂暴 75s · 技能轮换：NEW:summonWorm → NEW:entangle → NEW:fankrissCleave
- **玩家提示**：虫子出生 15 秒后会狂暴，必须马上击杀；致死创伤叠高时拉开距离。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 致死创伤 | `NEW:mortalWoundF` | [stacks heal] 被动。 |
| 召唤虫子 | `NEW:summonWorm` | 从 3 个虫洞之一钻出 1 只范克瑞斯之子。 |
| 缠绕 | `NEW:entangle` | [teleportPlayer] 传到某个虫洞旁 root 2s，刷 3 只孵化者。 |
| 顺劈斩 | `NEW:fankrissCleave` | [tel] cone@boss ang.6 len36 T.6 skd×1.2。 |

**召唤物 / 同伴**

- **范克瑞斯之子**（BT，持续刷新，血 ×1.5）：激怒：出生 15s 后伤害 ×3、体型变红；快杀。
- **维克尼斯孵化者**（BT，持续刷新，血 ×0.4）：围攻：缠绕落点刷 3 只。

#### AQ40-5 维希度斯（Viscidus）

- 关卡：3 间小怪房 + 首领房；精英：阿努比萨斯防御者；小怪：阿努比萨斯防御者、维克尼斯毒刺者、其拉洗脑者
- 血量 ×1.0 · 狂暴 100s · 技能轮换：NEW:poisonVolleyV → NEW:toxin → NEW:poisonShock
- **玩家提示**：打他不掉血：快速连续攻击把他冻住，再打碎成小球，杀掉的小球才算伤害。

**阶段**

- 血量 100%：[shatter] 整场循环：命中计数 → 冻结 → 碎裂 → 粘液团；首领真实血量只随击杀粘液团下降。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 冻结与碎裂 | `NEW:shatter` | [shatter] 见引擎说明；计数显示在血条下（“冻结 17/30”）。 |
| 毒箭齐射 | `NEW:poisonVolleyV` | ring 12 发毒弹 dot。 |
| 毒素 | `NEW:toxin` | [tel] circle@random r20 n=3 T1.0 after:'pool' 毒池 8s。 |
| 毒性震击 | `NEW:poisonShock` | [tel] circle@boss r34 T.7 skd×.9 dot。 |

**召唤物 / 同伴**

- **维希度斯之球**（SL，×8，血 ×0.4）：回归：向房间中心缓慢爬行（速度 15），到达后并入首领。

#### AQ40-6 哈霍兰公主（Princess Huhuran）

- 关卡：3 间小怪房 + 首领房；精英：维克尼斯毒刺者；小怪：维克尼斯毒刺者、阿努比萨斯哨兵、黑曜石抹除者
- 血量 ×1.2 · 狂暴 75s · 技能轮换：NEW:wyvernSting → NEW:acidSpit → NEW:noxiousPoison → NEW:frenzyHuhuran
- **玩家提示**：大招留着安抚狂乱；30% 后是毒箭风暴，把爆发全留到这时。

**阶段**

- 血量 30%：狂暴：每 2s 一次毒箭齐射（ring 12 dot），伤害 ×1.5，冲刺阶段。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 翼龙钉刺 | `NEW:wyvernSting` | [tel] circle@player r20 T1.0 → stun 3s（受击提前醒，醒时受 skd×1.5）。 |
| 酸性喷射 | `NEW:acidSpit` | [stacks vuln] cone@boss len40 T.5，命中 +1 层。 |
| 毒性之箭 | `NEW:noxiousPoison` | [tel] circle@boss r40 T.8 → sealT 3 + dot。 |
| 狂乱 | `NEW:frenzyHuhuran` | [frenzy] 8s，大招安抚。 |

#### AQ40-7 双子皇帝（Twin Emperors）

- 关卡：3 间小怪房 + 首领房；精英：阿努比萨斯防御者；小怪：阿努比萨斯防御者、阿努比萨斯哨兵、其拉洗脑者
- 血量 ×1.0 · 狂暴 100s · 技能轮换：multiBoss
- **玩家提示**：近战职业打维克尼拉斯打不动，要去打维克洛尔；远程反之。别让两人靠在一起，他们会互相治疗。

**阶段**

- 血量 100%：[multiBoss sharedHp] 共用一条血；每 20s 双子传送（互换位置，portal 特效，传送后 1s 不动）。两者距离 <40px 时每秒共同回血 2%（“治疗兄弟”）。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 双子传送 | `NEW:twinTeleport` | 互换坐标；玩家需要跟着换目标（近战打法师皇帝、远程打战士皇帝）。 |
| 治疗兄弟 | `NEW:healBrother` | 距离检测，回血时两人之间画金色连线。 |

**召唤物 / 同伴**

- **维克洛尔大帝**（SA，×1，血 ×0.9）：暗影箭：frostbolt 样式紫弹 skd×1.3。；暴风雪：移动冰池 r24 追踪玩家 6s slow。；奥术爆发：玩家 <40px：nova r40 knock 50。；物理免疫：近战伤害 ×.2。
- **维克尼拉斯大帝**（SK，×1，血 ×0.9）：上勾拳：cone knock 60 skd×1.2。；失衡打击：[stacks vuln]。；变异虫子：每 15s 让 1 只场上小虫变为爆炸甲虫（贴身 r24 爆炸）。；魔法免疫：远程/技能伤害 ×.2。

#### AQ40-8 奥罗（Ouro）

- 关卡：3 间小怪房 + 首领房；精英：阿努比萨斯防御者；小怪：维克尼斯毒刺者、其拉鞭笞者、阿努比萨斯防御者
- 血量 ×1.5 · 狂暴 90s · 技能轮换：NEW:sandBlast → NEW:sweep → NEW:burrowOuro
- **玩家提示**：别站在他正面（沙尘爆裂）；远离太久他会钻地追你。20% 后打掉土堆。

**阶段**

- 血量 20%：狂暴：不再潜地，刷 4 个圣甲虫土堆 prop，伤害 +50%，地面每 3s 随机落石（tel circle@random r20 n=3）。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 沙尘爆裂 | `NEW:sandBlast` | [tel] cone@boss ang.7 len150 T1.0 skd×1.6 stun 1s。 |
| 横扫 | `NEW:sweep` | [tel] circle@boss r40 T.8 skd×1 knock 60。 |
| 潜地 | `NEW:burrowOuro` | [burrow] 每 25s 或玩家离开近战范围 6s 触发；钻出时刷 4 只圣甲虫。 |

**召唤物 / 同伴**

- **圣甲虫**（BT，持续刷新，血 ×0.3）：围攻：潜地结束与土堆刷出。

#### AQ40-9 克苏恩（C'Thun）

- 关卡：4 间小怪房 + 首领房；精英：阿努比萨斯防御者；小怪：阿努比萨斯哨兵、阿努比萨斯防御者、其拉洗脑者、黑曜石抹除者
- 血量 ×2.0 · 狂暴 120s · 技能轮换：eyebeam → sweep → claw → NEW:eyeTentacles
- **玩家提示**：P1 别和触须站一条线；P2 本体无敌，被吞进胃里后杀掉两只血肉触须，出来后趁虚弱全力输出。

**阶段**

- 血量 100%：P1 眼球：首领 spd 0 固定房间中央，轮换 eyebeam / sweep（黑暗闪耀，旋转光束） / claw / 眼球触须（8 只环形）。
- 血量 1%：P2 本体：眼球死亡后首领以本体满血复活（formArt），常驻 b.inv；每 30s 交替刷 巨型巨爪触须 / 巨型眼球触须，每 10s 刷眼球触须 4 只；[stomach] 每 15s 吞下玩家。只有在胃里击杀两只血肉触须后的虚弱 15s 内才能伤害本体。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 眼棱 | `eyebeam` | 现有 eyebeam（3 连发，绿色），改为命中玩家后弹向最近触须再弹回（视觉）。 |
| 黑暗闪耀 | `sweep` | 现有 sweep（旋转光束）。 |
| 巨爪触须 | `claw` | 现有 claw：在玩家脚下钻出巨爪触须。 |
| 眼球触须 | `NEW:eyeTentacles` | 在 8 个触须坑同时钻出眼球触须（见 adds）。 |
| 胃 | `NEW:stomach` | [stomach]（P2）。 |

**召唤物 / 同伴**

- **眼球触须**（SA，×8，血 ×0.5）：精神鞭笞：不动；每 2s 向玩家射紫色光束 line .8s dmg×.5。
- **巨爪触须**（SL，×1，血 ×2）：重击：不动；nova r26 knock。
- **巨型眼球触须**（SA，×1，血 ×4）：凝视：P2：每 1.5s 光束 dmg×1。
- **巨型巨爪触须**（SL，×1，血 ×5）：重击：P2：nova r36 knock，玩家远离时会钻地换位。
- **血肉触须**（SL，×2，血 ×1.5）：不动：只在胃里出现。


## 第 7 章 · 纳克萨玛斯（Naxxramas (Level 60)，60 级，经典旧世（60））

### 环境

悬浮在东瘟疫之地斯坦索姆上空的天灾浮空要塞（60 级原版）。四个区各有风格：蜘蛛区（蛛网、虫茧、腐烂石板）、瘟疫区（绿色瘟疫水渠、喷发裂隙、腐烂花园）、军事区（铁质训练场、死亡骑士武器架、灵魂之门）、构造区（屠宰台、缝合尸块、软泥管道、特斯拉线圈）；最后是寒冷的冰霜巨龙巢穴（萨菲隆）与克尔苏加德的王座间。

- 瓦片集：tiles_c3.png（亡者要塞，近似可复用为通用大厅）
- 音乐：低沉合唱 + 钟声 + 冰冷的弦乐，克尔苏加德关加入管风琴

**地图机关**

- **蛛网**：蜘蛛区地面 rect 区域：进入移速 ×.5（不伤害）。
- **瘟疫裂隙**：希尔盖关：地面四区的喷发口（视觉，伤害走 dance 的 rect 预警）。
- **墓碑**：军事区/瘟疫区小怪房（现有 GRV：每 5.5s 爬出骷髅，可破坏）。
- **特斯拉线圈**：塔迪乌斯关两侧各 1（不可破坏）：P1 连着斯塔拉格/费尔根；两者之一离线圈太远（>60px）时线圈向玩家放电 skd×.8。
- **冰块**：萨菲隆关：寒冰箭落点生成（见 losBreath），可挡视线。
- **灵魂之门**：戈提克关中央分界线：P1 关闭（两半互不相通），P1 后半打开。

### 小怪

| 名称 | 基础行为 | 技能 |
|---|---|---|
| 腐肉织网者·蜘蛛区 | SA | **蛛网喷射**：[mobAbility aoeAtPlayer] r20 T1.0 → root 1.5s。<br>**毒箭**：绿色毒弹 dmg×1 dot。 |
| 感染食尸鬼·瘟疫区 | BT | **腐肉扑击**：[mobAbility pounce]，命中 [stacks heal] +1。<br>**狂乱**：血量 <30% 攻速/移速 +50%。 |
| 死亡骑士队长·军事区 | SK ×2血 | **旋风斩**：[followAura] r24 2s，每 8s。<br>**瘟疫打击**：近身命中 dot 6s。<br>**邪恶光环**：40px 内友军伤害 +20%（脚下暗绿光环）。 |
| 大墓地侍僧·军事区 | SA | **暗影箭齐射**：3 发扇形紫弹 dmg×.9。<br>**奥术爆炸**：玩家 <30px：nova r30 .6s dmg×1。 |
| 缝合傀儡·构造区 | SL ×3血 | **顺劈斩**：[tel] cone@self ang.6 len30 T.6 dmg×1.2。<br>**战争践踏**：[mobAbility nova] r30 .9s stun .8。<br>**疾病云雾**：自身 r20 持续 dot 光环。死亡不分裂。 |
| 石皮石像鬼·冰霜巨龙巢穴 | SA | **酸液齐射**：3 发绿色酸弹 dot。<br>**石肤**：血量 <30%：[castBar] 2s 后石化 4s（inv）并回 20%；命中 3 次打断。 |

### 首领

#### NAXX-1 阿努布雷坎（Anub'Rekhan）

- 关卡：4 间小怪房 + 首领房；精英：腐肉织网者；小怪：腐肉织网者、感染食尸鬼、缝合傀儡
- 血量 ×1.1 · 狂暴 70s · 技能轮换：NEW:impale → NEW:locustSwarm → NEW:impale
- 区域：蜘蛛区
- **玩家提示**：虫群风暴时他会慢慢追你：绕着房间风筝，别被卫士卡住。

**阶段**

- 血量 100%：开场 2 名地穴卫士；虫群风暴结束时再来 1 名。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 穿刺 | `NEW:impale` | [tel] beam@boss→player w8 T1.0 skd×1.4，命中 stun .8（被顶上天）。 |
| 虫群风暴 | `NEW:locustSwarm` | [followAura] r40 6s 每 .5s skd×.35 + slow，首领移速 ×.5（追着你），玩家需要绕圈风筝。 |

**召唤物 / 同伴**

- **地穴卫士**（SK，×2，血 ×3）：顺劈：cone dmg×1.2。；酸液喷吐：circle@player r16 dot。
- **腐尸甲虫**（BT，持续刷新，血 ×0.3）：尸爆：任何小怪/卫士死亡时从尸体爬出 3 只。

#### NAXX-2 黑女巫法琳娜（Grand Widow Faerlina）

- 关卡：3 间小怪房 + 首领房；精英：腐肉织网者；小怪：腐肉织网者、大墓地侍僧、感染食尸鬼
- 血量 ×1.0 · 狂暴 70s · 技能轮换：NEW:poisonBoltVolley → NEW:rainOfFireF → NEW:frenzyFaerlina
- 区域：蜘蛛区
- **玩家提示**：把崇拜者留着：她狂乱时，在她身边杀掉一个崇拜者就能解除狂乱。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 毒箭齐射 | `NEW:poisonBoltVolley` | volley 改绿色毒弹 + dot。 |
| 火焰之雨 | `NEW:rainOfFireF` | [tel] circle@player r24 T1.0 n=3 after:'pool' 火池 4s。 |
| 狂乱 | `NEW:frenzyFaerlina` | [frenzy] 每 25s，不可被大招安抚，只能用“崇拜者在她身边死亡”解除。 |

**召唤物 / 同伴**

- **纳克萨玛斯崇拜者**（SK，×4，血 ×1）：火球：弱火球。；黑女巫的拥抱：在首领 30px 内死亡 → 解除首领狂乱并沉默首领 6s。
- **纳克萨玛斯追随者**（SK，×2，血 ×2）：沉默冲锋：chargeLine，命中 sealT 2。

#### NAXX-3 迈克斯纳（Maexxna）

- 关卡：3 间小怪房 + 首领房；精英：腐肉织网者；小怪：腐肉织网者、感染食尸鬼
- 血量 ×1.2 · 狂暴 75s · 技能轮换：NEW:webWrap → NEW:poisonShockM → NEW:necroticPoison → NEW:webSpray
- 区域：蜘蛛区
- **玩家提示**：蛛网喷射前血要满（全屏无法躲）；被裹在墙上不要慌，3 秒后自动挣脱。

**阶段**

- 血量 30%：狂乱（frenzy perm）。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 蛛网裹体 | `NEW:webWrap` | [webWrap]。 |
| 蛛网喷射 | `NEW:webSpray` | 全屏 rect 预警 1.5s（白色），命中 stun 2s + skd×.6（无法躲，提示“准备！”）。每 30s。 |
| 毒性震击 | `NEW:poisonShockM` | [tel] cone@boss ang.6 len40 T.6 skd×1 dot。 |
| 坏死毒药 | `NEW:necroticPoison` | [curse:heal] 回复 ×.1，8s。 |

**召唤物 / 同伴**

- **迈克斯纳蜘蛛宝宝**（BT，×6，血 ×0.4）：围攻：每 30s 从四壁涌出 6 只。

#### NAXX-4 瘟疫使者诺斯（Noth the Plaguebringer）

- 关卡：3 间小怪房 + 首领房；精英：感染食尸鬼；小怪：感染食尸鬼、大墓地侍僧、缝合傀儡
- 血量 ×1.0 · 狂暴 75s · 技能轮换：NEW:curseOfPlague → blink → NEW:summonSkeletons
- 区域：瘟疫区
- **玩家提示**：他会定时上阳台召唤一大批亡灵：先清守护者，诅咒倒计时结束前补好血。

**阶段**

- 35 秒：每 35s 传送到阳台 15s（addPhase：无敌，刷 2 波瘟疫守护者/战士），之后回来。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 瘟疫使者的诅咒 | `NEW:curseOfPlague` | [curse:delayed] 8s 后 skd×1.5（原作不驱散会爆发伤害）。 |
| 闪现 | `blink` | 现有 blink（随机位置）。 |
| 召唤骷髅 | `NEW:summonSkeletons` | 四角各 1 只瘟疫战士。 |

**召唤物 / 同伴**

- **瘟疫战士**（SK，×3，血 ×1.2）：顺劈：cone。
- **瘟疫守护者**（SA，×2，血 ×1.5）：奥术爆炸：nova r30。；闪现：blink。

#### NAXX-5 肮脏的希尔盖（Heigan the Unclean）

- 关卡：3 间小怪房 + 首领房；精英：感染食尸鬼；小怪：感染食尸鬼、腐肉织网者、缝合傀儡
- 血量 ×1.1 · 狂暴 80s · 技能轮换：dance → NEW:decrepitFever → NEW:spellDisruption → dance
- 区域：瘟疫区
- **玩家提示**：跟着安全区跳舞：安全区固定从一头走到另一头再回来，记住节奏。

**阶段**

- 40 秒：每 40s 传送到平台（现有 platform：无敌 11s 快速舞蹈 + 瘟疫云），之后回到地面。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 舞蹈（瘟疫喷发） | `dance` | 现有 dance：房间分 4 区，轮流 3 区喷发、1 区安全，安全区按 1→2→3→4→3→2 顺序移动（原作固定节奏，改掉现在的随机 +1/+3）。 |
| 衰弱热病 | `NEW:decrepitFever` | [tel] circle@boss r50 T.8 dot 8s。 |
| 法术干扰 | `NEW:spellDisruption` | [curse:cd] 6s。 |
| 快速舞蹈 | `platform` | 现有 platform。 |

#### NAXX-6 洛欧塞布（Loatheb）

- 关卡：3 间小怪房 + 首领房；精英：缝合傀儡；小怪：缝合傀儡、感染食尸鬼、大墓地侍僧
- 血量 ×1.3 · 狂暴 90s · 技能轮换：doom → spores → aura
- 区域：瘟疫区
- **玩家提示**：治疗只在很短的窗口里有效；击破孢子拿暴击，越拖厄运越痛。

**阶段**

- 60 秒：必然的厄运间隔从 12s 缩短到 6s（原作 5 分钟后）。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 必然的厄运 | `doom` | 现有 doom（伤害随次数递增）；10s 预警圈画在玩家身上（目前直接扣血，需补预警）。 |
| 坏死光环 | `aura` | 现有 aura：每 20s 中有 17s 无法回复（原作只有 3s 治疗窗口）；屏幕边缘显示“治疗窗口”。 |
| 孢子 | `spores` | 现有 spores：击破获得 8s 暴击 +50%。 |

#### NAXX-7 教官拉苏维奥斯（Instructor Razuvious）

- 关卡：3 间小怪房 + 首领房；精英：死亡骑士队长；小怪：死亡骑士队长、大墓地侍僧、感染食尸鬼
- 血量 ×1.2 · 狂暴 75s · 技能轮换：NEW:disruptingShout → NEW:unbalancingStrike → NEW:disruptingShout
- 区域：军事区
- **玩家提示**：站在学员身边才能扛住干扰怒吼；学员会被他打死，两个轮流用。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 干扰怒吼 | `NEW:disruptingShout` | [castBar] 1.5s（不可打断）→ circle@boss r200 skd×1.6，safe: 存活学员 r22。 |
| 失衡打击 | `NEW:unbalancingStrike` | [tel] circle@player r16 T.6 skd×1.8 + [stacks vuln]。 |

**召唤物 / 同伴**

- **死亡骑士学员**（SK，×2，血 ×3）：盾墙：[safeSpots] 玩家在学员 22px 内时，干扰怒吼对玩家无效（safeSpots）。；嘲讽：玩家在学员 22px 内时首领改追学员（攻击学员）。学员会被打死，需轮换使用两名。

#### NAXX-8 收割者戈提克（Gothik the Harvester）

- 关卡：3 间小怪房 + 首领房；精英：死亡骑士队长；小怪：死亡骑士队长、大墓地侍僧
- 血量 ×1.0 · 狂暴 85s · 技能轮换：NEW:shadowBoltG → NEW:harvestSoul → blink
- 区域：军事区
- **玩家提示**：杀死的亡灵会在另一半场变成幽灵再来一次：控制清怪节奏，别让两边同时涌过来。

**阶段**

- 血量 100%：P1 [addPhase] 40s：戈提克在阳台无敌；房间被灵魂之门分为左右两半，左半（活人区）按 学徒×3→死亡骑士×2→骑兵×1 波次刷新，死亡后在右半（亡灵区）化为幽灵；20s 后门打开，幽灵会越过来。P1 结束他亲自下场。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 暗影箭 | `NEW:shadowBoltG` | frostbolt 样式紫弹 skd×1.4。 |
| 收割灵魂 | `NEW:harvestSoul` | [stacks dmg] 每 15s 永久 +1 层（伤害 −8%/层），逼你速战。 |
| 左右传送 | `blink` | 每 20s 传送到另一半场。 |

**召唤物 / 同伴**

- **冷酷的学徒**（SK，持续刷新，血 ×1）：死后化灵：死亡时在另一半场生成幽灵学徒（半透明，同能力）。
- **冷酷的死亡骑士**（SK，持续刷新，血 ×2）：冲击波：nova knock。；死后化灵：同上。
- **冷酷的骑兵**（BT，持续刷新，血 ×3）：冲锋：chargeLine。；死后化灵：同上。

#### NAXX-9 天启四骑士（The Four Horsemen）

- 关卡：4 间小怪房 + 首领房；精英：死亡骑士队长；小怪：死亡骑士队长、大墓地侍僧、石皮石像鬼
- 血量 ×1.0 · 狂暴 120s · 技能轮换：multiBoss
- 区域：军事区
- **玩家提示**：印记会越叠越痛：在一个角落打几下就换到下一个角落，别在同一个骑士身边待太久。

**阶段**

- 血量 100%：[multiBoss] 四人分别固定在房间四角（不移动），各自技能轮换；全部击杀过关。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 印记 | `NEW:marks` | [marks] 每 12s 结算。逼玩家沿四角轮换（像原作坦克换位）。 |
| 四骑士 | `multiBoss` | 顶部四条血条。 |

**召唤物 / 同伴**

- **库尔塔兹领主**（SK，×1，血 ×0.55）：陨石：circle@player r30 T1.2 skd×2（印记：库尔塔兹）。
- **布劳缪克丝女士**（SA，×1，血 ×0.55）：虚空领域：玩家脚下留虚空池 r18 10s。
- **大领主莫格莱尼**（SK，×1，血 ×0.55）：正义之火：接触 dot。；顺劈：cone。
- **瑟里耶克爵士**（SA，×1，血 ×0.55）：神圣之怒：弹跳金弹 3 次。

#### NAXX-10 帕奇维克（Patchwerk）

- 关卡：4 间小怪房 + 首领房；精英：缝合傀儡；小怪：缝合傀儡、感染食尸鬼、大墓地侍僧
- 血量 ×1.4 · 狂暴 60s · 技能轮换：hateful → hateful → hateful → NEW:patchSlime
- 区域：构造区
- **玩家提示**：纯输出检定：仇恨打击很痛但有节奏，60 秒内必须打死。

**阶段**

- 血量 5%：狂怒：攻速 ×1.5（frenzy perm）。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 仇恨打击 | `hateful` | 现有 hateful（circle@player r16 skd×2）；节奏固定 1.2s 一次。去掉现在轮换里的 charge/slam（原作没有）。 |
| 软泥池 | `NEW:patchSlime` | 房间两侧 rect 绿色软泥（站进去移速 ×.6，原作的软泥地），只是地形。 |
| 狂暴 | `enrage` | enrageSec 60 硬狂暴（现有 fury）。 |

#### NAXX-11 格罗布鲁斯（Grobbulus）

- 关卡：3 间小怪房 + 首领房；精英：缝合傀儡；小怪：缝合傀儡、感染食尸鬼
- 血量 ×1.2 · 狂暴 75s · 技能轮换：NEW:mutatingInjection → NEW:slimeSpray → NEW:poisonCloudG
- 区域：构造区
- **玩家提示**：被注射后跑到房间边缘再爆，别让毒云堵住中间。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 变异注射 | `NEW:mutatingInjection` | [playerBomb] t=8 r30 → after: 毒云池 r30 10s + 1 只辐射软泥。 |
| 软泥喷射 | `NEW:slimeSpray` | [tel] cone@boss ang.6 len60 T.8 skd×1，命中区域刷 2 只辐射软泥。 |
| 毒云 | `NEW:poisonCloudG` | 首领脚下留毒云，半径 10→40 在 10s 内扩大，持续 20s。 |

**召唤物 / 同伴**

- **辐射软泥**（SL，持续刷新，血 ×2）：辐射：自身 r20 dot 光环。

#### NAXX-12 格拉斯（Gluth）

- 关卡：3 间小怪房 + 首领房；精英：缝合傀儡；小怪：缝合傀儡、感染食尸鬼、大墓地侍僧
- 血量 ×1.3 · 狂暴 80s · 技能轮换：NEW:mortalWoundG → roar → NEW:frenzyGluth → NEW:decimate
- 区域：构造区
- **玩家提示**：残杀后僵尸只剩一丝血并冲向他：在他吃掉之前一个个点掉。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 致死之伤 | `NEW:mortalWoundG` | [stacks heal] 每次接触 +1。 |
| 恐惧咆哮 | `roar` | 现有 roar。 |
| 狂乱 | `NEW:frenzyGluth` | [frenzy] 大招安抚。 |
| 残杀 | `NEW:decimate` | [decimate] 每 25s：玩家 → 当前 ×.3（≥5%），所有僵尸 → 5% 血并冲向格拉斯；提示“拦住僵尸！”。 |

**召唤物 / 同伴**

- **僵尸构造体**（SL，持续刷新，血 ×1）：感染之伤：接触 [stacks vuln]。每 6s 从 3 个门刷 1 只。；被吞食：残杀后直奔格拉斯，碰到即为他回复 5%。

#### NAXX-13 塔迪乌斯（Thaddius）

- 关卡：3 间小怪房 + 首领房；精英：缝合傀儡；小怪：缝合傀儡、大墓地侍僧、石皮石像鬼
- 血量 ×1.5 · 狂暴 90s · 技能轮换：NEW:polarityShift → NEW:chainLightning → ball
- 区域：构造区
- **玩家提示**：P1 两个缝合怪要一起死；P2 看清自己头顶的 + / −，站到同号的半场能加伤害。

**阶段**

- 血量 100%：P1 [multiBoss reviveWindow 5]：斯塔拉格（左平台）+ 费尔根（右平台），塔迪乌斯在中间沉睡（不可攻击）。两者需在 5s 内相继死亡，否则复活。
- 血量 99%：P2：塔迪乌斯苏醒（入场动画：线圈放电），轮换 skills。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 极性转换 | `NEW:polarityShift` | [polarityShift]，取代现有半场轮炸版本。 |
| 闪电链 | `NEW:chainLightning` | 3 发快速蓝弹，命中后在 30px 内弹跳 1 次。 |
| 球状闪电 | `ball` | 现有 ball（远离时惩罚）。 |

**召唤物 / 同伴**

- **斯塔拉格**（SK，×1，血 ×0.8）：能量激增：frenzy 6s。
- **费尔根**（SK，×1，血 ×0.8）：静电场：nova r50 knock 70。

#### NAXX-14 萨菲隆（Sapphiron）

- 关卡：3 间小怪房 + 首领房；精英：石皮石像鬼；小怪：石皮石像鬼、死亡骑士队长、大墓地侍僧
- 血量 ×1.5 · 狂暴 100s · 技能轮换：NEW:lifeDrain → NEW:blizzard → NEW:sapphCleave → NEW:tailSweepS
- 区域：冰霜巨龙巢穴
- **玩家提示**：他飞起来后会把你冻成冰块的位置记住——吐息时一定要躲在冰块后面。

**阶段**

- 30 秒：每 30s 起飞（formArt，inv）：3 次寒冰箭 → 冰块 → 冰霜吐息（losBreath），然后落地。
- 血量 10%：不再起飞，硬拼。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 冰霜光环 | `NEW:frostAura` | 整场持续 G.dotT（每秒 skd×.05），无法躲避。 |
| 生命吸取 | `NEW:lifeDrain` | [curse:delayed] 6s dot，首领回复等量 50%。 |
| 暴风雪 | `NEW:blizzard` | 2 个移动冰池 r22 缓慢追踪玩家 10s，slow + skd×.25/.5s。 |
| 顺劈 | `NEW:sapphCleave` | [tel] cone@boss ang.6 len40 T.6 skd×1.1。 |
| 尾扫 | `NEW:tailSweepS` | [bossFacing] 身后 cone len60 knock。 |
| 冰块与冰霜吐息 | `NEW:losBreath` | [losBreath]。 |

#### NAXX-15 克尔苏加德（Kel'Thuzad）

- 关卡：2 间小怪房 + 首领房；小怪：石皮石像鬼、死亡骑士队长
- 血量 ×2.0 · 狂暴 120s · 技能轮换：frostbolt → NEW:frostboltVolley → frostblast → fissure → NEW:detonateMana → NEW:chainsKT
- 区域：冰霜巨龙巢穴
- **玩家提示**：P1 清杂别贪；寒冰箭要打断，暗影裂隙出现立刻离开；40% 后会叫来两名守护者。

**阶段**

- 血量 100%：P1（现有 p1adds，20s）：克尔苏加德在中央无敌，四角涌入冰霜荒原士兵（多）、憎恶、灵魂编织者。
- 血量 99%：P2：亲自出手，轮换 skills。
- 血量 40%：P3（现有 guardians）：召唤 2 名冰冠守护者。

**机制**

| 技能 | 键 | 实现 |
|---|---|---|
| 寒冰箭 | `frostbolt` | 现有 frostbolt，加 [castBar] 1s，命中 3 次打断（原作需打断）。 |
| 寒冰箭齐射 | `NEW:frostboltVolley` | ring 12 发冰弹 slow。 |
| 冰霜冲击 | `frostblast` | 现有 frostblast（冻结）。 |
| 暗影裂隙 | `fissure` | 现有 fissure（2.2s 后 skd×2.5）。 |
| 法力引爆 | `NEW:detonateMana` | [playerBomb] t=4 r40 dmg .8，after: G.skillT += 5。 |
| 克尔苏加德的锁链 | `NEW:chainsKT` | [mindControl] 4s。 |

**召唤物 / 同伴**

- **冰冠守护者**（SK，×2，血 ×9）：重击：不可击杀式坦克怪：玩家伤害 ×.3。
- **不可阻挡的憎恶**（SL，持续刷新，血 ×2）：致死打击：[stacks heal]。
- **灵魂编织者**（SA，持续刷新，血 ×1.5）：哀嚎：nova r40 knock。
- **冰霜荒原士兵**（SK，持续刷新，血 ×0.5）：自爆：deathExplode r20。

