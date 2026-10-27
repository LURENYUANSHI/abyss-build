# 深渊构筑 · 架构评审与重构方案（architecture.md）

> 评审对象：`game.html` 当前工作区版本（约 2200 行，含未提交的局外养成、主界面、AI 队友代码），以及 `index.html` 和 `design/*`。另一位开发者正在同时改这个文件，所以**以函数名为准，行号只作参考**。`design/audit.md` 已经写过的"内容还原度"问题（团本、首领、小怪机制缺失）这里不再重复，只引用它的编号。

---

## 0. 结论先行

1. **最大的风险不是内容不够，而是底座撑不住 59 关，更撑不住 150 关。** 很多公式直接用全局关卡号 `G.L` 来放大数值（每间房的刷怪数量、弹幕颗数、召唤数量、狂怒时间）。到第 59 关时，一间房要刷 161 只怪，"弹幕环"一次 73 颗；第 45 关以后首领一开场就进入狂怒。
2. **"一张地貌编号（`chOf`）决定一切"必须拆开。** 瓦片、小怪名单、精英、机关、小怪技能、敌方弹道贴图，一共 15 处都由同一个 1~4 的地貌编号决定。只要新团本用到第 5 套地貌，`buildRoster` 就会直接崩溃。
3. **代码里已经确认的 bug 有 30 条左右**（见 1.4）。其中三条需要马上修：
   - 程序像素图的缓存键会串色（这是正在进行的改动引入的）；
   - 结算面板和选职业标题读的是只有 12 项的旧关卡表，后面的关卡会显示 undefined；
   - 贴图在第一局开始时被"拍快照"存下来，导致首局缺图。
4. **存档按数组下标记录进度**（`PROG.best[L]`、`PROG.un`、装备里的 `ri`、`set=ri%4`）。团本一改顺序，玩家的解锁进度和装备套装就会悄悄错位。另外背包超过 60 件时会**静默删掉**最早一件没穿的装备，可能是传说装。
5. **战斗逻辑现在有三份平行实现**：玩家的普攻和技能、宠物（`petsTick`）、AI 队友（`alliesTick`）。队友打出的伤害走的是 `dmg()`，会吃到**玩家自己**的暴击、等级、海克斯加成；首领永远只锁定玩家；队友不会躲技能。这条路不能再往下走，要换成"统一的角色对象 + 可替换的控制器"。
6. **游戏逻辑和界面、计时器、随机数缠在一起**：
   - 战斗代码里直接调用 DOM（`$()` 用了 107 次），以及 `toast`、`sfx`；
   - 用 `setTimeout` 推进游戏事件；
   - 随机数没有种子；
   - 帧时间上限 33ms，低于 30 帧的手机会变成慢动作。

   结果是平衡模拟器没法放进仓库在 node 里跑，回归测试做不了，将来做联机同步也做不了。
7. **迁移可以几乎零风险**：先把 `<script>` 按现有的分节注释拆成多个普通脚本文件。普通脚本的顶层 `let`/`const` 在所有脚本之间共享，所以**一行逻辑都不用改**，每一步都能直接部署。
8. **"永远最新"的现有做法是**每次打开都用 no-store 拉取 216KB 再 `document.write`，但图片不带版本号。在 GitHub Pages 默认 10 分钟缓存下，会出现"新代码 + 旧图片"，切图帧数对不上就直接错位。正确做法是：一个极小的 `version.json` 永不缓存，其他文件名都带内容哈希，可以永久缓存。
9. **微信小游戏没有 DOM。** 主菜单、海克斯卡片、结算、主界面目前全是 HTML/CSS，必须换成画布 UI。这件事越早做越省，而且网页版也可以走同一套。
10. **150 个首领要靠"数据 + 引擎"来做**：约 70% 纯数据，约 20% 数据加通用引擎，约 10%（大概 15 个）写专用脚本。前提是先把 `raids.json` 里的文字描述（`impl`）改成机器能直接执行的结构化参数，并用校验脚本自动执行 spec 里的规定（比如预警时间不少于 0.6 秒、每个首领都有狂怒时间）。

---

## 1. 现状诊断

### 1.1 规模与形态

| 指标 | 数值 | 含义 |
|---|---|---|
| `game.html` | 约 2200 行 / 216KB，单个 `<script>` | 所有改动都挤在一个文件里，多人或多个代理并行修改时容易冲突 |
| 超过 200 字符的行 | 176 行，最长 557 字符 | 很难审查；"注释吞代码"就发生在这类长行里 |
| 代码后面跟 `//` 行尾注释的行 | 52 行 | 每一行都是潜在的"吞代码"点 |
| 全局引用次数 | `st.` 511 次、`pl.` 557 次、`G.` 913 次、`$(` 107 次 | 几乎所有函数都依赖全局单例 |
| `rand(` | 118 次，等于 `Math.random`，没有种子 | 无法复现、无法回归 |
| 美术 | `art/` 8.8MB（其中 `anime.png` 1.2MB），PNG 没有压缩 | 微信主包只有 4MB |

### 1.2 现有的"隐式模块"（按分节注释切分）

| 区段（函数 / 常量） | 实际职责 | 问题 |
|---|---|---|
| `P` `SPR` `mk` `IMG` `ET` | 程序像素图、小怪基础属性 | `ET` 既是游戏数据，又被 `IMG` 尺寸回写 |
| `AT` `CLS` `TUNE` | 普攻形态、职业、平衡系数 | `TUNE` 在加载时**直接改写** `CLS.hp/dmg`；之后美术加载还往 `CLS` 上挂 `art/_anim/_dir/_combo/port/img/combo`。内容表和运行时资源混在一起 |
| `loadArt` `strip` `cleanFx` `darkBox` `refit` `fitPose` `rowFit` `normAnim` | 美术加载和运行时抠图对齐 | 启动时在主线程上对每一帧做 `getImageData`；而且同一个职业有 3 张图，`normAnim` 会跑 3 遍 |
| `LEVELS` `THEMES` `genLevel` `buildTiles` `genAtlas` `drawTiles` `drawWorld` | 关卡生成与瓦片 | 依赖 `LV[L].b.rooms`、`chOf` |
| `OBS` `pushOut` `cluster` `setWp` `chase` `los` | 碰撞和寻路 | `OBS` 是全局变量，在 `startFight` 和走廊阶段被重新赋值 |
| `TIER` `SHARED` `UNQ` `GEN` `HEX` `REQ` `SETS` | 海克斯 | 卡面文字里直接写 HTML（`<br><em>`、`NEG()`）；卡片 id 用数组下标生成（`'s'+i`） |
| `BIG` `CHAPTERS` `RAIDS` `LV` `ROSTER` `ELITE` `MINI` | 首领、章节、小怪名单 | 有硬编码的 3 关、4 章、12 个首领残留（见 1.4 第 6 条） |
| `AU` `tone` `noise` `schedule` `sfx` | 合成音频 | 用 `setInterval(schedule,25)`；注册了两个 `visibilitychange` |
| `low/lc` `g` `scale2x` `hd` `drawArt` `drawSpr` | 双画布 | 低清画布实际只承载装饰层、门、无贴图时的池子 |
| `PROG` `SLOTS` `RAR` `GSET` `makeItem` `gearStats` `metaApply` `rewardLevel` | 局外养成（新） | 用下标引用团本和套装；没有存档版本号 |
| `reset` `resetBuild` `newLevel` `startFight` | 一局、一关、一间房的生命周期 | **手工维护一长串字段重置**，加新字段很容易漏掉 |
| `SK` `SKN` `BOSS_X` `spawnBoss` `bossAI` | 首领技能和脚本 | 只支持单个首领；技能参数写死；还有一条通用的 50% 狂暴 |
| `spawnAt` `propTick` `ventTick` `dmg` `kill` `hurt` | 战斗核心 | 小怪技能按 `chOf` 写在 `update` 和 `kill()` 里 |
| `castSkill` `doUlt` `slam` | 9 个职业的技能和大招 | 用 `switch(G.cls)` 分支，而不是数据 |
| `danger` `autoDir` | 自动走位 | 用势场叠加，没有"锁定目标"的概念 |
| `alliesInit` `alliesTick` `petsTick` | 队友和宠物 | 第二、第三份战斗实现 |
| `update`（约 200 行） | 输入、流程、刷怪、AI、投射物、持续效果、粒子 | 一个函数包办所有系统 |
| `render` `drawEntities` `drawMinimap` `hud` | 渲染 | `hud()` 每帧写约 20 个 DOM 属性 |
| `openPick` `renderPick` `choose` `reroll` `showAd` | 选卡 UI | 用 `innerHTML` 和 CSS（微信上不可用） |
| `renderHub` `renderLevels` `drawMap` `drawHome` `show` | 菜单 | 同上 |
| 文件末尾的 `console.assert` | 自检 | 启动时执行 `selCls='mage';reset()`，会真的生成一关 |

### 1.3 全局状态盘点

| 变量 | 寿命 | 内容 | 问题 |
|---|---|---|---|
| `st` | 一关（`resetBuild` 时重建） | 约 120 个构筑字段 | 全局只有一份，队友无法拥有自己的 `st` |
| `pl` | 一局 | 玩家的位置、血量、朝向、路径点 | 同上 |
| `G` | 混合 | 约 90 个字段，把一局（`lvl/xp/owned`）、一关（`rooms/atlas/roster`）、一间房（`pools/booms/fxs/vents/etels`）、表现（`shake/flash/cam`）、UI（`pickDown/offer`）、调试（`log/dpsHist`）全放在一起 | 寿命混杂；`startFight` 手工清掉约 30 个字段。`G.wolves`、`G.cl`、`G.ccd`、`G.windT`、`G.amb` 不在清单里，会跨房间残留 |
| `en/proj/bolts/rings/rain/nums/shots` | 一间房 | 模块级 `let`，每帧用 `filter` 重新赋值 | 每帧产生大量临时数组；如果有闭包持有旧数组引用，就会读到已经过期的数据 |
| `OBS` | 一间房或走廊 | 障碍物 | 走廊阶段被 `concat` 替换 |
| `PROG` | 永久 | 存档 | 没有版本号；按下标存 |
| `ART` `FX` `PJ` `IT` | 永久 | 贴图 | 加载完成没有通知；有些地方在首局拍了快照 |
| `CLS` | 永久 | 职业数据加运行时美术 | 见 1.2 |

### 1.4 代码里实际发现的问题（带函数和行号）

**A. 已确认会出错的**

| # | 位置 | 问题 | 修法（最小改动） |
|---|---|---|---|
| A1 | `mk()` 第 319-320 行（**未提交的新改动**）+ 第 439、843、1162 行的 `Object.assign({},P,…)` | 缓存键取自 `pal._key`。`P._key` 在第一次调用 `mk(r)` 时就写到了 `P` 上，之后 `Object.assign({},P,pal)` 会把 `_key` 一起复制过去。结果所有"同一份点阵 + 不同配色"的程序图（小怪名单、首领 `SPR.BO/BT/SL`）都会拿到默认配色的缓存，没有美术时的回退图全部变成同一个颜色 | 把 `_key` 改成不可枚举：`Object.defineProperty(pal,'_key',{value:JSON.stringify(pal)})`；或者用 `WeakMap` 存键 |
| A2 | `endPanel()` 第 1968 行 `LEVELS[G.L-1]` | `LEVELS` 只有 12 项，第 13 关以后显示 undefined | 改成 `LV[G.L].b.lv` |
| A3 | `show('start')` 第 1989 行标题 `${chOf(selLevel)}-${kOf(selLevel)} · ${LEVELS[selLevel-1]}` | 把地貌编号当成了团本序号，名字也取错 | 改成 `rNo()` 加 `LV[].b.lv` |
| A4 | 用全局关卡号放大数值：`startFight` 的 quota `16+L*2+i*2` 和 rate `1.2+L*.2`（第 1046 行）；`update` 的怪潮 `6+G.L*2`（第 1519 行）；`SK.ring` 的 `14+G.L` 颗、速度 `50+G.L*1.5`；`SK.summon` 和 `whelps` 的 `6+G.L`；`fly` 和 `submerge` 的 `4+G.L`；`bossAI` 50% 时 `summonRing(b,6+G.L*2)`；`spawnBoss` 的 `fury=(d.fury||52)-(L-1)*1.2`；`spawnAt` 的 `G.L>=2` | 第 59 关：每间房 quota=(16+118)×1.2≈161 只；弹幕环 73 颗；第 45 关起 fury≤0，首领开场就狂怒 | 统一改成 `tierOf(L)`（团本序号）、`raidFrac(L)`，以及数据里的 `enrageSec`、`adds.count`；见 6.4 的公式 |
| A5 | `chOf` 有 15 处用法：`buildRoster`、`newLevel` 的瓦片、`drawWorld`、`spawnBoss` 的 `ELITE[chOf-1]`、`startFight` 的机关 `['EGG','GRV','RFT'][ch-2]`、`kill()` 里的分裂/毒池/自爆/重组、`update` 里的冲锋/凝视/瞬移/三连发/火弹、`shotName` | 一个地貌编号同时决定外观、小怪名单和小怪行为。新团本的 `bio=5` 会让 `ROSTER[4]` 为 undefined 而崩溃；精英贴图索引 `ei=ci<3?ci*4+ki:ki*4+3` 写死了"4 章 × 3 关" | 地貌只管外观；小怪名单和行为放进团本数据（第 3 节） |
| A6 | "3 关 / 6 间"残留：`ELITE[..][LV[L].k%3]`、`ki=LV[L].k%3`、`BIG.splice(0,12)`、`ORDER` 12 项、自检 `size===24`（第 2192 行，BIG/MINI 一改就报错）、`NODES_OLD` `BANDS` `CH_DESC`（死代码）、`v.b.rooms||6`、`startFight` 注释"第 3 间精英，第 6 间大首领"与 `genLevel` 实际的 `(NR-1)>>1` 不一致、`hpCurve` 注释"0~17"、`ART.bosses[LV[L].b.art]` 用 `c*3+k` 当下标 | 改内容时到处会被绊住 | 迁移到数据时一起删掉 |
| A7 | `loadArt` 第 370 行没有 `onerror`，也不返回 Promise。`newLevel` 里 `G.atlas=ART[…]||genAtlas()`，`buildRoster` 把 `ART.mobs/mobs2/mobsAtk` 拍快照存进 `G.roster`，`spawnBoss` 把 `ART.bosses` 拍快照，`drawWorld` 在没有美术时画程序装饰 | 首局如果图还没加载完，这一整关都会用程序图；图加载完以后，瓦片换成了美术图，但程序装饰还留在上面，两者混在一起。启动自检里的 `reset()` 在任何图加载之前就生成了一关 | 资源清单 + `Promise.all` + 进度条；绘制时按键名实时取图（第 5 节） |
| A8 | `frame()` 第 1888 行 `dt=Math.min(.033,…)`；`autoDir` 里 `pl.wpT-=1/30` | 低于 30 帧时游戏变慢；路径点超时依赖帧率；模拟器结果和真机不一致 | 固定步长 1/60，再加一个时间累加器（2.1） |
| A9 | `spawnBoss` 里的 `setTimeout(toast,1300/2600)`、`toast`/`banner` 的 `setTimeout`、`showAd` 的 `setInterval` | 暂停（选卡、查看海克斯）时不会停；回到主页后还会弹提示；headless 环境下无法确定性运行 | 改成游戏内计时器 `G.sched`（已经有了），UI 层只订阅事件 |
| A10 | 单首领假设：`G.boss` 被引用 25 次；`kill()` 里任意 `e.boss` 死亡都会 `G.bossDone=true` | 多首领（三宝、四骑士）在第一个死掉时就会判定通关；`danger()` 和 `render()` 只看 `G.boss` 的预警 | 改成 `G.bosses[]` 加统一的危险区列表（4.5） |
| A11 | `bossAI` 里 `if(b.chief&&!b.ph2&&b.hp<b.max*.5)` | 通用的 50% 狂暴加召唤会覆盖还原后的机制（audit 第 4 条） | 删掉，改由阶段数据驱动 |
| A12 | `pl.inv=0;hurt()` 这种"绕过无敌帧"的写法出现在预警命中、池子、小怪预警、厄运、狂怒等处；`hurt()` 有 0.7 秒全局无敌帧 | 一群怪贴身时伤害被无敌帧封顶；大招刚命中、池子跳一下就把保护清零。规则不一致，平衡也就不可信 | 按伤害来源分别冷却（4.4） |
| A13 | `dmg()` 第 1224 行先 `sfx('hit')`，再判断 `e.dead||e.inv` | 打无敌首领也有命中音效 | 两句换个顺序 |
| A14 | 存档：`PROG.best[L]`、`PROG.un` 是数字；装备的 `ri` 和 `set=ri%GSET.length` | 团本表从 12 → 59 → 150 关、顺序调整时，进度和套装会悄悄错位；没有 `v` 字段，也就没有迁移 | 见 7.6 |
| A15 | `rewardLevel` 里 `PROG.inv.length>60` 时 `splice` 掉第一件没穿的装备 | **数据丢失**，可能删掉传说装 | 改成自动分解成材料并提示；加物品锁 |
| A16 | `index.html` 用 `document.write`，但 `art/*.png` 不带版本号 | Pages 的 `max-age=600` 会导致"新代码 + 旧图片"。`strip(im,n)` 的帧数写在代码里，所以图和代码不配套时切帧会错位 | 见 2.4 |
| A17 | `game.html` 第 7 行引用 Google Fonts | 国内加载很慢或失败，微信里不可用；伤害数字用的 "Press Start 2P" 会退回系统字体 | 字体放进仓库，或者用位图数字 |
| A18 | `visibilitychange` 注册了两次（第 870、938 行） | 逻辑重复，而且有一个只恢复不暂停 | 删掉第 870 行那个 |
| A19 | `alliesTick` 里队友的伤害走 `dmg()` | `dmg()` 用的是玩家的 `st.crit`、`G.pm`、`st.bossDmg`、`G.adrT`、`st.execute`、`critSplash`……队友伤害会随**玩家的**等级和海克斯一起涨；首领永远只打玩家；队友不躲预警，只用 `q.done&&q.fx>.2` 这种时序判定被技能打中 | 第 4 节：统一角色对象和伤害管线 |
| A20 | `RAID_REQ` 把燃烧的远征设为账号 60 级；账号经验每通一关 100+20·ri，升级需要 `accNeed=120+40lv` | 从 1 级到 60 级共需 Σ(120+40lv)=**77,880** 经验，相当于大约 400~700 次通关。资料片实际上解不开 | 见 7.1 的曲线 |
| A21 | `metaApply` 里账号等级给攻击和生命各 +1.5%/级 | 80 级时 +118.5%。模拟器是按账号 1 级调的平衡，局外养成上来以后平衡就失效了 | 7.7 的战力预算 |
| A22 | `makeItem` 里的局部变量 `st` 遮蔽了全局 `st` | 全局 `st.` 有 511 处，这里读代码很容易误判 | 改名为 `s` |
| A23 | `GSET` 两件套的 `pl.maxHp*=1.12` | 最大生命出现小数，HUD 显示 `150.72` | 加 `Math.round` |

**B. 结构性风险（暂时还没出错）**

- **注释吞代码**：v16（提交 `0c0d7df`）修过一次，`drawArt(...)` 被拼到了行尾 `// 朝向带死区…` 的后面，结果所有贴图怪物都不绘制。现在第 1557 行附近的 `t=T.melee?   // 忍者：…` 是一个**三元表达式还没写完就接了注释**，下一行才继续。只要有人把两行合并，就会再出一次同样的事故。根本原因是：长单行代码、行尾 `//` 注释、没有语法外的检查、也没有"每帧确实画了东西"的冒烟测试。
- **`update()` 一个函数约 200 行**：每加一个机制都往里插；系统之间的顺序依赖（比如 `en.filter` 在宠物结算之后、`G.booms` 每帧最多处理 40 个）全是隐式的。
- **`hud()` 每帧写 DOM**：低端手机上每帧都触发样式重算；`$()` 每次都调用 `getElementById`。
- **性能热点**：
  - 敌人互相推开是 O(n²)，`en` 最多 300 个；
  - `nearest()` 线性扫描，在每个追踪弹、每个宠物、每个队友身上每帧都调用；
  - `en.filter(...).length` 在清房判断和大招判断里每帧都算；
  - `drawEntities` 每帧建数组再排序；
  - `drawTiles` 每帧约 300 次 `drawImage`，可房间本身是静态的；
  - `glow()` 每调用一次就新建一个径向渐变。
- **海克斯卡效果是闭包、直接改全局 `st`**：数据只能写在代码里；也没办法给队友配一份构筑。

---

## 2. 目标架构

### 2.1 原则（刻意保持"懒"）

- **继续用原生 JS 和 Canvas 2D，不引入框架，不做完整 ECS，暂时不迁移 TypeScript**（需要时在单个文件里加 `// @ts-check` 和 JSDoc）。
- **游戏逻辑（sim）完全不碰 DOM、计时器、`Math.random`**：输入是"指令"，输出是"状态 + 事件"。这是 headless 模拟、回归测试、联机同步共同的前提。
- **数据和代码分开**：首领、小怪、海克斯、装备、职业全放进 `content/*.json`；代码里只放"引擎"和"少量专用脚本"。
- **平台层要薄**：web、wx、node 三个实现，接口统一。
- **每一步都能运行、能部署**，不做大爆炸式重写。

### 2.2 目录（最终形态；每个目录在第一次需要时再建）

```
index.html                 网页外壳：#c 画布 + 加载器（读 version.json）
game.js                    微信入口（require('./build/game.wx.js')）
src/
  platform/ web.js wx.js node.js     统一接口 PF
  core/     loop.js rng.js bus.js sched.js pool.js grid.js
  data/     content.js（加载 + 索引 + 运行时校验）
  world/    level.js（genLevel/buildTiles）collide.js（pushOut/los/clampRoom/flowField）
  ent/      actor.js spawn.js status.js
  combat/   damage.js（dealDamage/hurt/kill 管线）attack.js（swing/fireProj/onAtkHit）
            classes/<cls>.js（技能 + 大招，各约 30 行）
  ai/       ctrl.js（控制器接口）auto.js（自动走位）mob.js（mobAbility 执行器）boss.js（轮换、阶段、狂怒）
  mech/     engines/*.js（tel、mobAbility、addPhase、multiBoss、castBar、curse、stacks……）
            scripts/*.js（萨菲隆、塔迪乌斯、四骑士……专用脚本）
  build/    hex.js（卡池/报价/选卡）
  meta/     save.js account.js gear.js loot.js party.js
  render/   renderer.js sprites.js anim.js fx.js tiles.js hud.js
  ui/       kit.js（画布即时模式 UI）screens/*.js（主页/主界面/背包/选卡/结算）
  audio/    synth.js sfx.js music.js
  assets/   manifest.js loader.js
content/
  classes.json hex.json gear.json balance.json fx.json themes.json
  raids/classic/{mc,ony,bwl,zg,aq20,aq40,naxx}.json  raids/tbc/*.json  raids/wotlk/*.json
art-src/   GPT 原图（不发布）
art/       管线产物：atlas_<pack>.png + atlas_<pack>.json（带哈希）
tools/
  check.mjs validate.mjs sim.mjs build.mjs migrate-raids.mjs
  art/{cut,key,measure,normalize,pack,report}.mjs
test/      smoke.mjs golden/*.json
```

### 2.3 各模块的职责和对外接口

| 模块 | 对外接口（签名） | 说明 |
|---|---|---|
| `platform/*` | `PF={now(), raf(cb), canvas(w,h), image(url)→Promise, store:{get(k),set(k,v)}, audio:{ctx(),play(id)}, input:{on(type,cb)}, vibrate(ms), ad:{rewarded(place)→Promise<bool>}, sys:{safe:{t,b,l,r}, capsule}, net}` | web 用 DOM 和 localStorage；wx 用 `wx.*`；node 只有空实现和内存存储 |
| `core/loop` | `run(world, render)`：固定步长 `STEP=1/60`，累加器，每帧最多补 4 步；`step(world)` | 修 A8；sim 直接循环调用 `step` |
| `core/rng` | `R=rng(seed)`：`R.f()` `R.int(n)` `R.range(a,b)` `R.pick(a)` `R.shuffle(a)`；`world.R`（游戏逻辑，有种子）和 `FXR`（表现，无种子）分开 | 粒子等表现用的随机数不影响逻辑的确定性 |
| `core/bus` | `emit(type, payload)`、`on(type, cb)`；事件有 `toast` `banner` `sfx` `shake` `say` `phase` `bossSpawn` `death` `levelDone`…… | 逻辑层不再调用 `toast()`、`sfx()`、`$()` |
| `core/sched` | `after(world, t, fn)`、`every(...)` | 替换 `setTimeout`；暂停时自动停 |
| `world/level` | `genLevel(levelDef, R) → {rooms, cors, tmap, tw, th}` | 纯数据，不画画布；画画布交给 `render/tiles` |
| `ent/actor` | `makeActor(def, team, ctrl)`、`actor.stats`、`actor.status`、`actor.anim` | 见 4.1 |
| `combat/damage` | `dealDamage(w, {src, tgt, amt, tags, crit})`、`heal(...)`、`kill(w, e, src)` | 唯一的伤害入口 |
| `ai/ctrl` | `ctrl.decide(a, w) → {mx, my, atk, skill, ult}` | 玩家、队友、联机共用 |
| `mech/engines/*` | `{key, params, start(ctx,p)→dur, tick(ctx,p,dt), end(ctx,p), validate(p)}` | 见 3.3 |
| `render/*` | `render(world, alpha, cam)`，只读世界状态 | 不改任何逻辑状态 |
| `ui/kit` | `ui.begin()`、`ui.button(id, rect, label)→clicked`、`ui.text(...)`、`ui.panel(...)`、`ui.scroll(...)`、`ui.end()` | 第 8、9 节 |
| `meta/save` | `load()→PROG`（带迁移）、`save(PROG)`（防抖写入，迁移前备份） | 见 7.6 |
| `assets/loader` | `await loadPack('boot'|'hero_<cls>'|'raid_<id>', onProgress)`、`A.get('mob/core_hound/walk')` | 见 5.2 |

### 2.4 渐进迁移（每一步都能运行、能部署）

| 步骤 | 做什么 | 改动量 | 验收 |
|---|---|---|---|
| **M0 止血** | 修 A1~A4、A13、A18、A23；`tools/check.mjs`（见 6.1）；所有行尾 `//` 改成独立一行，或者改成 `/* */` | 约 40 行加一个 60 行脚本 | 打开 `?lv=59` 能正常打；回退像素怪颜色正确；`node tools/check.mjs` 通过 |
| **M1 拆出脚本** | `game.html` 只留 HTML 和 CSS；`<script>` 原样剪切到 `src/game.js`（普通脚本） | 0 行逻辑 | 线上行为完全一致 |
| **M2 按分节拆成多个普通脚本** | 按现有的 `// ---------- xxx ----------` 切成约 15 个文件，用多个 `<script src>` 按顺序加载。**普通脚本的顶层 `let/const` 在全局词法环境里共享**，所以不用改任何引用 | 0 行逻辑 | 同上。冲突粒度从一个文件变成按系统划分 |
| **M3 资源加载器** | `assets/manifest.json`（文件名、哈希、帧数、格子大小）+ `loadPack` + 进度条；去掉 `G.roster`、`G.atlas`、首领贴图的快照，改成绘制时取 `A.get(key)` | 约 120 行 | 清掉缓存、限速到 Slow 3G 时，首局贴图全部正常 |
| **M4 事件 / 计时 / 随机数 / 固定步长** | `bus` `sched` `rng` `loop`；逻辑代码里的 `toast/banner/sfx/$()` 改成 `emit`；`setTimeout` 改成 `after` | 约 200 处机械替换 | 用 `?seed=1` 打同一关两次，击杀数和用时完全一样 |
| **M5 headless 模拟** | `tools/sim.mjs` 用 `vm` 按顺序载入这些脚本，注入 `platform/node.js` | 约 150 行 | `node tools/sim.mjs --smoke` 2 分钟内输出报表 |
| **M6 内容数据化** | `content/raids/*.json` + `validate.mjs` + 引擎 `tel/mobAbility/phases/enrage` | 第 3 节 | 熔火之心 10 个首领全部从数据跑通 |
| **M7 角色对象化 + 控制器** | 玩家和队友统一（第 4 节） | 中等 | 2 个 AI 队友能用职业技能和大招、会躲预警、首领有仇恨 |
| **M8 改成 ES 模块** | 系统**被重写时**再顺手改成 `import/export`；生产环境用 `esbuild` 打成一个包（同一个包给 web 和 wx） | 跟着重写一起做 | — |
| **M9 画布 UI** | 菜单、选卡、结算、主界面换成 `ui/kit` | 约 800 行 | 网页版不再依赖 DOM 菜单 |
| **M10 微信平台层** | `platform/wx.js` + 分包或 CDN + 广告 | 第 9 节 | 真机预览可以通关第 1 个团本 |

### 2.5 "永远最新"的缓存策略（替代 `document.write`）

1. **`index.html`**：保持极小（约 1KB），里面只做一件事：
   ```js
   fetch('version.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.json()).then(v=>{
     window.__V=v;                              // {v:"v18-3f2a1c", js:["build/game.3f2a1c.js"], art:{...}}
     for(const s of v.js){const e=document.createElement('script');e.src=s;e.async=false;document.body.appendChild(e);}
   });
   ```
2. **其他所有文件都带内容哈希**，比如 `build/game.<hash>.js`、`art/atlas_mc.<hash>.png`。哈希变了 URL 就变，所以可以永久缓存（Pages 的 10 分钟缓存也不会再造成新旧混用）。
3. **帧数、格子大小、锚点都写在 manifest 里**，代码不再写死 `strip(im,16)`。图和切法总是同一个版本，A16 不会再发生。
4. **开发时不需要构建**：`tools/build.mjs --dev` 只生成 `version.json`（指向未带哈希的文件，并附 `?v=<git sha>`）。
5. **游戏中发现有新版本**：每次回到主界面时重新取一次 `version.json`；如果 `v` 变了，就提示"有新版本，点击刷新"。不在战斗中强制刷新。
6. **微信**：代码包的版本由微信管理，用 `wx.getUpdateManager().onUpdateReady → applyUpdate`；CDN 上的远程资源同样用带哈希的文件名，下载后缓存到本地文件系统（见 9.4）。
7. **不做 Service Worker**（YAGNI；微信也不支持）。

---

## 3. 数据驱动

### 3.1 统一约定（沿用 `raids.json` 里的 conventions）

- 伤害写成**倍数**：首领技能乘 `skd`，小怪技能乘 `e.dmg`，玩家技能乘 `atkBase`。
- 时间单位是秒，预警时间 `T` 都会乘节奏系数 `f`（P2 或狂乱时为 0.75）。
- 距离单位是世界像素（普通房间 160×192，首领房 192×256）。
- **所有引用都用稳定的字符串 id**，例如 `mc`、`mc/lucifron`、`core_hound`、`crit_edge`，**不再用数组下标**。

### 3.2 Schema（字段说明加示例）

**职业** `content/classes.json`（`CLS` + `AT` + `TUNE` 合并后的值，不在运行时再乘）

```json
{"mage":{"name":"法师","role":"rmag","hp":182,"spd":72,"atk":{"form":"orb","dmg":20.7,"cd":0.45},
  "kite":1,"specs":["arcane","fire","frost"],"alias":{},
  "skill":{"engine":"chainLightning","cd":4,"params":{"hops":6,"first":110,"hop":58,"mul":3,"splash":{"r":16,"mul":1.5}}},
  "ult":{"engine":"meteorRain","cd":5,"params":{"n":8,"gap":0.15,"r":28,"mul":4,"burn":3}},
  "art":{"sheet":"hero_mage","portrait":"anime_mage","icons":["icon_mage_sk","icon_mage_ult"]}}}
```

**普攻形态** `attackForms`：`{"orb":{"melee":false,"spd":125,"life":0.95,"r":5,"range":115,"boom":12,"fx":"orb"}}`（就是现在的 `AT`）

**海克斯** `content/hex.json`

```json
{"id":"crit_edge","tag":"crit","tier":1,"name":"锋刃","desc":"普攻暴击率 {+20%}",
 "fx":[{"stat":"crit","add":0.2}],"req":null,"only":null,"cls":null,"role":null,"neg":null}
{"id":"glass_cannon","tag":"gen","role":"all","tier":2,"name":"玻璃大炮","desc":"伤害 {+40%}","neg":"最大生命 -25%",
 "fx":[{"stat":"atkMul","mul":1.4},{"stat":"maxHp","mul":0.75}]}
{"id":"sword_wave_every","cls":"sword","tag":"wave","tier":1,"name":"剑气纵横","desc":"每 {2} 次挥砍即释放剑气",
 "fx":[{"stat":"waveEvery","set":2}]}
```

- `fx` 支持的操作：`add` `mul` `set` `flag`（等同于 `set:true`）`fn`（指向 `build/hexfn.js` 里的具名函数，只给极少数无法用数值表达的卡）。
- `desc` 用 `{}` 标记高亮部分，渲染端自己决定样式（DOM 用 `<em>`，画布用金色），**不再在数据里写 HTML**。
- 套装羁绊 `sets`：`{"crit":{"2":{"desc":"暴击率 +10%","fx":[...]},"3":{...}}}`。
- 自检（每个流派 2/2/1 张、每个职业 5 张专属）移到 `validate.mjs`。

**团本** `content/raids/classic/mc.json`

```json
{"id":"mc","name":"熔火之心","exp":"classic","order":1,"ilvl":66,"accReq":1,
 "look":{"tiles":"tiles_mc","theme":"lava","amb":"ember","music":"volcano","shot":"efire"},
 "props":[{"id":"vent","engine":"hazardVent","rooms":"trash","count":[1,2],
           "p":{"cd":[6,9],"T":0.9,"r":22,"dmg":0.15,"hitsEnemies":true,"pool":{"r":12,"t":2.5,"dmg":0.05}}}],
 "mobs":{
   "core_hound":{"name":"熔火恶犬","move":"melee","stats":{"hp":0.6,"spd":1.7,"dmg":0.6,"r":4,"xp":1},
     "ab":[{"kind":"pounce","cd":[2.6,3.6],"range":60,"wind":0.35,"spd":150,"dur":0.28,"dmg":1.2,"onHit":{"status":"bleed","t":2}},
           {"kind":"packRevive","pack":3,"window":10,"hp":0.5}],
     "art":"mob/core_hound"},
   "flamewaker_priest":{"name":"烈焰行者牧师","move":"ranged","stats":{"hp":0.8,"spd":0.9,"dmg":0.5},
     "ab":[{"kind":"volley","cd":2.6,"n":1,"spd":70,"dmg":1,"range":95,"los":true},
           {"kind":"castHeal","cd":8,"T":2,"need":3,"heal":0.15,"r":60}],
     "art":"mob/flamewaker_priest"}},
 "bosses":["lucifron","magmadar", "..."]}
```

**首领** `content/raids/classic/mc/lucifron.json`（或者内联在团本文件里）

```json
{"id":"lucifron","name":"鲁西弗隆","order":1,"rooms":3,"elite":"core_hound","trash":["core_hound","flamewaker","flamewaker_priest"],
 "hp":0.9,"enrage":60,"size":54,"art":"boss/lucifron","tip":"先杀两名护卫防止被支配；末日降临倒数结束必掉血。",
 "adds":[{"id":"flamewaker_protector","count":2,"hp":2.5,"at":"flank","link":{"bossTaken":0.8},
          "ab":[{"kind":"tel","cd":4,"p":{"shape":"cone","at":"self","aim":"target","ang":0.6,"len":30,"T":0.6,"dmg":1.2}},
                {"kind":"tel","cd":15,"p":{"shape":"circle","at":"target","r":10,"T":1.0,"dmg":0,"eff":{"status":"mc","t":3}}}]}],
 "gap":1.3,
 "rotation":["impendingDoom","shadowShock","lucifronCurse","shadowShock"],
 "skills":{
   "impendingDoom":{"name":"末日降临","engine":"curse","p":{"kind":"delayed","t":6,"dmg":1.2}},
   "lucifronCurse":{"name":"鲁西弗隆的诅咒","engine":"curse","p":{"kind":"cd","t":10,"mul":2}},
   "shadowShock":{"name":"暗影震击","engine":"tel","p":{"shape":"circle","at":"self","r":48,"T":0.8,"dmg":0.8}}},
 "phases":[],
 "win":"allBossesDead"}
```

- `rotation`：按顺序轮换；`gap` 是两次技能之间的走动时间（就是现在的 `b.at=1.3*f`）。也可以给单个技能配 `cd`，这时取"轮换中第一个已就绪的技能"。
- `phases`：`[{"hp":0.65,"go":"fly","rotation":[...],"form":"boss/onyxia/fly","say":"…","do":[{"engine":"addPhase","p":{...}}],"frenzy":false}]`，替代现在的 `BOSS_X.ph` 和 `open`。
- `start`：开场状态，比如 `{"hp":0.3,"status":["essence"]}`（赤炎巨龙）。
- `win`：取值 `allBossesDead | addsDead:<id> | custom:<script>`。
- `script`：可选，`"thaddius"` 对应 `mech/scripts/thaddius.js`。

**装备** `content/gear.json`：见 7.2。

**地貌主题** `content/themes.json`：现有的 `THEMES` 加 `deco` 加 `amb`，**只管外观**。

### 3.3 技能引擎的统一接口

```js
// mech/engines/tel.js
export default {
  key:'tel',
  params:{shape:['circle','cone','beam','rect'], at:['self','target','random','fixed','each'], r:0, len:0, ang:0, w:0,
          T:0.8, dmg:1, n:1, gap:0.1, spread:0, eff:null, after:null, safe:null, col:null},
  validate(p){ return p.dmg>0 && p.T<0.6 ? 'telegraph T<.6' : null; },   // 自动执行 spec 的"预警 ≥ .6 秒"
  start(ctx,p){ for(let i=0;i<p.n;i++) ctx.hazard(shapeOf(ctx,p,i),{T:(p.T+i*p.gap)*ctx.f, dmg:p.dmg*ctx.skd, eff:p.eff, after:p.after, src:ctx.src}); return p.T*ctx.f+0.2; },
  tick(){}, end(){}
};
```

- **`ctx` 对象**：`{w, src(施法者), tgt(当前目标), f(节奏系数), skd, R, emit, hazard(), spawn(), status(), say()}`。引擎只通过 `ctx` 和世界交互，所以可以单独测试。
- **统一的危险区（hazard）**：把首领预警 `b.tels`、小怪预警 `G.etels`、各种池子 `G.pools` 合并成 `w.hazards`，结构为 `{shape, x,y,r|len,ang|w,h, T,left, dmg, eff, team:'enemy'|'neutral', persist:t, tick:.5, after, src}`。
  - `danger()`、绘制、命中判定（`telHit`）全部只看这一个列表。多首领和小怪技能会自动被走位系统识别。
- **统一的效果（eff）**，由一个函数 `applyEff(w, tgt, eff, src)` 执行：
  `{status:'freeze'|'slow'|'fear'|'dot'|'vuln'|'mc'|'stun'|'bleed', t, k}`、`{knock:45}`、`{pull:20}`、`{spawn:'id', n}`、`{pool:{r,t,dmg}}`、`{teleport:'corner'|'boss'|'random'}`。
- **统一的状态表**，替代 `G.sealT/G.dotT/G.pSlowT/G.vulnT/G.fearT/G.noHealT/G.adrT/pl.frozenT/G.doomT`：

  ```js
  STATUS={ slow:{name:'减速',icon:'st_slow',mods:{spd:0.5}},
           vuln:{name:'易伤',mods:{taken:1.3}},
           seal:{name:'封印',flags:{noSkill:1,noUlt:1}},
           dot:{name:'灼烧',tick:0.5,onTick:(a,s)=>hurt(a,s.k)},
           stacks_heal:{stack:true,max:20,mods:s=>({heal:1-.1*s.n})}, ... }
  actor.status[key]={t,n,k,src}
  ```

  - buff 栏、模拟报表（"死于哪个状态"）、队友受到的状态都直接从这张表来。
- **`newPrimitives` 怎么对应到引擎**（`raids.json` 里的 30 个）：
  - **通用引擎（约 18 个）**：`tel` `mobAbility` `addPhase` `multiBoss` `frenzy` `followAura` `playerBomb` `curse` `mindControl` `bossShield` `castBar` `totem` `stacks` `teleportPlayer` `safeSpots`（作为 `tel` 的一个参数）`decimate` `energyBar` `rangedPunish` `bossFacing`（作为首领字段）`objectiveProps` `mirrorImages` `burrow` `gaze`。
  - **专用脚本（约 7 个，每个不超过 80 行）**：`shatter`（维希度斯）、`siphon`（哈卡）、`stomach`（克苏恩）、`polarityShift`（塔迪乌斯）、`marks`（四骑士）、`losBreath`（萨菲隆）、`webWrap`（迈克斯纳）。
  - **规则**：同一个写法在 2 个以上首领里出现，就把它提升为引擎。

### 3.4 怎样让 150 个首领"只靠数据 + 少量脚本"

1. **`tools/migrate-raids.mjs`**：把 `raids.json` 里 `impl` 的半结构化写法（例如 `"[tel] circle@boss r48 T.8 skd×.8"`、`"[curse:cd] 每 15s：10s 内技能冷却 ×2"`）用正则解析成 `p` 参数；解析不了的写成 `"TODO":"原文"`，交给人工或 AI 补全。估计 60~70% 能自动解析。
2. **`tools/validate.mjs`** 检查：
   - 引用的 `engine` 是否存在，`p` 是否通过该引擎的 `validate`；
   - `rotation` 里的键是否都在 `skills` 里；
   - `trash` 和 `elite` 是否都在 `mobs` 里；
   - `art` 键在 manifest 里是否存在，不存在时是否声明了 `fallback`；
   - 首领都有 `enrage`；伤害技能的 `T≥0.6`；远程小怪占比不低于 30%（spec）；
   - **把 `raids_spec.md` 的约定变成会让检查失败的规则**。
3. **首领"作者模式"**：打开 `?boss=mc/lucifron&seed=3&god=1` 可以直接进首领房、开无敌、带调试面板（显示轮换、阶段、危险区和每个技能的命中统计）。每做完一个首领，跑 `sim --boss mc/lucifron` 看各职业的胜率和每个技能的命中率。
4. **工作量估算**：经典 59 个首领中，约 40 个纯数据（每个约 40 行 JSON）、约 12 个"数据 + 通用引擎"、约 7 个专用脚本。燃烧的远征和巫妖王之怒的约 90 个首领复用同一批引擎，按经验大约还需要新增 10~15 个引擎和 10 个脚本（如凯尔萨斯分阶段、伊利丹、穆鲁、巫妖王）。

---

## 4. 战斗与 AI

### 4.1 角色对象（Actor），不做完整 ECS

```js
actor = {
  id, team:'hero'|'enemy'|'neutral', kind:'hero'|'mob'|'elite'|'boss'|'add'|'prop'|'pet'|'summon',
  def,                 // 指向 content 里的定义（只读）
  x,y,r, vx,vy,        // 物理
  hp,maxHp,shield, alive,
  stats,               // 英雄：原来的 st（每个角色一份）；敌人：{dmg,skd,spd}
  build,               // 英雄：{owned:Set, tags:{}, lvl, xp, pm}（原来的 G.owned/G.tags/G.lvl）
  status:{},           // 4.3 的统一状态
  cd:{atk,skill,ult},  // 冷却
  ctrl,                // 控制器（4.2）
  ai,                  // 敌人：{mode, at, cyc, phi, rot, threat:Map}
  anim:{state,t,dir,face,form},
  srcCd:{}             // 4.4 按来源计的受伤冷却
}
```

- "组件"就是可选字段，"系统"就是函数，比如 `moveSys(w)`、`aiSys(w)`、`combatSys(w)`、`statusSys(w)`、`hazardSys(w)`、`animSys(w)`，由 `step()` 按固定顺序调用。**这个顺序就是文档**，写在 `step()` 里。
- 世界状态按寿命拆开，用**工厂函数**创建，不再手工逐项清零：

  ```js
  w = {run:newRun(), level:newLevel(), room:newRoom(), actors:[], hazards:[], projs:[], fx:[], R, t}
  ```

- **渐进式迁移**：第一步先让 `pl` 变成 `w.heroes[0]`，`st` 变成 `pl.stats`。机械替换 `st.` 有 511 处，可以用一句 sed 加人工检查；或者先写 `let st` 的 getter，在 `startFight` 时同步 `st=pl.stats`，这是最懒的过渡做法。然后只改队友会调用到的函数：`swing` `fireProj` `onAtkHit` `castSkill` `doUlt` `dealDamage` `hurt`，给它们加参数 `a`，默认值是 `HERO`。

### 4.2 控制器：玩家和 AI 队友用同一份（为组队铺路）

```js
ctrl.decide(a, w) → {mx, my, atk:true, skill:bool, ult:bool, target:actorId}
HumanCtrl   = 摇杆和键盘有输入时用手动移动，否则交给 AutoCtrl；技能和大招可以自动，也可以点按钮
AutoCtrl(role) = 4.3 的自动走位 + 普攻目标选择 + 技能和大招的释放条件
NetCtrl     = 从网络指令队列里读（联机阶段）
```

- **AI 队友就是 `AutoCtrl` 加上职业 `role` 参数**：
  - 坦克：主动贴首领、仇恨乘 3；
  - 治疗：给血量百分比最低的队友放技能；
  - 输出：保持输出、有爆发窗口就放大招。
- 队友和玩家使用**同一套** `castSkill/doUlt/swing`，拥有**自己的** `stats`。这样就删掉了 `alliesTick` 这第三份战斗实现，A19 也一并解决。
- 首领要有仇恨：`threat[a.id]+=伤害×role系数`；首领技能的 `at:'target'` 打仇恨最高的人，`'random'` 打随机队员，`'farthest'` 打最远的人（对应原作的"远程惩罚"）。
- 队友的构筑：每个队友有自己的 `build`。最懒的做法是：玩家选卡时，队友按自己职业的流派**自动随机选**同品质的卡（用 sim 的选卡策略），不需要额外 UI。

### 4.3 自动走位：问题和重写

**现在的问题**（`autoDir`）：
1. 只要 `danger()` 为真就立刻逃跑，不管离生效还有多久（比如 1.3 秒）。近战大部分时间都在逃，这就是"只躲不打"的根源。v16 用 `stuck` 和首领排斥权重打了补丁，只治标。
2. 势场叠加没有"锁定目标"的概念，各个力互相抵消后容易抖动、在原地徘徊。
3. 躲避用的 7×9 网格每帧都对每个格子跑一遍 `danger()`，只看距离，不看"到那里还能不能打到人"。
4. 只考虑 `G.boss.tels`，不认识多首领、小怪预警和池子之外的新危险区。

**重写方案（采样 + 打分 + 延迟躲避 + 滞回）**，每 0.1 秒决策一次，不是每帧：

```
候选点：当前位置；以自身为圆心、半径 12/24/40 各 8 个方向；目标的理想攻击距离环上 8 个点；爱心位置（血量 < 70% 时）
对每个候选点 c 打分：
  - 危险：对每个危险区 h，算 tReach=|c-当前|/spd，以及 c 是否在 h 范围内。
          若 c 在 h 内且 h.left < tReach+0.15 → −∞（来不及）；若在 h 内但 h.left 还早 → −k·(1/h.left)（软惩罚，允许"先打再走"）
  - 能否输出：c 在攻击距离内且有视线 → +A（近战 A 更大）；同时考虑首领朝向（避开 bossFacing 的正面和尾扫）
  - 风筝：远程按 kite 惩罚离非目标敌人太近
  - 位移成本：−λ·距离；墙角和障碍边缘扣分
  - 目标锁定：0.4 秒内只有新最优分比当前高 15% 以上才切换（滞回）
关键：危险区还没到"必须走"的时刻时，留在原地继续输出（延迟躲避）
```

- **指标**（写进 sim 报表）：
  - 首领战的输出时间占比（`uptime`）：近战 ≥ 70%，远程 ≥ 80%；
  - 每个技能的"躲开率"：玩家站在范围内的次数 ÷ 释放次数；
  - 无效移动距离。
- `gaze`（别动）、`mindControl`（反向操作）、`fear`（强制逃跑）这类机制通过状态位直接覆盖控制器输出。

### 4.4 伤害管线和受伤规则

```
dealDamage({src, tgt, amt, tags:['atk'|'skill'|'dot'|'pet'|'ult'|'env'], noCrit, forceCrit})
 1) 基础值 amt（调用方已乘好技能倍率）
 2) 攻击方加成：src.stats 的分桶 → 加法桶（同类相加）→ 乘法桶（atkMul、bossDmg、条件乘区）
 3) 暴击（src.stats.crit + 状态加成）
 4) 受击方：status 的 taken 系数、首领护盾（reflect/reduce/immune）、联动减伤（护卫存活时 ×0.8）
 5) 护盾 → 血量；记录到 w.log（按来源和标签统计伤害，DPS 表和 sim 报表都用它）
 6) 命中触发（燃烧/冻结/连锁/吸血），用 depth 计数防止无限递归（≤2）
```

- `G.pm`（等级加成）和 `st.*` 全部从 **src** 的数据里读，所以队友和宠物的伤害归属正确。
- **玩家受伤**：取消 0.7 秒的全局无敌帧，改成**按来源分别冷却**：
  - `srcCd[src.id]`：贴身伤害 0.7 秒；
  - 池子每 0.5 秒跳一次；
  - 预警只结算一次；
  - 弹道不设冷却。
  - 只保留"复活或大招后的短暂无敌"这种显式的 `status.invuln`。
  - 这样就能删掉所有 `pl.inv=0;hurt()` 的写法（A12）。

### 4.5 碰撞和寻路

- 房间是矩形，障碍也是少量矩形，现有的 `pushOut` 加上 `cluster`/`setWp` 拐角法够用，**保留**。
- 小怪寻路：每间房建一张 8px 的网格（192×256 的房间只有 768 个格子），每 0.25 秒从每个英雄位置做一次 BFS 生成流场。小怪顺着梯度走，不会再被卡住，`setWp` 也可以不用了。代价很小。
- `OBS` 改成 `w.room.obs`；走廊阶段改成 `w.corridor.obs`，不再用全局 `concat`。

### 4.6 性能

| 热点 | 做法 | 预期效果 |
|---|---|---|
| 敌人推开 O(n²)、`nearest` 线性扫描 | `core/grid.js` 空间哈希（32px 一格，每步重建一次）；`nearest/query(rect)` 都走它 | 300 只怪时从约 4.5 万次距离计算降到约 2000 次 |
| 每帧 `filter` 产生新数组 | 原地交换删除 `swapRemove`；`aliveCount` 增量维护 | GC 抖动明显减少 |
| 粒子、伤害数字、特效 | 对象池 + 按画质设上限：粒子高/中/低 450/250/120，特效 80，数字 90，敌方弹道 400 | 低端机稳住 |
| `drawTiles` 每帧约 300 次 | `startFight` 时把整间房（瓦片 + 装饰 + 障碍底座）按 K 倍预渲染到离屏画布，每帧 1 次 `drawImage`；走廊阶段保持实时绘制 | 绘制调用 −90% |
| `glow()` 每次新建渐变 | 预生成几张发光贴图（按颜色缓存），用 `lighter` 叠加绘制 | — |
| `hud()` 每帧写 DOM | 过渡期先做脏值检查（值没变就不写）；最终换成画布 HUD | 消除每帧的样式重算 |
| 启动时 `darkBox` 对每帧做 `getImageData` | 挪到美术管线离线处理（第 5 节） | 启动快 1~2 秒（低端安卓） |

---

## 5. 渲染与美术管线

### 5.1 画布分层（统一以后）

| 层 | 内容 | 实现 |
|---|---|---|
| L0 房间底图 | 瓦片 + 装饰 + 静态障碍底座 | 每间房一张离屏画布（K 倍分辨率） |
| L1 地面 | 危险区预警、池子、法阵、阴影 | 主画布 |
| L2 实体 | 英雄、队友、敌人、机关、宠物，按脚底 y 排序 | 主画布 |
| L3 叠加特效 | 刀光、爆炸、光束、发光（`lighter`） | 主画布 |
| L4 弹道和数字 | 敌我弹道、伤害数字（位图字体） | 主画布 |
| L5 屏幕效果 | 受击红屏、闪白、厄运暗角 | 主画布 |
| L6 HUD / UI | 血条、技能按钮、首领血条和读条、buff 栏、小地图、菜单 | 同一个画布最后绘制（微信只能有一个上屏画布） |

- 逻辑分辨率宽度固定 195，**高度按屏幕比例变化**（`H=195*screenH/screenW`）。长屏手机能看到更多纵向内容；UI 贴边布局。
- `K=2*dpr`（上限 2），沿用现有设定。iOS 上单张画布不要超过约 4096px 边长或 1600 万像素，所以**不要把整关预渲染**，按房间缓存。

### 5.2 精灵表规范

| 类别 | 格子大小 | 屏幕显示尺寸（逻辑 px） | 必需帧（最低档 → 完整） |
|---|---|---|---|
| 英雄 | 96×96 | 约 25 | 走路 4、连击 3 段 × 4、正面和背面（走路 4 + 攻击 4）；可选：施法 4、受击 1、死亡 4 |
| 小怪 | 64×64（`mobs2`、`mobsAtk` 现在是 96，要统一） | 17 | T1：待机 1、走路 2、攻击 1；T2：走路 4、攻击 3、死亡 3 |
| 精英 | 复用小怪的图（spec 规定精英 = 小怪 ×4 血）+ 程序放大和描边光 | 26 | — |
| 首领 | 128×128；巨型首领 192 | 54~64 | T1：待机、移动、攻击、施法各 1；T2：各 4 帧；形态（`form`）单独成组 |
| 特效 | 64×64，黑底 | — | 序列帧可选 4~8 帧 |
| 弹道 | 32×32，**朝右** | 10~18 | 1~2 帧 |
| 图标 | 64×64 | — | — |
| 瓦片 | 4×4 网格，每格 64px，整张 256 | 16 | 沿用现有 |

- **锚点**：脚底中心固定在格子的 (0.5, 0.92)；角色身高占格子高度的 72%（现有 `ak=1/.72` 的约定）。这两点**由管线写进图里**，运行时不再做测量和对齐。
- **命名**：键名为 `<类别>/<id>/<状态>/<帧>`，例如 `mob/core_hound/walk/2`、`boss/onyxia/fly/0`、`hero/mage/down/atk/3`。
- **打包**：按团本打成图集，`atlas_mc.png` 配 `atlas_mc.json`：

  ```json
  {"frames":{"mob/core_hound/walk/0":{"x":0,"y":0,"w":64,"h":64,"ax":32,"ay":59}}, "anims":{"mob/core_hound/walk":{"fps":8,"n":4}}}
  ```

  77 张合图会变成约 7 个团本包加几个公共包（英雄、特效、UI）。
- **压缩**：调色板 PNG8（pngquant `--quality 70-90`）。像素图通常能减小 60~80%。`anime.png` 是立绘不是像素图，改成 JPG 加单独的 alpha，或者降到 192px。

### 5.3 GPT 生图 → 抠图 → 对齐，全部脚本化（node 运行）

```
tools/art/
  cut.mjs        按 art_todo 里声明的网格（如 4×3）切格，不靠自动检测；检查格子数
  key.mjs        抠绿：|G−max(R,B)|>阈值 → 透明；去绿边：G=min(G,max(R,B))；边缘 1px 内收；黑底特效用 cleanFx 的规则（去底噪、四边渐隐）
  measure.mjs    darkBox（和运行时同一套算法）：身高、脚底、头顶、重心
  normalize.mjs  按 72% 身高和统一脚底、重心缩放平移；走路帧只平移不缩放；正面和背面走路按头顶对齐（复刻 normAnim 的规则）
  pack.mjs       图集打包、写 json、算内容哈希、更新 manifest
  report.mjs     生成 report.html：每帧画锚点十字和身高线，标出贴边被裁、残留纯绿、帧数不符
```

- 依赖只加一个：`sharp`（开发依赖，速度快）。
- **一键执行**：`node tools/art/run.mjs mobs_mc_1`，输入 `art-src/mobs_mc_1.png`，输出 `art/atlas_mc.*`，同时打开报告页人工确认。
- 运行时的 `darkBox/refit/fitPose/rowFit/normAnim/cleanFx` 和启动时的 `scale2x`（给程序像素图用）都可以删掉，或者只在开发模式下保留。

### 5.4 动画状态机

```
anim.state 的优先级：death > hit(0.12s) > cast > atk(1/2/3 段) > walk > idle
方向：side / up / down；朝向 face 有 0.12 秒滞回（沿用）
缺帧时回退：比如 cast 没有图 → 用 atk → 再用 idle，同时叠加程序动画（放大 1.06 + 抖动）
             walk 只有 1 帧 → 程序摇摆（就是现在 e.art 的呼吸、摇摆、压扁那套，保留为回退）
形态 form：首领阶段形态覆盖整套动画（boss/onyxia/fly/*）
```

- 帧时间和帧数来自 manifest 的 `anims`；攻击动画只负责表现，伤害仍然在出手瞬间结算。可选字段 `hitFrame` 以后再加。

### 5.5 特效系统

- `content/fx.json`：`{"explosion":{"frames":"fx/explosion","blend":"lighter","T":0.35,"grow":1.4,"spin":0}}`。
- 调用方传特效名：`fx(w,'explosion',x,y,size)`。删掉 `RING_FX` 那种"用颜色字符串反查贴图"的写法（`rings` 的 `col` 映射到贴图），改成调用时直接写特效名。
- 危险区的绘制样式由 `shape` 加"语义颜色"决定（8.4），不再由技能名临时决定。

---

## 6. 平衡与测试

### 6.1 安全网（第一天就做）

`tools/check.mjs`（约 60 行）：
1. 从 `game.html` 或 `src/*.js` 提取脚本，用 `node --check` 检查语法；
2. **禁止代码行后面带 `//` 行尾注释**（正则 `[;)}\]]\s*\/\/`），禁止三元表达式中间换行接注释；
3. 新代码单行不超过 220 字符（旧代码登记为豁免）；
4. 在 node 里执行原来那段 `console.assert` 自检，任何一条失败就返回非零退出码；
5. **冒烟渲染**：用桩画布运行 600 步，统计 `drawArt/drawSpr` 的调用次数。如果有贴图怪物但调用次数为 0 就失败，专门防"注释吞代码"。

### 6.2 headless 模拟器（放进仓库）

- **用法**：`node tools/sim.mjs --raid mc --boss all --cls all --seeds 1-30 --pick random|greedy --acc 1|exp --gear none|exp`
- **实现**：用 `vm` 载入逻辑脚本，注入 `platform/node.js`；固定步长，不渲染；每局有步数上限（防死循环）；用 `worker_threads` 并行。
- **输出**：每个职业 × 每关的表（markdown + CSV），包括：
  - 胜率、平均用时、各房间用时、首领击杀用时与 `enrage` 的比值；
  - 死因（最后一击的来源和技能键）；
  - 输出（按来源：普攻 / 技能 / 宠物 / 大招）、承伤（按来源）；
  - 输出时间占比（uptime）、每个首领技能的命中率；
  - 选卡分布（哪张卡和胜率相关性最高）。
- **规模估算**：一关约 5 分钟游戏时间，即 1.8 万步。9 职业 × 59 关 × 30 种子约 1.6 万局，8 线程大约 1~2 小时，夜间跑。CI 只跑冒烟集：9 职业 × 每个团本的第 1 个首领 × 3 种子，约 2 分钟。

### 6.3 回归测试

- **黄金快照**：`test/golden/<cls>_<boss>_<seed>.json` 记录 `{steps, kills, dealt, taken, win}`。代码改动导致快照变化时，CI 显示差异；如果是有意的平衡改动，用 `--update` 刷新。
- **不变量**（每一步都检查）：
  - 不出现 NaN 血量；
  - 实体不跑出房间；
  - 首领在 120 秒内每个技能至少放过一次；
  - 危险区 `T≥0.6`；
  - 实体数不超过上限；
  - 在没有狂怒、玩家又不输出的情况下，一局在 enrage+30 秒内结束。

### 6.4 统一的难度曲线

把散落各处的 `DIFF`、`hpCurve`、`CH_HP`、`BOSS_CH`、`CH_DMG`、`LV_STEP`、`BIG_HP`、`MINI_HP`、`BOSS_DMG` 全部收进 `content/balance.json`，公式只写在一个地方：

```
tier = 团本在全体团本中的 order（0..N）；frac = 关内进度（房间 i / rooms）
期望战力  E(tier) = (1+g_meta)^tier          // 局外养成带来的期望增长，g_meta≈0.06
小怪血量  = MOB_BASE × mob.hp × hpCurve(p) × E(tier) × DIFF.hp
首领血量  = BOSS_BASE × boss.hp × E(tier) × partyHp(n)        // partyHp(1,2,3)=1, 1.7, 2.3
伤害      = BASE × def.dmg × (1+0.035·tier) × DIFF.dmg            // 伤害涨得比血量慢，难度更多来自机制
刷怪数量  = round((ROOM_BASE + 2·i) × DIFF.quota × partyCount(n)), 上限 60 // 跟 L 无关
狂怒      = boss.enrage（数据），与 L 无关
召唤数量  = 技能 p.n（数据），与 L 无关
关内 p    = raidFrac × LV_STEP × 2 + i×5/(rooms−1)     // 现有公式保留，只用在关内
```

- **目标**：在期望战力、随机选卡的情况下，首通胜率 55~75%；首领击杀用时约为 enrage 的 0.7 倍。战力只有期望的 0.8 倍时胜率 ≥ 30%；1.5 倍时 ≤ 98%（仍然要躲技能）。
- 每次调整都用 `sim --sweep DIFF.hp=1.5:2.0:0.1` 扫参，选出最接近目标曲线的值。

---

## 7. 局外养成与经济

### 7.1 账号等级

- **范围**：经典旧世上限 60；燃烧的远征上线后上限 70，巫妖王之怒 80（和团本门槛一致）。
- **经验来源**：
  - 首领首通：600 + 30·tier；
  - 重复通关：首通值的 20%，同一个首领每天前 3 次全额，之后 10%（防止刷）；
  - 每日任务、首胜。
- **曲线**：`need(lv)=300+20·lv`。1 → 60 共需 Σ=59×300+20×1770=**53,100**，大约等于"经典 59 个首领首通（约 38,000）+ 约 120 次重复"，恰好在打完纳克萨玛斯时到 60 级。（现在的曲线需要 77,880 经验、约 500 次通关，A20。）
- **奖励**：**不再直接加百分比属性**（去掉 `a*.015`）。改成：
  - 每级 +1 天赋点（小天赋树，总加成上限 +15%）；
  - 解锁内容：组队栏位、背包格、强化上限、海克斯刷新次数。

### 7.2 装备

- **部位**：武器、头部、胸甲、腿甲、饰品，沿用 `SLOTS`。
- **物品等级**（来自团本数据的 `ilvl`）：熔火之心 66、奥妮克希亚 68、黑翼之巢 70、祖尔格拉布 65、安其拉废墟 66、安其拉神殿 75、纳克萨玛斯 80；燃烧的远征 100~150，巫妖王之怒 180~250（按 tier 线性）。
- **属性预算（战力点 PP）**：`PP(item)=ilvl × rarity系数 × 部位系数`
  - 稀有度系数：优秀 1.0 / 精良 1.3 / 史诗 1.7 / 传说 2.2（沿用 `RAR`）；
  - 部位系数：武器 1.0 / 胸甲 0.8 / 腿甲 0.7 / 头部 0.7 / 饰品 0.6。
- **属性兑换率**（PP 换成属性的比例）：1% 攻击 = 1PP，1% 生命 = 0.7PP，1% 暴击 = 1.2PP，1% 技能伤害 = 0.9PP，1% 冷却缩减 = 1.5PP，1% 移速 = 0.8PP。
  - 主属性取 PP 的 60%，副属性 1~2 条随机分配剩下的 40%。
  - **好处**：任意两件装备可以直接比较；`power()`（目前没用上）就等于 ΣPP 加天赋，可以用来显示"推荐战力"。
- **数据**：`content/gear.json`：`{slots, rarity, affixPool, rates, sets:{"mc":{"name":"熔火","2":{...},"4":{...}}}}`，**套装用团本 id 当键**。

### 7.3 套装

- 每个团本一套，2 件 / 4 件效果。
  - 2 件效果是数值；
  - 4 件效果是**改变玩法**，复用海克斯的开关，例如 `fireNova`、`missiles`、"击杀刷新技能"，这样能和局内构筑产生互动。
- 4 件效果的数值同样要计入 PP，**4 件效果约等于 1.5 件装备的预算**。

### 7.4 掉落

- **每个首领一张掉落表**：`{"slots":["wpn","chest"],"set":"mc","setChance":0.35,"rarityW":[40,35,20,5]}`。
- **首通必掉 1 件精良以上的本团套装件**。
- **保底**：同一团本连续 N 次没出套装件，套装概率每次 +10%。
- **同部位去重**：同一套装的同部位优先给缺的那件。

### 7.5 分解与强化（先做分解，解决 A15）

- **分解**：按稀有度得到"奥术之尘 / 精华 / 碎片"。背包满时**自动分解**最低稀有度、非套装、未锁定的装备并提示，**永远不删除**。
- **强化**：+0 到 +10，每级 +3% 基础属性，花费指数递增，**不会失败**（休闲手游）；强化上限受账号等级限制。
- **重铸副属性**：以后再做。

### 7.6 存档版本和迁移

```js
PROG = { v:2, acc:{lv,xp}, talents:{}, hero:'mage',
         prog:{ "mc/lucifron":{clr:1,best:83,cls:'mage',first:1730000000} },   // 按 id 记录，不再用下标
         unlocked:["mc"], inv:[{id,base,slot,rar,ilvl,set:'mc',st:{},enh:0,lock:0}], eq:{wpn:12},
         party:['paladin','bard'], mats:{dust:0}, settings:{}, daily:{} }
MIG = [ /*0→1*/ p=>{...}, /*1→2*/ p=>{ /* 用冻结的旧 RAIDS 顺序表把 L 下标映射到 id；ri→raidId；set 的数字下标→团本 id */ } ]
load(): 读取 → 写备份 'abyss-prog.bak' → 按 v 依次迁移 → 校验（坏的物品移到 quarantine，不删除）→ 保存
```

- 旧版 12 关是原创首领，新版里不存在，所以迁移时**保留"解锁到第 N 个团本"的语义，丢弃旧的最佳用时**，并弹一次提示。
- 保存时防抖 500ms；微信上用 `wx.setStorageSync`（每个用户 10MB，单个键 ≤1MB，够用）。
- 设置里提供"导出 / 导入存档码"（base64 + 校验位），用于换设备。云存档等到云开发阶段再做。

### 7.7 防止局外养成破坏局内平衡

1. 内容难度**只按 tier 增长**，不跟玩家实际战力挂钩（不做等级同步），这样刷装备是有意义的。
2. 平衡按"期望战力 E(tier)"调（6.4）；模拟器用 `--acc exp --gear exp` 生成期望配装。
3. 局外加成放进伤害管线里**独立的 meta 乘区**；和海克斯的乘区按设计相乘，并在报表里单独列出，方便看清楚放大来自哪里。
4. **AI 队友的战力**：取玩家战力的 70%（不单独管理队友装备，最懒且可控）；首领血量按 `partyHp(n)` 放大。

---

## 8. UI/UX 与流程

### 8.1 主界面信息架构（HTML 里已经有 `#hub/#nav`，现在刚接上 JS）

| 页 | 内容 | 细节 |
|---|---|---|
| **人物** | 立绘（`anime` 或 `heroes`）；5 个装备格环绕立绘；职业切换（9 个）；属性面板（战力 PP、攻击、生命、暴击、技能、冷却、移速，每项可点开看来源）；套装进度（2/4 件高亮）；流派图鉴入口 | 格子上的红点表示有更好的装备；长按装备格显示对比 |
| **副本** | 资料片页签（经典 / 燃烧的远征 / 巫妖王之怒）→ 团本卡片（插画横幅、进度 x/10、锁定原因如"需要账号 60 级"）→ 团本地图节点（现有 `raidNodes`）→ 首领详情面板 | 详情面板包括：技能列表（图标、名字、一句话说明）、掉落预览、最佳用时、**推荐战力 vs 当前战力**、"出发"（确认职业和队伍） |
| **背包** | 5 列网格；按部位、稀有度、套装筛选；排序；物品详情（和已穿装备对比，属性前面标 ▲▼）；装备、分解、锁定、强化；批量分解 | 显示容量 x/60；满了以后提示自动分解规则 |
| **组队** | 3 个位置（自己 + 2 个 AI）；给 AI 选职业；提示职业搭配（坦克 + 治疗） | 队友战力 = 你的 70%；后期加入"好友支援角色"（9.6） |
| **设置** | 音乐和音效音量（分开）、震屏、震动、伤害数字开关和合并、画质（粒子上限）、自动大招、左手模式、版本号、存档导出和导入、重置 | — |

### 8.2 流程和引导

- **首次启动直接进入 1-1 的教学房间，不经过主界面**：
  - 前 3 个房间只有近战小怪；
  - 第 1 次选海克斯时有手指动画引导；
  - 第一个首领的第一个预警技能出现时放慢到 0.5 倍速，弹出"站到圈外"。
- **通关后出现主界面**，"人物"页签带红点（新装备），引导穿上。
- **逐步解锁**：背包在第一次掉落后出现；组队在第 1 个团本通关后；强化在账号 10 级；资料片按账号等级。
- **第一次见到某个机制**（按机制键记录）：在战斗中显示一次性的提示卡（2 秒，可点击关闭），比如"带着炸弹远离小怪"。内容来自首领数据的 `tip`。

### 8.3 局内 HUD

- 左上：血量、护盾、经验、等级。
- 顶部中间：首领血条（多首领时堆叠，最多 4 条，每条带名字）+ **读条**（技能名，可打断的显示"可打断 3/5"）+ 狂怒倒计时（最后 10 秒血条闪烁）。
- 血条下方：buff/debuff 图标行（来自 `STATUS` 表：图标、层数、倒计时环）。
- 右上：小地图，**要避开微信右上角的胶囊按钮**。
- 右下：技能和大招；左下：海克斯、暂停（暂停菜单里放音量和返回）。
- 首领头顶显示技能名（现有的 `b.say`）；**重要机制**同时在屏幕中间显示红字横幅（数据里标记 `major:true`）。

### 8.4 可读性：预警的语义颜色（全局统一）

| 颜色 | 含义 | 示例 |
|---|---|---|
| 红 | 伤害，必须躲开 | 熔岩喷发、吐息、裂隙 |
| 紫 | 控制（恐惧、支配、昏迷） | 低沉咆哮、支配心灵 |
| 蓝 | 冰冻、减速 | 冰霜冲击、冰霜吐息 |
| 黄 | 需要站进去或分摊（正确站位才安全） | 极性、安全区、印记 |
| 绿 | 有益（治疗、增益区） | 孢子之力、圣光区域 |

- 填充从中心往外长到边缘就表示生效；最后 0.2 秒边框闪白。
- 预警时间 `T≥0.6` 由 `validate.mjs` 强制检查。
- 预警填充透明度不超过 0.25，避免遮住人物；人物描边始终画在预警上层。

### 8.5 反馈

- **顿帧**：暴击终结技、首领转阶段时**只冻结渲染时间 40ms**，游戏逻辑不停，保证确定性。
- **震动**：`PF.vibrate`。被打掉 20% 以上血量 15ms，大招 30ms，首领转阶段 50ms；设置里可以关。
- **伤害数字合并**：同一目标 0.1 秒内的伤害合并显示；暴击用大号金色；数字用位图字体。
- **音效**：首领每个"重要技能"有专属的预警音，预警刚出现时就播放（听声音也能躲）。

### 8.6 移动端手势和安全区

- **摇杆**：浮动式，死区 0.15，松手回到自动模式；用 `setPointerCapture`；技能和大招按钮使用独立的触点（多点触控）。
- **安全区**：
  - 网页：`viewport-fit=cover`（`game.html` 的 meta 里没有，只有 `index.html` 里有）+ `env(safe-area-inset-*)`；
  - 微信：`wx.getSystemInfoSync().safeArea` + `wx.getMenuButtonBoundingClientRect()`（胶囊按钮）。
- **左手模式**：技能和大招按钮镜像到左边。

---

## 9. 微信小游戏移植

### 9.1 没有 DOM 时的 UI

- 官方的 `weapp-adapter` 只模拟 `document/canvas/Image/addEventListener`，**不做 HTML 排版**。现有的 `innerHTML` 菜单、CSS 动画、`clip-path` 卡面、SVG 图标在微信里都不可用。
- **方案**：自己写一个即时模式的画布 UI（`ui/kit.js`，约 500 行），包括面板、九宫格、按钮（按下和抬起在同一个控件上才算点击，复刻现在的 `pickDown` 逻辑）、自动换行的文本、图片、可惯性滚动的列表、页签、弹窗、简单动画（线性插值）。点击检测用每帧重建的矩形列表。
- **网页版也走这一套**，只维护一份 UI 代码；DOM 只留给开发调试面板。
- **SVG 图标**（`ICON` 约 20 个）：用管线渲染成 PNG 图集。
- **字体**：中文用系统字体；数字和英文用位图字体图集（"Press Start 2P" 风格）。不再依赖 Google Fonts（A17）。
- **建议在网页阶段就完成 UI 替换**（M9），移植时只需要换平台层。

### 9.2 平台层 `platform/wx.js`

| 能力 | 网页 | 微信 |
|---|---|---|
| 主画布 | `#c` | `wx.createCanvas()`（第一次调用的是上屏画布） |
| 离屏画布 | `document.createElement('canvas')` | `wx.createCanvas()` 或 `wx.createOffscreenCanvas()` |
| 图片 | `new Image()` | `wx.createImage()` |
| 输入 | pointer 事件 | `wx.onTouchStart/Move/End/Cancel`（`changedTouches` 里的 `identifier`） |
| 存储 | `localStorage` | `wx.setStorageSync/getStorageSync` |
| 帧回调 | `requestAnimationFrame` | 全局 `requestAnimationFrame` |
| 震动 | `navigator.vibrate` | `wx.vibrateShort({type:'light'})` |
| 前后台 | `visibilitychange` | `wx.onShow/onHide`（同时暂停音频和游戏） |
| 系统信息 | `devicePixelRatio`、`innerWidth` | `wx.getSystemInfoSync()`、安全区、胶囊按钮 |

### 9.3 音频

- **第一方案**：在 `tools/` 里用 OfflineAudioContext 把合成的音效和两首曲子**预渲染成 ogg/mp3**（每个几 KB 到几十 KB）。微信端用 `wx.createInnerAudioContext` 做对象池（同时最多约 8 个），`wx.setInnerAudioOption({obeyMuteSwitch:false})`。
  - 音乐预渲染之后，就可以按团本做风格（`look.music`）。
- **备选**：`wx.createWebAudioContext()`，**需要真机测试**振荡器、滤波器、`exponentialRamp` 是否完整支持。网页开发继续用现有合成器，不受影响。

### 9.4 分包和资源大小

- **限制（以官方当前文档为准）**：主包 ≤ 4MB，总包 ≤ 30MB；单个用户的本地缓存目录有大小限制。
- **建议**：
  - 主包：代码打包（约 300KB）+ UI 和英雄图集 + 第一个团本（熔火之心）。压缩后预计 2.5~3.5MB，可以离线开第一局。
  - 其他团本：放 **CDN 远程资源**，文件名带哈希；用 `wx.downloadFile` 下载到 `wx.env.USER_DATA_PATH`；按团本按需下载，**在副本详情页"出发"之前预取并显示进度**。
  - 或者用分包（`wx.loadSubpackage`）按资料片划分。CDN 更灵活，分包更省事，二选一。
- **预算估算（PNG8）**：首领每个 4 帧 × 128² ≈ 30KB × 150 ≈ 4.5MB；小怪约 120 种 × 4 帧 × 64² ≈ 2MB；瓦片 20 套 × 60KB ≈ 1.2MB；特效和图标约 1MB。**总计约 9MB**，可行。

### 9.5 广告（激励视频）

- 接口：`PF.ad.rewarded(place) → Promise<boolean>`。网页继续用现有的倒计时模拟（`showAd`）。
- 微信实现：
  - 全局只创建一个 `wx.createRewardedVideoAd({adUnitId})`，提前 `load()`；
  - `show()` 时暂停游戏和音频；
  - `onClose(res)` 里只有 `res && res.isEnded` 才发奖励；
  - `onError` 时隐藏广告按钮，不阻塞流程。
- **插入点和频率**：

  | 场景 | 频率 |
  |---|---|
  | 死亡复活（已有） | 每局 1 次 |
  | 海克斯单卡刷新（已有） | 每次选卡 3 次 |
  | 首通奖励翻倍 | 不限 |
  | 每日额外宝箱 | 每天 1 次 |
  | 背包扩容 | — |

  - 广告不放在战斗中，不打断游戏。

### 9.6 组队联网（分阶段）

1. **现在：AI 队友**（第 4 节），零联网。
2. **异步组队（性价比最高）**：把玩家的"角色快照"（职业、战力、套装、外观）上传到微信云开发数据库；好友或路人可以把这个快照**招募为 AI 队友**，通关后双方都拿到少量奖励（社交裂变）。不需要实时同步，用的就是同一个 `AutoCtrl`。
3. **实时联机（以后）**：
   - **帧同步（锁步）**：要求所有客户端完全确定性。风险是 V8（安卓）和 JavaScriptCore（iOS）上 `Math.sin/cos/atan2/hypot/exp` 的结果**不保证逐位一致**。如果走这条路，三角函数要换成查表或自己实现，随机数必须全部走种子。
   - **主机权威的状态同步（推荐）**：一名玩家的客户端当主机，或者用云托管的 node 服务器直接跑 headless 模拟（我们会有这个工具）。客户端只上传输入（`{tick, id, mx, my, ult}`，输入很小，因为战斗是自动的）；主机每秒下发 10~15 次增量快照（实体 id、位置、血量、动画状态），客户端插值显示。
   - 通信用 `wx.connectSocket`（WebSocket）。微信曾经提供过小游戏帧同步服务，**请先确认是否还能用，不要依赖它**。
4. **现在就要打好的基础**（这些本来也是模拟和回归需要的，几乎没有额外成本）：
   - 种子随机数分两条流；
   - 输入变成"指令"；
   - 实体 id 是稳定的整数；
   - 逻辑层不读 UI 状态；
   - 固定步长。

---

## 10. 优先级路线图

> 排序依据：收益 ÷ 风险。改动量是估算的有效代码行数。"涉及"一栏写函数名或常量名。

### P0 · 止血（1~2 天，每一项都可以单独部署）

| # | 任务 | 范围 / 涉及 | 改动量 | 验收标准 |
|---|---|---|---|---|
| 1 | **修复已确认的 bug** | `mk`（`_key` 改成不可枚举）、`endPanel`/`show('start')`（`LV[].b.lv` + `rNo`）、`dmg` 里 sfx 的顺序、删除重复的 `visibilitychange`、`GSET` 生命取整、`makeItem` 局部变量改名 | 约 15 行 | 没有美术时，各团本的回退像素怪颜色不同；`?lv=20` 的结算面板和选职业标题正确 |
| 2 | **去掉全局 L 缩放** | `startFight` 的 quota/rate、`update` 的怪潮、`SK.ring/summon/whelps/fly/submerge`、`bossAI` 50% 召唤、`spawnBoss` 的 fury（改成 `d.enrage||60`）、`spawnAt` 的 `G.L>=2` | 约 25 行 | `?lv=59` 时每间房 ≤ 60 只怪、弹幕环 ≤ 24 颗、狂怒时间等于数据值 |
| 3 | **安全网** `tools/check.mjs` + 52 处行尾注释另起一行 + 自检移到 node | 全文件 | 约 60 行脚本 + 52 处格式调整 | 故意制造 v16 那种"吞掉 drawArt"的改动，脚本会失败；`selCls='mage';reset()` 不再在启动时运行 |
| 4 | **资源加载 Promise + 不再拍快照** | `loadArt` 加 `onerror` 并返回 Promise；`G.roster.art`、`G.atlas`、首领 `eart` 改成绘制时取图；"出发"按钮等待加载完成并显示进度 | 约 80 行 | 清缓存 + Slow 3G 下首局所有贴图正确；断网时回退到程序图，不崩溃 |
| 5 | **存档 v2 + 背包不再删除装备** | `PROG.v`、`MIG`、`best/un` 改成按 id 记录、`set` 改成团本 id；`rewardLevel` 满包时自动分解成材料 | 约 90 行 | 用 v17 的旧存档加载，解锁进度不丢；调换 `RAIDS` 顺序后进度不错位；装满 60 件时没有物品消失 |

### P1 · 底座（1~2 周）

| # | 任务 | 范围 / 涉及 | 改动量 | 验收标准 |
|---|---|---|---|---|
| 6 | **拆成多个普通脚本 + version.json 加载器** | M1/M2；`index.html` 不再用 `document.write`；`tools/build.mjs` 生成带哈希的文件名和 manifest | 约 0 行逻辑 + 100 行工具 | 线上行为一致；修改一张图并部署后，客户端立刻拿到新图 |
| 7 | **固定步长 + 种子随机数 + 事件总线 + 游戏内计时器** | `frame`、`rand`→`R.f`/`FXR`、`toast/banner/sfx/$()`→`emit`、`setTimeout`→`after`、`autoDir` 的 `1/30` | 约 250 处机械替换 | `?seed=1` 两次运行结果逐项相同；20fps 节流下游戏时长不变慢 |
| 8 | **headless 模拟 + CI 冒烟** | `tools/sim.mjs`、`platform/node.js`、GitHub Actions | 约 200 行 | 推送后 2 分钟内出报表；失败时阻止部署 Pages |
| 9 | **统一状态和危险区 + 多首领** | `STATUS` 表替代各种 `G.*T`；`w.hazards` 替代 `b.tels/G.etels/G.pools`；`G.bosses[]` 和胜利条件；删除通用 50% 狂暴；按来源计受伤冷却 | 约 300 行 | `danger()` 能识别所有危险源；双首领要都死才通关；buff 栏自动显示 |
| 10 | **快速性能修复** | 房间底图缓存、空间哈希、原地删除代替 filter、`hud()` 脏检查、`glow` 贴图化 | 约 150 行 | 中端安卓机 300 只怪时保持 ≥ 50fps（打开性能面板查看） |

### P2 · 内容规模（3~6 周，可以和美术并行）

| # | 任务 | 范围 / 涉及 | 改动量 | 验收标准 |
|---|---|---|---|---|
| 11 | **团本数据化 + 校验 + 第一批引擎** | `migrate-raids.mjs`、`validate.mjs`、引擎 `tel/mobAbility/phases/enrage/curse/stacks`；删除 `BIG/MINI/ROSTER/ELITE/chOf` 的行为用法 | 约 600 行 + JSON | 熔火之心 10 个首领纯数据跑通；`validate` 全绿；sim 胜率进入目标区间 |
| 12 | **角色对象化 + 控制器 + AI 队友 v2** | `st/pl`→`actor.stats/actor`；删除 `alliesTick`；仇恨；队友用自己的构筑放技能和大招 | 约 400 行 | 3 人队伍里，坦克能稳住首领仇恨，治疗能给血量最低的人加血；队友伤害不再吃玩家的海克斯 |
| 13 | **自动走位重写** | `autoDir/danger` → 采样打分 + 延迟躲避 + 滞回 | 约 150 行 | sim：近战 uptime ≥ 70%、远程 ≥ 80%；被预警命中率比现在低 30% 以上 |
| 14 | **美术管线 node 化 + 图集规范** | `tools/art/*`；删除运行时的 `darkBox/normAnim/cleanFx` | 约 400 行工具 | 一条命令生成熔火之心图集和报告页；启动时间 −1 秒 |
| 15 | **剩余引擎和专用脚本，按团本推进** | 黑翼之巢 → 祖尔格拉布 → 安其拉废墟 → 安其拉神殿 → 纳克萨玛斯 | 每个团本约 1~3 天 | 每个团本：`validate` 绿、sim 达标、作者模式逐个首领验收 |
| 16 | **主界面和装备经济 v2** | PP 预算、掉落表、保底、分解和强化、天赋、新的账号经验曲线；人物、背包、副本详情页 | 约 500 行 | 首通到 60 级大约需要打完经典全部团本；sim `--gear exp` 下胜率曲线平滑 |

### P3 · 移植（2~4 周）

| # | 任务 | 范围 / 涉及 | 改动量 | 验收标准 |
|---|---|---|---|---|
| 17 | **画布 UI 替换 DOM** | `ui/kit` + 选卡、结算、主界面、地图、设置；SVG 图标转 PNG；位图字体 | 约 1000 行 | 网页版删掉 `.ov` 菜单的 DOM 后功能完整 |
| 18 | **微信平台层** | `platform/wx.js`、音频预渲染、存储、安全区和胶囊按钮、前后台切换 | 约 300 行 | 真机预览：完整打通熔火之心，存档正常，iOS 静音键开着也有声音 |
| 19 | **分包或 CDN + 激励视频 + 分享** | `loadPack` 远程化、`PF.ad`、`wx.shareAppMessage` | 约 200 行 | 主包 < 4MB；广告看完发奖、中途关闭不发；离线也能开第一局 |
| 20 | **异步组队（好友支援角色）** | 云开发数据库存快照，招募成 AI | 约 250 行 | 两个账号可以互相招募对方的角色；奖励正确发放 |

**刻意不做**：完整 ECS 或第三方引擎、马上迁移到 TypeScript、React 之类的 UI 框架、Service Worker、实时联机（要等 AI 队友和异步组队验证过再说）、复杂的强化失败或重铸系统。
