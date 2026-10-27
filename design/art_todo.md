# 美术资源清单（由 raids.json 生成）

共 **77 张 GPT 合图**（每张最多 12 格 = 4 列 × 3 行；瓦片集是唯一例外，保持现有 4×4 / 256×256 格式）。

## 背景规则

- 角色 / 怪物 / 首领 / 机关 / 实体道具：**纯绿 #00FF00** 背景（抠图用，精灵内部禁止出现纯绿）
- 发光特效（火焰、光束、法术圈）：**纯黑 #000000** 背景（游戏里用 lighter 叠加）
- 瓦片集：不需要背景（铺满）
- 生成后按现有流程抠图 → 按格切成横排条带（strip）→ 对齐脚底（fitPose/darkBox）。注意：现有 bosses.png / elites.png 抠图后仍残留绿边（第 1、2、4、5、6、7 格明显），新图抠图要加一圈去绿边（despill）。

## 统一风格前缀（每条提示词前都加）

> 16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow

## 现有 art/ 可复用情况

| 现有文件 | 内容 | 可顶替 |
|---|---|---|
| tiles_c1.png | 熔岩洞 | 熔火之心（几乎可直接用） |
| tiles_c2.png | 黑石龙巢 | 奥妮克希亚 / 黑翼之巢（近似） |
| tiles_c3.png | 亡者要塞 | 纳克萨玛斯通用大厅（近似） |
| tiles_c4.png | 虚空神殿 | 安其拉神殿（近似） |
| bosses.png 1~12 | 黑鳞龙后、赤炎巨龙、熔火君主、色彩龙王、双极雷像、黑翼领主、缝合憎恶、瘟疫舞者、冰霜巫妖、孢子君主、千眼之神、深渊君王 | 奥妮克希亚、瓦拉斯塔兹、拉格纳罗斯、克洛玛古斯、塔迪乌斯（需重画）、奈法利安、帕奇维克、希尔盖、克尔苏加德、洛欧塞布、克苏恩；深渊君王无对应 |
| bossesAtk.png | 上面 12 个首领各 1 个攻击姿势 | 同上（只有 2 个姿势，没有走路/施法帧） |
| mobs.png / mobs2.png | 16 种小怪 × 2 姿势 | 熔岩犬→熔火恶犬、火焰小鬼、雏龙、龙人战士→黑翼军团士兵、黑龙教徒→黑龙法师、食尸鬼→感染食尸鬼 等少数 |
| elites.png / elitesAtk.png | 12 精英 × 2 姿势 | 熔岩犬王→上古熔火恶犬等，精英在新结构中改为“小怪 ×4 血”，可不再单独画 |
| props.png | 熔岩喷口、龙蛋、坟墓、虚空裂隙（各 2 态） | 喷口、龙蛋、墓碑 |
| forms.png | 8 帧：奥妮克希亚飞行、奈法利安巨龙、克苏恩本体、克尔苏加德强化、拉格纳罗斯潜入、烈焰之子、冰冠守护者、龙人 | 已在清单中标注；其余形态/召唤物需新画 |
| mobsAtk.png | 小怪攻击姿势（06:01 新增） | 现有 16 种小怪的攻击帧 |

## 资产清单

| 团本 | 类别 | 名称 | 现有可顶替 |
|---|---|---|---|
| 熔火之心 | 瓦片 | 通用 | tiles_c1.png（熔岩洞，可直接复用，建议补一块“火焰符文”地砖） |
| 熔火之心 | 机关 | 熔岩喷口 | props.png 第1-2格 |
| 熔火之心 | 机关 | 熔岩河 | — |
| 熔火之心 | 机关 | 火焰符文 | — |
| 熔火之心 | 机关 | 熔岩之池（拉格纳罗斯） | — |
| 熔火之心 | 小怪（3 格） | 熔火恶犬 | mobs.png 第2格 熔岩犬（近似，单头） |
| 熔火之心 | 小怪（3 格） | 熔岩奔腾者 | — |
| 熔火之心 | 小怪（3 格） | 烈焰行者 | — |
| 熔火之心 | 小怪（3 格） | 熔火巨人 | — |
| 熔火之心 | 小怪（3 格） | 火焰之王 | — |
| 熔火之心 | 小怪（3 格） | 烈焰行者牧师 | — |
| 熔火之心 | 首领（4 格） | 鲁西弗隆 | — |
| 熔火之心 | 召唤物（2 格） | 鲁西弗隆 · 烈焰行者护卫 | — |
| 熔火之心 | 首领（4 格） | 玛格曼达 | — |
| 熔火之心 | 首领（4 格） | 基赫纳斯 | — |
| 熔火之心 | 召唤物（2 格） | 基赫纳斯 · 烈焰行者 | — |
| 熔火之心 | 首领（4 格） | 加尔 | — |
| 熔火之心 | 召唤物（2 格） | 加尔 · 火誓者 | — |
| 熔火之心 | 首领（4 格） | 迦顿男爵 | — |
| 熔火之心 | 首领（4 格） | 沙斯拉尔 | — |
| 熔火之心 | 首领（4 格） | 萨弗隆先驱者 | — |
| 熔火之心 | 召唤物（2 格） | 萨弗隆先驱者 · 烈焰行者祭司 | — |
| 熔火之心 | 首领（4 格） | 焚化者古雷曼格 | — |
| 熔火之心 | 召唤物（2 格） | 焚化者古雷曼格 · 熔火怒犬 | — |
| 熔火之心 | 首领（4 格） | 管理者埃克索图斯 | — |
| 熔火之心 | 召唤物（2 格） | 管理者埃克索图斯 · 烈焰行者精英 | — |
| 熔火之心 | 召唤物（2 格） | 管理者埃克索图斯 · 烈焰行者医师 | — |
| 熔火之心 | 首领（4 格） | 拉格纳罗斯 | bosses.png 第3格 熔火君主（近似，缺锤子与半身入岩浆造型） |
| 熔火之心 | 阶段形态（1 格） | 拉格纳罗斯 · 潜入熔岩 | forms.png 第5格 |
| 熔火之心 | 召唤物（2 格） | 拉格纳罗斯 · 烈焰之子 | forms.png 第6格 |
| 奥妮克希亚的巢穴 | 瓦片 | 通用 | tiles_c2.png（黑石龙巢，近似可复用；需补金币/裂缝地砖） |
| 奥妮克希亚的巢穴 | 机关 | 雏龙蛋 | props.png 第3-4格 龙蛋 |
| 奥妮克希亚的巢穴 | 机关 | 熔岩裂缝 | — |
| 奥妮克希亚的巢穴 | 小怪（3 格） | 奥妮克希亚守卫 | — |
| 奥妮克希亚的巢穴 | 小怪（3 格） | 奥妮克希亚雏龙 | mobs.png 第6格 雏龙（红色，需改黑色） |
| 奥妮克希亚的巢穴 | 小怪（3 格） | 黑龙卫兵 | — |
| 奥妮克希亚的巢穴 | 小怪（3 格） | 黑龙法师 | mobs.png 第8格 黑龙教徒（可复用） |
| 奥妮克希亚的巢穴 | 首领（4 格） | 奥妮克希亚 | bosses.png 第1格 黑鳞龙后（近似可复用） |
| 奥妮克希亚的巢穴 | 阶段形态（1 格） | 奥妮克希亚 · 飞行 | forms.png 第1格 |
| 黑翼之巢 | 瓦片 | 通用 | tiles_c2.png（黑石龙巢，近似；需补实验室/化学桶） |
| 黑翼之巢 | 机关 | 黑龙蛋 | props.png 第3-4格（需黑色变体） |
| 黑翼之巢 | 机关 | 压制装置 | — |
| 黑翼之巢 | 机关 | 化学药剂桶 | — |
| 黑翼之巢 | 小怪（3 格） | 黑翼军团士兵 | mobs.png 第5格 龙人战士（近似） |
| 黑翼之巢 | 小怪（3 格） | 腐化的雏龙 | mobs.png 第6格 雏龙（换色） |
| 黑翼之巢 | 小怪（3 格） | 死爪龙卫 | — |
| 黑翼之巢 | 小怪（3 格） | 黑翼法师 | — |
| 黑翼之巢 | 小怪（3 格） | 黑翼技师 | — |
| 黑翼之巢 | 小怪（3 格） | 黑翼缚法者 | — |
| 黑翼之巢 | 首领（4 格） | 狂野的拉佐格尔 | — |
| 黑翼之巢 | 首领（4 格） | 堕落的瓦拉斯塔兹 | bosses.png 第2格 赤炎巨龙（近似可复用） |
| 黑翼之巢 | 首领（4 格） | 勒什雷尔 | — |
| 黑翼之巢 | 首领（4 格） | 费尔默 | — |
| 黑翼之巢 | 首领（4 格） | 埃博诺克 | — |
| 黑翼之巢 | 首领（4 格） | 弗莱格尔 | — |
| 黑翼之巢 | 首领（4 格） | 克洛玛古斯 | bosses.png 第4格 色彩龙王（近似，缺双头） |
| 黑翼之巢 | 首领（4 格） | 奈法利安 | bosses.png 第6格 黑翼领主 / forms.png 第2格 巨龙形态 |
| 黑翼之巢 | 阶段形态（1 格） | 奈法利安 · 维克多·奈法里奥斯 | — |
| 黑翼之巢 | 召唤物（2 格） | 奈法利安 · 龙人（五色） | forms.png 第8格（单色，需补 5 色变体） |
| 祖尔格拉布 | 瓦片 | 通用 | 无（需新做） |
| 祖尔格拉布 | 机关 | 蜘蛛卵 | props.png 第3-4格（换色换皮） |
| 祖尔格拉布 | 机关 | 豹笼 | — |
| 祖尔格拉布 | 机关 | 血祭祭坛 | — |
| 祖尔格拉布 | 机关 | 毒血池 | — |
| 祖尔格拉布 | 小怪（3 格） | 古拉巴什狂暴者 | — |
| 祖尔格拉布 | 小怪（3 格） | 祖利安猛虎 | — |
| 祖尔格拉布 | 小怪（3 格） | 拉扎什寡妇蛛 | — |
| 祖尔格拉布 | 小怪（3 格） | 古拉巴什掷斧者 | — |
| 祖尔格拉布 | 小怪（3 格） | 哈卡莱巫医 | — |
| 祖尔格拉布 | 小怪（3 格） | 古拉巴什蝙蝠骑士 | — |
| 祖尔格拉布 | 首领（4 格） | 高阶祭司耶克里克 | — |
| 祖尔格拉布 | 阶段形态（1 格） | 高阶祭司耶克里克 · 蝙蝠形态 | — |
| 祖尔格拉布 | 召唤物（2 格） | 高阶祭司耶克里克 · 血顶蝙蝠 | — |
| 祖尔格拉布 | 首领（4 格） | 高阶祭司温诺希斯 | — |
| 祖尔格拉布 | 阶段形态（1 格） | 高阶祭司温诺希斯 · 巨蛇形态 | — |
| 祖尔格拉布 | 召唤物（2 格） | 高阶祭司温诺希斯 · 拉扎什眼镜蛇 | — |
| 祖尔格拉布 | 首领（4 格） | 高阶祭司玛尔里 | — |
| 祖尔格拉布 | 阶段形态（1 格） | 高阶祭司玛尔里 · 蜘蛛形态 | — |
| 祖尔格拉布 | 召唤物（2 格） | 高阶祭司玛尔里 · 玛尔里幼蛛 | — |
| 祖尔格拉布 | 首领（4 格） | 血领主曼多基尔 | — |
| 祖尔格拉布 | 阶段形态（1 格） | 血领主曼多基尔 · 下马 | — |
| 祖尔格拉布 | 召唤物（2 格） | 血领主曼多基尔 · 奥根 | — |
| 祖尔格拉布 | 首领（4 格） | 格里雷克 | — |
| 祖尔格拉布 | 首领（4 格） | 哈扎拉尔 | — |
| 祖尔格拉布 | 首领（4 格） | 雷纳塔基 | — |
| 祖尔格拉布 | 首领（4 格） | 乌苏雷 | — |
| 祖尔格拉布 | 首领（4 格） | 高阶祭司塞卡尔 | — |
| 祖尔格拉布 | 阶段形态（1 格） | 高阶祭司塞卡尔 · 猛虎形态 | — |
| 祖尔格拉布 | 召唤物（2 格） | 高阶祭司塞卡尔 · 狂热者洛卡恩 | — |
| 祖尔格拉布 | 召唤物（2 格） | 高阶祭司塞卡尔 · 狂热者札斯 | — |
| 祖尔格拉布 | 首领（4 格） | 加兹兰卡 | — |
| 祖尔格拉布 | 首领（4 格） | 高阶祭司娅尔罗 | — |
| 祖尔格拉布 | 阶段形态（1 格） | 高阶祭司娅尔罗 · 黑豹形态 | — |
| 祖尔格拉布 | 召唤物（2 格） | 高阶祭司娅尔罗 · 祖利安猎豹 | — |
| 祖尔格拉布 | 首领（4 格） | 妖术师金度 | — |
| 祖尔格拉布 | 召唤物（2 格） | 妖术师金度 · 强力治疗结界 | — |
| 祖尔格拉布 | 召唤物（2 格） | 妖术师金度 · 洗脑图腾 | — |
| 祖尔格拉布 | 召唤物（2 格） | 妖术师金度 · 金度之影 | — |
| 祖尔格拉布 | 召唤物（2 格） | 妖术师金度 · 献祭骷髅 | — |
| 祖尔格拉布 | 首领（4 格） | 哈卡 | — |
| 祖尔格拉布 | 召唤物（2 格） | 哈卡 · 哈卡之子 | — |
| 安其拉废墟 | 瓦片 | 通用 | 无（需新做） |
| 安其拉废墟 | 机关 | 流沙陷阱 | — |
| 安其拉废墟 | 机关 | 布鲁之卵 | — |
| 安其拉废墟 | 机关 | 黑曜石水晶 | — |
| 安其拉废墟 | 机关 | 沙尘龙卷 | — |
| 安其拉废墟 | 机关 | 虫巢土丘 | props.png 第5-6格 墓穴生怪逻辑可复用（需重画） |
| 安其拉废墟 | 小怪（3 格） | 其拉角斗士 | — |
| 安其拉废墟 | 小怪（3 格） | 札拉蜂巢毒刺者 | — |
| 安其拉废墟 | 小怪（3 格） | 札拉蜂巢黄蜂 | — |
| 安其拉废墟 | 小怪（3 格） | 阿努比萨斯守卫者 | — |
| 安其拉废墟 | 小怪（3 格） | 黑曜石毁灭者 | — |
| 安其拉废墟 | 小怪（3 格） | 尖啸甲虫 | — |
| 安其拉废墟 | 首领（4 格） | 库林纳克斯 | — |
| 安其拉废墟 | 首领（4 格） | 拉贾克斯将军 | — |
| 安其拉废墟 | 召唤物（2 格） | 拉贾克斯将军 · 其拉战士 | — |
| 安其拉废墟 | 召唤物（2 格） | 拉贾克斯将军 · 虫群卫士针刺者 | — |
| 安其拉废墟 | 召唤物（2 格） | 拉贾克斯将军 · 奎兹上尉 | — |
| 安其拉废墟 | 召唤物（2 格） | 拉贾克斯将军 · 图比德上尉 | — |
| 安其拉废墟 | 召唤物（2 格） | 拉贾克斯将军 · 德雷恩上尉 | — |
| 安其拉废墟 | 首领（4 格） | 莫阿姆 | — |
| 安其拉废墟 | 阶段形态（1 格） | 莫阿姆 · 石化 | — |
| 安其拉废墟 | 召唤物（2 格） | 莫阿姆 · 法力恶魔 | — |
| 安其拉废墟 | 首领（4 格） | 吞咽者布鲁 | — |
| 安其拉废墟 | 阶段形态（1 格） | 吞咽者布鲁 · 破壳 | — |
| 安其拉废墟 | 召唤物（2 格） | 吞咽者布鲁 · 布鲁幼虫 | — |
| 安其拉废墟 | 首领（4 格） | 狩猎者阿亚米斯 | — |
| 安其拉废墟 | 阶段形态（1 格） | 狩猎者阿亚米斯 · 飞行 | — |
| 安其拉废墟 | 召唤物（2 格） | 狩猎者阿亚米斯 · 札拉蜂巢虫群 | — |
| 安其拉废墟 | 召唤物（2 格） | 狩猎者阿亚米斯 · 札拉蜂巢幼虫 | — |
| 安其拉废墟 | 首领（4 格） | 无疤者奥斯里安 | — |
| 安其拉神殿 | 瓦片 | 通用 | tiles_c4.png（虚空神殿，近似；需补金色其拉建筑元素） |
| 安其拉神殿 | 瓦片 | 克苏恩之胃 | — |
| 安其拉神殿 | 机关 | 虫洞 | — |
| 安其拉神殿 | 机关 | 圣甲虫土堆 | — |
| 安其拉神殿 | 机关 | 眼球触须坑 | — |
| 安其拉神殿 | 机关 | 胃部出口 | — |
| 安其拉神殿 | 小怪（3 格） | 阿努比萨斯哨兵 | — |
| 安其拉神殿 | 小怪（3 格） | 维克尼斯毒刺者 | — |
| 安其拉神殿 | 小怪（3 格） | 其拉鞭笞者 | — |
| 安其拉神殿 | 小怪（3 格） | 阿努比萨斯防御者 | — |
| 安其拉神殿 | 小怪（3 格） | 其拉洗脑者 | — |
| 安其拉神殿 | 小怪（3 格） | 黑曜石抹除者 | — |
| 安其拉神殿 | 首领（4 格） | 预言者斯克拉姆 | — |
| 安其拉神殿 | 召唤物（2 格） | 预言者斯克拉姆 · 斯克拉姆幻象 | — |
| 安其拉神殿 | 首领（4 格） | 克里勋爵 | — |
| 安其拉神殿 | 首领（4 格） | 维姆 | — |
| 安其拉神殿 | 首领（4 格） | 亚尔基公主 | — |
| 安其拉神殿 | 首领（4 格） | 沙尔图拉 | — |
| 安其拉神殿 | 召唤物（2 格） | 沙尔图拉 · 沙尔图拉的皇家卫士 | — |
| 安其拉神殿 | 首领（4 格） | 顽强的范克瑞斯 | — |
| 安其拉神殿 | 召唤物（2 格） | 顽强的范克瑞斯 · 范克瑞斯之子 | — |
| 安其拉神殿 | 召唤物（2 格） | 顽强的范克瑞斯 · 维克尼斯孵化者 | — |
| 安其拉神殿 | 首领（4 格） | 维希度斯 | — |
| 安其拉神殿 | 阶段形态（1 格） | 维希度斯 · 冻结 | — |
| 安其拉神殿 | 召唤物（2 格） | 维希度斯 · 维希度斯之球 | — |
| 安其拉神殿 | 首领（4 格） | 哈霍兰公主 | — |
| 安其拉神殿 | 首领（4 格） | 维克洛尔大帝 | — |
| 安其拉神殿 | 首领（4 格） | 维克尼拉斯大帝 | — |
| 安其拉神殿 | 首领（4 格） | 奥罗 | — |
| 安其拉神殿 | 阶段形态（1 格） | 奥罗 · 潜地 | — |
| 安其拉神殿 | 召唤物（2 格） | 奥罗 · 圣甲虫 | — |
| 安其拉神殿 | 首领（4 格） | 克苏恩 | bosses.png 第11格 千眼之神（近似） |
| 安其拉神殿 | 阶段形态（1 格） | 克苏恩 · 本体 | forms.png 第3格 |
| 安其拉神殿 | 阶段形态（1 格） | 克苏恩 · 虚弱 | — |
| 安其拉神殿 | 召唤物（2 格） | 克苏恩 · 眼球触须 | — |
| 安其拉神殿 | 召唤物（2 格） | 克苏恩 · 巨爪触须 | — |
| 安其拉神殿 | 召唤物（2 格） | 克苏恩 · 巨型眼球触须 | — |
| 安其拉神殿 | 召唤物（2 格） | 克苏恩 · 巨型巨爪触须 | — |
| 安其拉神殿 | 召唤物（2 格） | 克苏恩 · 血肉触须 | — |
| 纳克萨玛斯 | 瓦片 | 通用 | tiles_c3.png（亡者要塞，近似可复用为通用大厅） |
| 纳克萨玛斯 | 瓦片 | 蜘蛛区 | — |
| 纳克萨玛斯 | 瓦片 | 瘟疫区 | — |
| 纳克萨玛斯 | 瓦片 | 军事区 | — |
| 纳克萨玛斯 | 瓦片 | 构造区 | — |
| 纳克萨玛斯 | 瓦片 | 冰霜巨龙巢穴 | — |
| 纳克萨玛斯 | 机关 | 蛛网 | — |
| 纳克萨玛斯 | 机关 | 瘟疫裂隙 | — |
| 纳克萨玛斯 | 机关 | 墓碑 | props.png 第5-6格 坟墓 |
| 纳克萨玛斯 | 机关 | 特斯拉线圈 | — |
| 纳克萨玛斯 | 机关 | 冰块 | — |
| 纳克萨玛斯 | 机关 | 灵魂之门 | — |
| 纳克萨玛斯 | 小怪（3 格） | 腐肉织网者 | — |
| 纳克萨玛斯 | 小怪（3 格） | 感染食尸鬼 | mobs.png 第10格 食尸鬼（可复用） |
| 纳克萨玛斯 | 小怪（3 格） | 死亡骑士队长 | — |
| 纳克萨玛斯 | 小怪（3 格） | 大墓地侍僧 | mobs.png 第8/16格 教徒/术士（换色可用） |
| 纳克萨玛斯 | 小怪（3 格） | 缝合傀儡 | — |
| 纳克萨玛斯 | 小怪（3 格） | 石皮石像鬼 | — |
| 纳克萨玛斯 | 首领（4 格） | 阿努布雷坎 | — |
| 纳克萨玛斯 | 召唤物（2 格） | 阿努布雷坎 · 地穴卫士 | — |
| 纳克萨玛斯 | 召唤物（2 格） | 阿努布雷坎 · 腐尸甲虫 | — |
| 纳克萨玛斯 | 首领（4 格） | 黑女巫法琳娜 | — |
| 纳克萨玛斯 | 召唤物（2 格） | 黑女巫法琳娜 · 纳克萨玛斯崇拜者 | — |
| 纳克萨玛斯 | 召唤物（2 格） | 黑女巫法琳娜 · 纳克萨玛斯追随者 | — |
| 纳克萨玛斯 | 首领（4 格） | 迈克斯纳 | — |
| 纳克萨玛斯 | 召唤物（2 格） | 迈克斯纳 · 迈克斯纳蜘蛛宝宝 | — |
| 纳克萨玛斯 | 首领（4 格） | 瘟疫使者诺斯 | — |
| 纳克萨玛斯 | 召唤物（2 格） | 瘟疫使者诺斯 · 瘟疫战士 | — |
| 纳克萨玛斯 | 召唤物（2 格） | 瘟疫使者诺斯 · 瘟疫守护者 | — |
| 纳克萨玛斯 | 首领（4 格） | 肮脏的希尔盖 | bosses.png 第8格 瘟疫舞者（近似可复用） |
| 纳克萨玛斯 | 首领（4 格） | 洛欧塞布 | bosses.png 第10格 孢子君主（可复用） |
| 纳克萨玛斯 | 首领（4 格） | 教官拉苏维奥斯 | — |
| 纳克萨玛斯 | 召唤物（2 格） | 教官拉苏维奥斯 · 死亡骑士学员 | — |
| 纳克萨玛斯 | 首领（4 格） | 收割者戈提克 | — |
| 纳克萨玛斯 | 召唤物（2 格） | 收割者戈提克 · 冷酷的学徒 | — |
| 纳克萨玛斯 | 召唤物（2 格） | 收割者戈提克 · 冷酷的死亡骑士 | — |
| 纳克萨玛斯 | 召唤物（2 格） | 收割者戈提克 · 冷酷的骑兵 | — |
| 纳克萨玛斯 | 首领（4 格） | 库尔塔兹领主 | — |
| 纳克萨玛斯 | 首领（4 格） | 布劳缪克丝女士 | — |
| 纳克萨玛斯 | 首领（4 格） | 大领主莫格莱尼 | — |
| 纳克萨玛斯 | 首领（4 格） | 瑟里耶克爵士 | — |
| 纳克萨玛斯 | 首领（4 格） | 帕奇维克 | bosses.png 第7格 缝合憎恶（可复用） |
| 纳克萨玛斯 | 首领（4 格） | 格罗布鲁斯 | — |
| 纳克萨玛斯 | 召唤物（2 格） | 格罗布鲁斯 · 辐射软泥 | — |
| 纳克萨玛斯 | 首领（4 格） | 格拉斯 | — |
| 纳克萨玛斯 | 召唤物（2 格） | 格拉斯 · 僵尸构造体 | — |
| 纳克萨玛斯 | 首领（4 格） | 塔迪乌斯 | bosses.png 第5格 双极雷像（偏机械，需重画为缝合怪） |
| 纳克萨玛斯 | 召唤物（2 格） | 塔迪乌斯 · 斯塔拉格 | — |
| 纳克萨玛斯 | 召唤物（2 格） | 塔迪乌斯 · 费尔根 | — |
| 纳克萨玛斯 | 首领（4 格） | 萨菲隆 | — |
| 纳克萨玛斯 | 阶段形态（1 格） | 萨菲隆 · 飞行 | — |
| 纳克萨玛斯 | 首领（4 格） | 克尔苏加德 | bosses.png 第9格 冰霜巫妖；forms.png 第4格 强化形态 |
| 纳克萨玛斯 | 召唤物（2 格） | 克尔苏加德 · 冰冠守护者 | forms.png 第7格 |
| 纳克萨玛斯 | 召唤物（2 格） | 克尔苏加德 · 不可阻挡的憎恶 | — |
| 纳克萨玛斯 | 召唤物（2 格） | 克尔苏加德 · 灵魂编织者 | — |
| 纳克萨玛斯 | 召唤物（2 格） | 克尔苏加德 · 冰霜荒原士兵 | — |
| 通用 | 特效/道具 | 活体炸弹标记 | — |
| 通用 | 特效/道具 | 诅咒骷髅 | — |
| 通用 | 特效/道具 | 心灵控制之眼 | — |
| 通用 | 特效/道具 | 反射护盾 | — |
| 通用 | 特效/道具 | 伤害护盾 | — |
| 通用 | 特效/道具 | 图腾光柱 | — |
| 通用 | 特效/道具 | 威胁凝视 | — |
| 通用 | 特效/道具 | 极性正 | — |
| 通用 | 特效/道具 | 极性负 | — |
| 通用 | 特效/道具 | 四骑士印记×4 | — |
| 通用 | 特效/道具 | 胃酸气泡 | — |
| 通用 | 特效/道具 | 沙尘龙卷 | — |
| 通用 | 特效/道具 | 血液虹吸光束 | — |
| 通用 | 特效/道具 | 闪电链 | — |
| 通用 | 特效/道具 | 虫群风暴 | — |
| 通用 | 特效/道具 | 熔岩炸弹 | — |
| 通用 | 特效/道具 | 暗影箭 | — |
| 通用 | 特效/道具 | 奥术爆炸 | — |
| 通用 | 特效/道具 | 神圣之怒 | — |
| 通用 | 特效/道具 | 蛛网 | — |
| 通用 | 特效/道具 | 施法条（UI，可程序绘制） | — |
| 通用 | 特效/道具 | 飞斧 | — |
| 通用 | 特效/道具 | 冰块 | — |
| 通用 | 特效/道具 | 蛛网茧 | — |

## 合图与提示词

### 1. `tiles_mc.png` — 熔火之心 瓦片集 · 通用（4×4 例外：沿用现有 tiles 加载格式 256×256）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, seamless tileset. 4x4 grid of 16px top-down pixel tiles for a volcanic raid dungeon (Molten Core): row0 four cracked black obsidian floor variants with faint orange glow in cracks; row1 four basalt wall-front variants with lava seams and dripping magma; row2 wall-top dark rock, obsidian ore crate, basalt pillar, bubbling lava pool; row3 four decorated floors: scorched bones, glowing ember pebbles, fire rune carved in floor, cooled lava crust. 256x256 total, 64x64 per tile, tiles must tile seamlessly.
```

### 2. `props_mc.png` — 熔火之心 机关（每个 2 格：待机 / 触发）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 2 rows, each cell 256x256 px, 8 cells used, read left-to-right then top-to-bottom:
1. volcanic lava vent crater, idle and erupting states — idle/dormant state
2. volcanic lava vent crater, idle and erupting states — active/triggered state
3. flowing lava river tile strip, glowing orange with dark crust — idle/dormant state
4. flowing lava river tile strip, glowing orange with dark crust — active/triggered state
5. glowing fire rune stone circle on the floor, lit and extinguished (steam) states — idle/dormant state
6. glowing fire rune stone circle on the floor, lit and extinguished (steam) states — active/triggered state
7. large lava lake edge with rock platform rim — idle/dormant state
8. large lava lake edge with rock platform rim — active/triggered state
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 3. `mobs_mc_1.png` — 熔火之心 小怪（每种 3 格：待机 / 走路 / 攻击）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Core Hound, two-headed molten lava hound, cracked rock hide with glowing orange veins — idle pose facing right
2. Core Hound, two-headed molten lava hound, cracked rock hide with glowing orange veins — walking stride facing right
3. Core Hound, two-headed molten lava hound, cracked rock hide with glowing orange veins — attack pose (锯齿撕咬)
4. Lava Surger, hunched lava elemental with surging magma body, leaning forward to charge — idle pose facing right
5. Lava Surger, hunched lava elemental with surging magma body, leaning forward to charge — walking stride facing right
6. Lava Surger, hunched lava elemental with surging magma body, leaning forward to charge — attack pose (奔涌)
7. Flamewaker, tall red-skinned fire giant humanoid, flaming hair, black iron armor, two-handed sword — idle pose facing right
8. Flamewaker, tall red-skinned fire giant humanoid, flaming hair, black iron armor, two-handed sword — walking stride facing right
9. Flamewaker, tall red-skinned fire giant humanoid, flaming hair, black iron armor, two-handed sword — attack pose (破甲)
10. Molten Giant, huge hulking rock giant with lava cracks, massive fists, slow and heavy — idle pose facing right
11. Molten Giant, huge hulking rock giant with lava cracks, massive fists, slow and heavy — walking stride facing right
12. Molten Giant, huge hulking rock giant with lava cracks, massive fists, slow and heavy — attack pose (践踏)
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 4. `mobs_mc_2.png` — 熔火之心 小怪（每种 3 格：待机 / 走路 / 攻击）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 2 rows, each cell 256x256 px, 6 cells used, read left-to-right then top-to-bottom:
1. Firelord, floating fire elemental lord with flame crown, molten core in chest, casting fire — idle pose facing right
2. Firelord, floating fire elemental lord with flame crown, molten core in chest, casting fire — walking stride facing right
3. Firelord, floating fire elemental lord with flame crown, molten core in chest, casting fire — attack pose (灵魂燃烧)
4. Flamewaker Priest, red-skinned fire giant priest in dark robes with shadow magic in hands — idle pose facing right
5. Flamewaker Priest, red-skinned fire giant priest in dark robes with shadow magic in hands — walking stride facing right
6. Flamewaker Priest, red-skinned fire giant priest in dark robes with shadow magic in hands — attack pose (暗影箭)
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 5. `bosses_mc_1.png` — 熔火之心 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Lucifron, towering flamewaker lord, crimson skin, curved black horns, burning mohawk, spiked black plate, flaming polearm — idle pose
2. Lucifron, towering flamewaker lord, crimson skin, curved black horns, burning mohawk, spiked black plate, flaming polearm — moving/walking pose
3. Lucifron, towering flamewaker lord, crimson skin, curved black horns, burning mohawk, spiked black plate, flaming polearm — melee or main attack pose
4. Lucifron, towering flamewaker lord, crimson skin, curved black horns, burning mohawk, spiked black plate, flaming polearm — casting signature spell pose with glow
5. Magmadar, giant lava core hound boss, molten rock body, glowing magma maw and spine, scorpion-like tail — idle pose
6. Magmadar, giant lava core hound boss, molten rock body, glowing magma maw and spine, scorpion-like tail — moving/walking pose
7. Magmadar, giant lava core hound boss, molten rock body, glowing magma maw and spine, scorpion-like tail — melee or main attack pose
8. Magmadar, giant lava core hound boss, molten rock body, glowing magma maw and spine, scorpion-like tail — casting signature spell pose with glow
9. Gehennas, flamewaker lord with dark purple-red skin, shadow fire in palms, horned helm, robe over armor — idle pose
10. Gehennas, flamewaker lord with dark purple-red skin, shadow fire in palms, horned helm, robe over armor — moving/walking pose
11. Gehennas, flamewaker lord with dark purple-red skin, shadow fire in palms, horned helm, robe over armor — melee or main attack pose
12. Gehennas, flamewaker lord with dark purple-red skin, shadow fire in palms, horned helm, robe over armor — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 6. `bosses_mc_2.png` — 熔火之心 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Garr, massive rock elemental lord made of black basalt boulders with lava cores, stone fists — idle pose
2. Garr, massive rock elemental lord made of black basalt boulders with lava cores, stone fists — moving/walking pose
3. Garr, massive rock elemental lord made of black basalt boulders with lava cores, stone fists — melee or main attack pose
4. Garr, massive rock elemental lord made of black basalt boulders with lava cores, stone fists — casting signature spell pose with glow
5. Baron Geddon, floating fire elemental baron, swirling flame torso, stone shackles on wrists, no legs, crown of fire — idle pose
6. Baron Geddon, floating fire elemental baron, swirling flame torso, stone shackles on wrists, no legs, crown of fire — moving/walking pose
7. Baron Geddon, floating fire elemental baron, swirling flame torso, stone shackles on wrists, no legs, crown of fire — melee or main attack pose
8. Baron Geddon, floating fire elemental baron, swirling flame torso, stone shackles on wrists, no legs, crown of fire — casting signature spell pose with glow
9. Shazzrah, flamewaker arcanist, red skin with glowing arcane runes, purple-blue magic orbs in hands, robes — idle pose
10. Shazzrah, flamewaker arcanist, red skin with glowing arcane runes, purple-blue magic orbs in hands, robes — moving/walking pose
11. Shazzrah, flamewaker arcanist, red skin with glowing arcane runes, purple-blue magic orbs in hands, robes — melee or main attack pose
12. Shazzrah, flamewaker arcanist, red skin with glowing arcane runes, purple-blue magic orbs in hands, robes — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 7. `bosses_mc_3.png` — 熔火之心 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Sulfuron Harbinger, armored flamewaker herald, golden-black plate, huge flaming mace, banner of Ragnaros — idle pose
2. Sulfuron Harbinger, armored flamewaker herald, golden-black plate, huge flaming mace, banner of Ragnaros — moving/walking pose
3. Sulfuron Harbinger, armored flamewaker herald, golden-black plate, huge flaming mace, banner of Ragnaros — melee or main attack pose
4. Sulfuron Harbinger, armored flamewaker herald, golden-black plate, huge flaming mace, banner of Ragnaros — casting signature spell pose with glow
5. Golemagg the Incinerator, colossal molten giant with obsidian armor plates, flaming eyes, magma dripping — idle pose
6. Golemagg the Incinerator, colossal molten giant with obsidian armor plates, flaming eyes, magma dripping — moving/walking pose
7. Golemagg the Incinerator, colossal molten giant with obsidian armor plates, flaming eyes, magma dripping — melee or main attack pose
8. Golemagg the Incinerator, colossal molten giant with obsidian armor plates, flaming eyes, magma dripping — casting signature spell pose with glow
9. Majordomo Executus, regal flamewaker steward, ornate gold-red robes, fiery beard, staff with flame orb — idle pose
10. Majordomo Executus, regal flamewaker steward, ornate gold-red robes, fiery beard, staff with flame orb — moving/walking pose
11. Majordomo Executus, regal flamewaker steward, ornate gold-red robes, fiery beard, staff with flame orb — melee or main attack pose
12. Majordomo Executus, regal flamewaker steward, ornate gold-red robes, fiery beard, staff with flame orb — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 8. `bosses_mc_4.png` — 熔火之心 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 1 rows, each cell 256x256 px, 4 cells used, read left-to-right then top-to-bottom:
1. Ragnaros the Firelord, colossal fire elemental rising waist-up from lava, horned molten head, flaming beard, giant hammer Sulfuras — idle pose
2. Ragnaros the Firelord, colossal fire elemental rising waist-up from lava, horned molten head, flaming beard, giant hammer Sulfuras — moving/walking pose
3. Ragnaros the Firelord, colossal fire elemental rising waist-up from lava, horned molten head, flaming beard, giant hammer Sulfuras — melee or main attack pose
4. Ragnaros the Firelord, colossal fire elemental rising waist-up from lava, horned molten head, flaming beard, giant hammer Sulfuras — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 9. `adds_mc_1.png` — 熔火之心 阶段形态与召唤物

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Flamewaker Protector, fire giant guard with tower shield and burning axe — idle pose
2. Flamewaker Protector, fire giant guard with tower shield and burning axe — attack pose
3. Flamewaker, fire giant warrior (reuse trash sprite) — idle pose
4. Flamewaker, fire giant warrior (reuse trash sprite) — attack pose
5. Firesworn, small fiery rock elemental, glowing molten center, flame crest — idle pose
6. Firesworn, small fiery rock elemental, glowing molten center, flame crest — attack pose
7. Flamewaker Priest (reuse trash sprite) with red sash — idle pose
8. Flamewaker Priest (reuse trash sprite) with red sash — attack pose
9. Core Rager, large armored core hound with obsidian plates — idle pose
10. Core Rager, large armored core hound with obsidian plates — attack pose
11. Flamewaker Elite, armored fire giant with burning greatsword — idle pose
12. Flamewaker Elite, armored fire giant with burning greatsword — attack pose
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 10. `adds_mc_2.png` — 熔火之心 阶段形态与召唤物

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 2 rows, each cell 256x256 px, 5 cells used, read left-to-right then top-to-bottom:
1. Flamewaker Healer, fire giant healer in white-red robes with glowing staff — idle pose
2. Flamewaker Healer, fire giant healer in white-red robes with glowing staff — attack pose
3. Ragnaros submerged, only lava bubbles and the tip of Sulfuras hammer showing
4. Son of Flame, humanoid fire elemental with burning body and flame trails — idle pose
5. Son of Flame, humanoid fire elemental with burning body and flame trails — attack pose
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 11. `tiles_ony.png` — 奥妮克希亚的巢穴 瓦片集 · 通用（4×4 例外：沿用现有 tiles 加载格式 256×256）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, seamless tileset. 4x4 grid of 16px top-down pixel tiles for a black dragon cave lair: row0 four dark volcanic cave floor variants with scattered gold coins and ash; row1 four rough cave wall-front variants with claw marks; row2 wall-top dark rock, treasure pile crate, stalagmite pillar, lava crack pool; row3 four decorated floors: dragon bones, burnt skeleton, glowing floor fissure, scattered eggshells. 256x256 total, 64x64 per tile, tiles must tile seamlessly.
```

### 12. `props_ony.png` — 奥妮克希亚的巢穴 机关（每个 2 格：待机 / 触发）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 1 rows, each cell 256x256 px, 4 cells used, read left-to-right then top-to-bottom:
1. black dragon egg cluster in nest — idle/dormant state
2. black dragon egg cluster in nest — active/triggered state
3. glowing lava floor fissure, dormant and erupting states — idle/dormant state
4. glowing lava floor fissure, dormant and erupting states — active/triggered state
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 13. `mobs_ony.png` — 奥妮克希亚的巢穴 小怪（每种 3 格：待机 / 走路 / 攻击）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Onyxian Warder, black dragonkin guard with dark scales, horned helm, long halberd — idle pose facing right
2. Onyxian Warder, black dragonkin guard with dark scales, horned helm, long halberd — walking stride facing right
3. Onyxian Warder, black dragonkin guard with dark scales, horned helm, long halberd — attack pose (火焰新星)
4. Onyxian Whelp, small black dragon whelp with orange belly, flapping wings — idle pose facing right
5. Onyxian Whelp, small black dragon whelp with orange belly, flapping wings — walking stride facing right
6. Onyxian Whelp, small black dragon whelp with orange belly, flapping wings — attack pose (扑咬)
7. Black dragonspawn brute, heavy black scaled half-dragon with stone club — idle pose facing right
8. Black dragonspawn brute, heavy black scaled half-dragon with stone club — walking stride facing right
9. Black dragonspawn brute, heavy black scaled half-dragon with stone club — attack pose (龙鳞护甲)
10. Black dragonflight cultist mage in dark red robes with dragon-skull hood, fire in hands — idle pose facing right
11. Black dragonflight cultist mage in dark red robes with dragon-skull hood, fire in hands — walking stride facing right
12. Black dragonflight cultist mage in dark red robes with dragon-skull hood, fire in hands — attack pose (火球术)
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 14. `bosses_ony.png` — 奥妮克希亚的巢穴 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 1 rows, each cell 256x256 px, 4 cells used, read left-to-right then top-to-bottom:
1. Onyxia, huge black dragon broodmother, sleek black scales, orange-red underbelly, curved horns, wings folded — idle pose
2. Onyxia, huge black dragon broodmother, sleek black scales, orange-red underbelly, curved horns, wings folded — moving/walking pose
3. Onyxia, huge black dragon broodmother, sleek black scales, orange-red underbelly, curved horns, wings folded — melee or main attack pose
4. Onyxia, huge black dragon broodmother, sleek black scales, orange-red underbelly, curved horns, wings folded — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 15. `adds_ony.png` — 奥妮克希亚的巢穴 阶段形态与召唤物

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 1 rows, each cell 256x256 px, 1 cells used, read left-to-right then top-to-bottom:
1. Onyxia flying overhead, wings spread wide, seen from below-top-down, shadow beneath
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 16. `tiles_bwl.png` — 黑翼之巢 瓦片集 · 通用（4×4 例外：沿用现有 tiles 加载格式 256×256）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, seamless tileset. 4x4 grid of 16px top-down pixel tiles for Blackwing Lair: row0 four dark basalt flagstone floor variants with red-black dragon banners motif; row1 four black stone wall-front variants with iron bars and red torches; row2 wall-top black rock, iron-banded crate, obsidian pillar with dragon carving, bubbling chromatic potion vat; row3 four decorated floors: drakonid bones, dragon egg shards, scorched rune circle, spilled purple chemical. 256x256 total, 64x64 per tile, tiles must tile seamlessly.
```

### 17. `props_bwl.png` — 黑翼之巢 机关（每个 2 格：待机 / 触发）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 2 rows, each cell 256x256 px, 6 cells used, read left-to-right then top-to-bottom:
1. large black dragon egg on stone pedestal, intact and cracked — idle/dormant state
2. large black dragon egg on stone pedestal, intact and cracked — active/triggered state
3. suppression device, iron dragon-head machine emitting purple-green energy pulse, active and broken states — idle/dormant state
4. suppression device, iron dragon-head machine emitting purple-green energy pulse, active and broken states — active/triggered state
5. bubbling chromatic potion vat with five colored liquids — idle/dormant state
6. bubbling chromatic potion vat with five colored liquids — active/triggered state
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 18. `mobs_bwl_1.png` — 黑翼之巢 小怪（每种 3 格：待机 / 走路 / 攻击）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Blackwing Legionnaire, black drakonid soldier in spiked iron armor with axe and round shield — idle pose facing right
2. Blackwing Legionnaire, black drakonid soldier in spiked iron armor with axe and round shield — walking stride facing right
3. Blackwing Legionnaire, black drakonid soldier in spiked iron armor with axe and round shield — attack pose (顺劈斩)
4. Corrupted Whelp, small chromatic dragon whelp with patchy red/blue/green/bronze scales and glowing veins — idle pose facing right
5. Corrupted Whelp, small chromatic dragon whelp with patchy red/blue/green/bronze scales and glowing veins — walking stride facing right
6. Corrupted Whelp, small chromatic dragon whelp with patchy red/blue/green/bronze scales and glowing veins — attack pose (扑咬)
7. Death Talon Wyrmguard, large winged dragonkin guard with glowing elemental scales and halberd — idle pose facing right
8. Death Talon Wyrmguard, large winged dragonkin guard with glowing elemental scales and halberd — walking stride facing right
9. Death Talon Wyrmguard, large winged dragonkin guard with glowing elemental scales and halberd — attack pose (元素抗性轮换)
10. Blackwing Mage, human mage in black-red robes with dragon emblem, fireball in hand — idle pose facing right
11. Blackwing Mage, human mage in black-red robes with dragon emblem, fireball in hand — walking stride facing right
12. Blackwing Mage, human mage in black-red robes with dragon emblem, fireball in hand — attack pose (火球术)
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 19. `mobs_bwl_2.png` — 黑翼之巢 小怪（每种 3 格：待机 / 走路 / 攻击）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 2 rows, each cell 256x256 px, 6 cells used, read left-to-right then top-to-bottom:
1. Blackwing Technician, goblin engineer in black-red apron with goggles and lit bombs — idle pose facing right
2. Blackwing Technician, goblin engineer in black-red apron with goggles and lit bombs — walking stride facing right
3. Blackwing Technician, goblin engineer in black-red apron with goggles and lit bombs — attack pose (投掷炸弹)
4. Blackwing Spellbinder, dark sorcerer with chained grimoire and purple arcane bindings — idle pose facing right
5. Blackwing Spellbinder, dark sorcerer with chained grimoire and purple arcane bindings — walking stride facing right
6. Blackwing Spellbinder, dark sorcerer with chained grimoire and purple arcane bindings — attack pose (强效变形术)
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 20. `bosses_bwl_1.png` — 黑翼之巢 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Razorgore the Untamed, massive black-red dragon with brutal horns and scarred hide, chained collar — idle pose
2. Razorgore the Untamed, massive black-red dragon with brutal horns and scarred hide, chained collar — moving/walking pose
3. Razorgore the Untamed, massive black-red dragon with brutal horns and scarred hide, chained collar — melee or main attack pose
4. Razorgore the Untamed, massive black-red dragon with brutal horns and scarred hide, chained collar — casting signature spell pose with glow
5. Vaelastrasz the Corrupt, red dragon corrupted with black veins and dark smoke, chained, pained expression — idle pose
6. Vaelastrasz the Corrupt, red dragon corrupted with black veins and dark smoke, chained, pained expression — moving/walking pose
7. Vaelastrasz the Corrupt, red dragon corrupted with black veins and dark smoke, chained, pained expression — melee or main attack pose
8. Vaelastrasz the Corrupt, red dragon corrupted with black veins and dark smoke, chained, pained expression — casting signature spell pose with glow
9. Broodlord Lashlayer, hulking black dragonkin lord in heavy spiked plate, massive two-handed axe, horned crown — idle pose
10. Broodlord Lashlayer, hulking black dragonkin lord in heavy spiked plate, massive two-handed axe, horned crown — moving/walking pose
11. Broodlord Lashlayer, hulking black dragonkin lord in heavy spiked plate, massive two-handed axe, horned crown — melee or main attack pose
12. Broodlord Lashlayer, hulking black dragonkin lord in heavy spiked plate, massive two-handed axe, horned crown — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 21. `bosses_bwl_2.png` — 黑翼之巢 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Firemaw, large black dragon with flame-filled maw and glowing orange throat, spiky jaw — idle pose
2. Firemaw, large black dragon with flame-filled maw and glowing orange throat, spiky jaw — moving/walking pose
3. Firemaw, large black dragon with flame-filled maw and glowing orange throat, spiky jaw — melee or main attack pose
4. Firemaw, large black dragon with flame-filled maw and glowing orange throat, spiky jaw — casting signature spell pose with glow
5. Ebonroc, sleek black dragon wreathed in purple shadow flames, glowing violet eyes — idle pose
6. Ebonroc, sleek black dragon wreathed in purple shadow flames, glowing violet eyes — moving/walking pose
7. Ebonroc, sleek black dragon wreathed in purple shadow flames, glowing violet eyes — melee or main attack pose
8. Ebonroc, sleek black dragon wreathed in purple shadow flames, glowing violet eyes — casting signature spell pose with glow
9. Flamegor, black dragon with orange-red molten scale edges, flames along spine — idle pose
10. Flamegor, black dragon with orange-red molten scale edges, flames along spine — moving/walking pose
11. Flamegor, black dragon with orange-red molten scale edges, flames along spine — melee or main attack pose
12. Flamegor, black dragon with orange-red molten scale edges, flames along spine — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 22. `bosses_bwl_3.png` — 黑翼之巢 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 2 rows, each cell 256x256 px, 8 cells used, read left-to-right then top-to-bottom:
1. Chromaggus, two-headed chromatic dragon hound, multicolored scales (red blue green bronze black), massive jaws — idle pose
2. Chromaggus, two-headed chromatic dragon hound, multicolored scales (red blue green bronze black), massive jaws — moving/walking pose
3. Chromaggus, two-headed chromatic dragon hound, multicolored scales (red blue green bronze black), massive jaws — melee or main attack pose
4. Chromaggus, two-headed chromatic dragon hound, multicolored scales (red blue green bronze black), massive jaws — casting signature spell pose with glow
5. Nefarian, enormous black dragon lord, jagged black scales with red underglow, horned crown, menacing — idle pose
6. Nefarian, enormous black dragon lord, jagged black scales with red underglow, horned crown, menacing — moving/walking pose
7. Nefarian, enormous black dragon lord, jagged black scales with red underglow, horned crown, menacing — melee or main attack pose
8. Nefarian, enormous black dragon lord, jagged black scales with red underglow, horned crown, menacing — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 23. `adds_bwl.png` — 黑翼之巢 阶段形态与召唤物

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 1 rows, each cell 256x256 px, 3 cells used, read left-to-right then top-to-bottom:
1. Lord Victor Nefarius, tall noble in black-red regal robes with high collar, glowing red eyes, shadow magic
2. Drakonid, winged dragon-man warrior; 5 color variants: red, blue, green, bronze, black, plus chromatic — idle pose
3. Drakonid, winged dragon-man warrior; 5 color variants: red, blue, green, bronze, black, plus chromatic — attack pose
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 24. `tiles_zg.png` — 祖尔格拉布 瓦片集 · 通用（4×4 例外：沿用现有 tiles 加载格式 256×256）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, seamless tileset. 4x4 grid of 16px top-down pixel tiles for a jungle troll temple (Zul'Gurub): row0 four mossy carved stone floor variants with vines and jungle leaves; row1 four troll ziggurat wall-front variants with tiki carvings and torches; row2 wall-top jungle canopy, wooden offering crate, carved troll idol pillar, blood-red water pool; row3 four decorated floors: blood channel, troll skull pile, fallen leaves with mushrooms, snake-carved mosaic. 256x256 total, 64x64 per tile, tiles must tile seamlessly.
```

### 25. `props_zg.png` — 祖尔格拉布 机关（每个 2 格：待机 / 触发）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 2 rows, each cell 256x256 px, 8 cells used, read left-to-right then top-to-bottom:
1. cluster of pale green spider eggs in web, intact and hatching — idle/dormant state
2. cluster of pale green spider eggs in web, intact and hatching — active/triggered state
3. bamboo cage with a black panther inside, closed and broken open — idle/dormant state
4. bamboo cage with a black panther inside, closed and broken open — active/triggered state
5. troll blood altar with carved snake heads and flowing blood — idle/dormant state
6. troll blood altar with carved snake heads and flowing blood — active/triggered state
7. bubbling green poison blood pool — idle/dormant state
8. bubbling green poison blood pool — active/triggered state
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 26. `mobs_zg_1.png` — 祖尔格拉布 小怪（每种 3 格：待机 / 走路 / 攻击）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Gurubashi Berserker, huge muscular jungle troll with tusks, war paint and spiked club — idle pose facing right
2. Gurubashi Berserker, huge muscular jungle troll with tusks, war paint and spiked club — walking stride facing right
3. Gurubashi Berserker, huge muscular jungle troll with tusks, war paint and spiked club — attack pose (威慑怒吼)
4. Zulian Tiger, striped jungle tiger with troll war paint and gold ear rings — idle pose facing right
5. Zulian Tiger, striped jungle tiger with troll war paint and gold ear rings — walking stride facing right
6. Zulian Tiger, striped jungle tiger with troll war paint and gold ear rings — attack pose (猛扑)
7. Razzashi Broodwidow, large purple-black jungle spider with egg sac abdomen — idle pose facing right
8. Razzashi Broodwidow, large purple-black jungle spider with egg sac abdomen — walking stride facing right
9. Razzashi Broodwidow, large purple-black jungle spider with egg sac abdomen — attack pose (蛛网)
10. Gurubashi Axe Thrower, lean jungle troll with mohawk, bandolier of throwing axes, mid-throw — idle pose facing right
11. Gurubashi Axe Thrower, lean jungle troll with mohawk, bandolier of throwing axes, mid-throw — walking stride facing right
12. Gurubashi Axe Thrower, lean jungle troll with mohawk, bandolier of throwing axes, mid-throw — attack pose (投掷飞斧)
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 27. `mobs_zg_2.png` — 祖尔格拉布 小怪（每种 3 格：待机 / 走路 / 攻击）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 2 rows, each cell 256x256 px, 6 cells used, read left-to-right then top-to-bottom:
1. Hakkari Witch Doctor, troll shaman with voodoo mask, feathers, shrunken heads on staff — idle pose facing right
2. Hakkari Witch Doctor, troll shaman with voodoo mask, feathers, shrunken heads on staff — walking stride facing right
3. Hakkari Witch Doctor, troll shaman with voodoo mask, feathers, shrunken heads on staff — attack pose (妖术)
4. Gurubashi Bat Rider, troll riding a giant bloodseeker bat, holding a flask of liquid fire — idle pose facing right
5. Gurubashi Bat Rider, troll riding a giant bloodseeker bat, holding a flask of liquid fire — walking stride facing right
6. Gurubashi Bat Rider, troll riding a giant bloodseeker bat, holding a flask of liquid fire — attack pose (液态火)
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 28. `bosses_zg_1.png` — 祖尔格拉布 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. High Priestess Jeklik, troll priestess with bat-wing headdress and red-black robes, bat motifs — idle pose
2. High Priestess Jeklik, troll priestess with bat-wing headdress and red-black robes, bat motifs — moving/walking pose
3. High Priestess Jeklik, troll priestess with bat-wing headdress and red-black robes, bat motifs — melee or main attack pose
4. High Priestess Jeklik, troll priestess with bat-wing headdress and red-black robes, bat motifs — casting signature spell pose with glow
5. High Priest Venoxis, troll priest with cobra hood headdress, green-gold robes, snake staff — idle pose
6. High Priest Venoxis, troll priest with cobra hood headdress, green-gold robes, snake staff — moving/walking pose
7. High Priest Venoxis, troll priest with cobra hood headdress, green-gold robes, snake staff — melee or main attack pose
8. High Priest Venoxis, troll priest with cobra hood headdress, green-gold robes, snake staff — casting signature spell pose with glow
9. High Priestess Mar'li, troll priestess with spider-leg headdress, purple robes, venom vials — idle pose
10. High Priestess Mar'li, troll priestess with spider-leg headdress, purple robes, venom vials — moving/walking pose
11. High Priestess Mar'li, troll priestess with spider-leg headdress, purple robes, venom vials — melee or main attack pose
12. High Priestess Mar'li, troll priestess with spider-leg headdress, purple robes, venom vials — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 29. `bosses_zg_2.png` — 祖尔格拉布 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Bloodlord Mandokir, armored troll warlord with huge axe, riding the raptor Ohgan, red war paint — idle pose
2. Bloodlord Mandokir, armored troll warlord with huge axe, riding the raptor Ohgan, red war paint — moving/walking pose
3. Bloodlord Mandokir, armored troll warlord with huge axe, riding the raptor Ohgan, red war paint — melee or main attack pose
4. Bloodlord Mandokir, armored troll warlord with huge axe, riding the raptor Ohgan, red war paint — casting signature spell pose with glow
5. Gri'lek, giant troll berserker with iron chains and huge hammer, red skin — idle pose
6. Gri'lek, giant troll berserker with iron chains and huge hammer, red skin — moving/walking pose
7. Gri'lek, giant troll berserker with iron chains and huge hammer, red skin — melee or main attack pose
8. Gri'lek, giant troll berserker with iron chains and huge hammer, red skin — casting signature spell pose with glow
9. Hazza'rah, troll dream-shaman with green-purple robes and sleeping mask — idle pose
10. Hazza'rah, troll dream-shaman with green-purple robes and sleeping mask — moving/walking pose
11. Hazza'rah, troll dream-shaman with green-purple robes and sleeping mask — melee or main attack pose
12. Hazza'rah, troll dream-shaman with green-purple robes and sleeping mask — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 30. `bosses_zg_3.png` — 祖尔格拉布 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Renataki, lean troll assassin with twin daggers and shadowy cloak — idle pose
2. Renataki, lean troll assassin with twin daggers and shadowy cloak — moving/walking pose
3. Renataki, lean troll assassin with twin daggers and shadowy cloak — melee or main attack pose
4. Renataki, lean troll assassin with twin daggers and shadowy cloak — casting signature spell pose with glow
5. Wushoolay, troll storm shaman with lightning totem staff and blue tattoos — idle pose
6. Wushoolay, troll storm shaman with lightning totem staff and blue tattoos — moving/walking pose
7. Wushoolay, troll storm shaman with lightning totem staff and blue tattoos — melee or main attack pose
8. Wushoolay, troll storm shaman with lightning totem staff and blue tattoos — casting signature spell pose with glow
9. High Priest Thekal, troll priest with tiger-skull headdress and orange-black striped robes — idle pose
10. High Priest Thekal, troll priest with tiger-skull headdress and orange-black striped robes — moving/walking pose
11. High Priest Thekal, troll priest with tiger-skull headdress and orange-black striped robes — melee or main attack pose
12. High Priest Thekal, troll priest with tiger-skull headdress and orange-black striped robes — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 31. `bosses_zg_4.png` — 祖尔格拉布 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Gahz'ranka, giant serpentine sea beast with blue-green scales, fins and long neck, rising from water — idle pose
2. Gahz'ranka, giant serpentine sea beast with blue-green scales, fins and long neck, rising from water — moving/walking pose
3. Gahz'ranka, giant serpentine sea beast with blue-green scales, fins and long neck, rising from water — melee or main attack pose
4. Gahz'ranka, giant serpentine sea beast with blue-green scales, fins and long neck, rising from water — casting signature spell pose with glow
5. High Priestess Arlokk, troll priestess with panther headdress and dark purple robes, claws — idle pose
6. High Priestess Arlokk, troll priestess with panther headdress and dark purple robes, claws — moving/walking pose
7. High Priestess Arlokk, troll priestess with panther headdress and dark purple robes, claws — melee or main attack pose
8. High Priestess Arlokk, troll priestess with panther headdress and dark purple robes, claws — casting signature spell pose with glow
9. Jin'do the Hexxer, hunched old troll witch doctor with huge voodoo mask, feathers and hex staff — idle pose
10. Jin'do the Hexxer, hunched old troll witch doctor with huge voodoo mask, feathers and hex staff — moving/walking pose
11. Jin'do the Hexxer, hunched old troll witch doctor with huge voodoo mask, feathers and hex staff — melee or main attack pose
12. Jin'do the Hexxer, hunched old troll witch doctor with huge voodoo mask, feathers and hex staff — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 32. `bosses_zg_5.png` — 祖尔格拉布 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 1 rows, each cell 256x256 px, 4 cells used, read left-to-right then top-to-bottom:
1. Hakkar the Soulflayer, giant winged blood serpent god, red feathered wings, gold troll ornaments, glowing crimson eyes — idle pose
2. Hakkar the Soulflayer, giant winged blood serpent god, red feathered wings, gold troll ornaments, glowing crimson eyes — moving/walking pose
3. Hakkar the Soulflayer, giant winged blood serpent god, red feathered wings, gold troll ornaments, glowing crimson eyes — melee or main attack pose
4. Hakkar the Soulflayer, giant winged blood serpent god, red feathered wings, gold troll ornaments, glowing crimson eyes — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 33. `adds_zg_1.png` — 祖尔格拉布 阶段形态与召唤物

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Jeklik in giant bat form, huge red-black bat with troll jewelry
2. Bloodseeker Bat, small red jungle bat — idle pose
3. Bloodseeker Bat, small red jungle bat — attack pose
4. Venoxis as a giant cobra, green-gold scales, troll jewelry, hood flared
5. Razzashi Cobra, green jungle cobra with hood flared — idle pose
6. Razzashi Cobra, green jungle cobra with hood flared — attack pose
7. Mar'li as a giant spider with troll mask and purple-black carapace
8. Spawn of Mar'li, small purple spider hatchling — idle pose
9. Spawn of Mar'li, small purple spider hatchling — attack pose
10. Mandokir on foot, troll warlord with giant two-handed axe, no mount
11. Ohgan, large red-scaled war raptor with spiked saddle — idle pose
12. Ohgan, large red-scaled war raptor with spiked saddle — attack pose
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 34. `adds_zg_2.png` — 祖尔格拉布 阶段形态与召唤物

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Thekal as a huge troll-tiger beast, orange-black stripes, gold armor
2. Zealot Lor'Khan, troll priestess caster with lightning — idle pose
3. Zealot Lor'Khan, troll priestess caster with lightning — attack pose
4. Zealot Zath, troll rogue with twin daggers — idle pose
5. Zealot Zath, troll rogue with twin daggers — attack pose
6. Arlokk as a giant black panther with purple troll markings
7. Zulian Prowler, black jungle panther with glowing eyes — idle pose
8. Zulian Prowler, black jungle panther with glowing eyes — attack pose
9. Powerful Healing Ward, tribal totem with green glowing gem — idle pose
10. Powerful Healing Ward, tribal totem with green glowing gem — attack pose
11. Brain Wash Totem, tribal totem with purple eye — idle pose
12. Brain Wash Totem, tribal totem with purple eye — attack pose
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 35. `adds_zg_3.png` — 祖尔格拉布 阶段形态与召唤物

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 2 rows, each cell 256x256 px, 6 cells used, read left-to-right then top-to-bottom:
1. Shade of Jin'do, translucent ghostly troll shade — idle pose
2. Shade of Jin'do, translucent ghostly troll shade — attack pose
3. sacrificed skeleton (reuse skeleton sprite) — idle pose
4. sacrificed skeleton (reuse skeleton sprite) — attack pose
5. Son of Hakkar, small winged red serpent — idle pose
6. Son of Hakkar, small winged red serpent — attack pose
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 36. `tiles_aq20.png` — 安其拉废墟 瓦片集 · 通用（4×4 例外：沿用现有 tiles 加载格式 256×256）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, seamless tileset. 4x4 grid of 16px top-down pixel tiles for desert insect ruins (Ruins of Ahn'Qiraj): row0 four sand-covered sandstone floor variants with cracks; row1 four crumbling sandstone wall-front variants with Qiraji hieroglyphs; row2 wall-top sand dune, broken sandstone block crate, obsidian obelisk pillar, quicksand pit pool; row3 four decorated floors: insect husks, scattered bones in sand, silithid hive resin, glowing obsidian shard. 256x256 total, 64x64 per tile, tiles must tile seamlessly.
```

### 37. `props_aq20.png` — 安其拉废墟 机关（每个 2 格：待机 / 触发）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 10 cells used, read left-to-right then top-to-bottom:
1. sand trap, subtle swirling sand circle, idle and erupting — idle/dormant state
2. sand trap, subtle swirling sand circle, idle and erupting — active/triggered state
3. giant silithid egg, glossy amber with dark veins, intact and burst — idle/dormant state
4. giant silithid egg, glossy amber with dark veins, intact and burst — active/triggered state
5. tall obsidian crystal pylon glowing with colored light, active and depleted — idle/dormant state
6. tall obsidian crystal pylon glowing with colored light, active and depleted — active/triggered state
7. sand vortex tornado (see fx) — idle/dormant state
8. sand vortex tornado (see fx) — active/triggered state
9. silithid hive mound with holes, idle and swarming — idle/dormant state
10. silithid hive mound with holes, idle and swarming — active/triggered state
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 38. `mobs_aq20_1.png` — 安其拉废墟 小怪（每种 3 格：待机 / 走路 / 攻击）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Qiraji Gladiator, armored insectoid humanoid warrior with gold carapace and bladed arms — idle pose facing right
2. Qiraji Gladiator, armored insectoid humanoid warrior with gold carapace and bladed arms — walking stride facing right
3. Qiraji Gladiator, armored insectoid humanoid warrior with gold carapace and bladed arms — attack pose (践踏)
4. Hive'Zara Stinger, large wasp-like silithid with long stinger, yellow-black carapace — idle pose facing right
5. Hive'Zara Stinger, large wasp-like silithid with long stinger, yellow-black carapace — walking stride facing right
6. Hive'Zara Stinger, large wasp-like silithid with long stinger, yellow-black carapace — attack pose (冲锋)
7. Hive'Zara Wasp, small yellow-black silithid wasp — idle pose facing right
8. Hive'Zara Wasp, small yellow-black silithid wasp — walking stride facing right
9. Hive'Zara Wasp, small yellow-black silithid wasp — attack pose (蜂群)
10. Anubisath Guardian, giant stone-gold jackal-headed construct warrior with obsidian runes — idle pose facing right
11. Anubisath Guardian, giant stone-gold jackal-headed construct warrior with obsidian runes — walking stride facing right
12. Anubisath Guardian, giant stone-gold jackal-headed construct warrior with obsidian runes — attack pose (随机两项能力)
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 39. `mobs_aq20_2.png` — 安其拉废墟 小怪（每种 3 格：待机 / 走路 / 攻击）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 2 rows, each cell 256x256 px, 6 cells used, read left-to-right then top-to-bottom:
1. Obsidian Destroyer, floating black obsidian golem with purple glowing cracks — idle pose facing right
2. Obsidian Destroyer, floating black obsidian golem with purple glowing cracks — walking stride facing right
3. Obsidian Destroyer, floating black obsidian golem with purple glowing cracks — attack pose (法力吸取)
4. Shrieker Scarab, blue-black scarab beetle with open vibrating wing casings — idle pose facing right
5. Shrieker Scarab, blue-black scarab beetle with open vibrating wing casings — walking stride facing right
6. Shrieker Scarab, blue-black scarab beetle with open vibrating wing casings — attack pose (刺耳尖啸)
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 40. `bosses_aq20_1.png` — 安其拉废墟 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Kurinnaxx, giant sand-colored silithid scorpion-bug with huge mandibles and armored tail — idle pose
2. Kurinnaxx, giant sand-colored silithid scorpion-bug with huge mandibles and armored tail — moving/walking pose
3. Kurinnaxx, giant sand-colored silithid scorpion-bug with huge mandibles and armored tail — melee or main attack pose
4. Kurinnaxx, giant sand-colored silithid scorpion-bug with huge mandibles and armored tail — casting signature spell pose with glow
5. General Rajaxx, tall Qiraji general with gold-trimmed carapace armor, war banner, scimitar arms — idle pose
6. General Rajaxx, tall Qiraji general with gold-trimmed carapace armor, war banner, scimitar arms — moving/walking pose
7. General Rajaxx, tall Qiraji general with gold-trimmed carapace armor, war banner, scimitar arms — melee or main attack pose
8. General Rajaxx, tall Qiraji general with gold-trimmed carapace armor, war banner, scimitar arms — casting signature spell pose with glow
9. Moam, giant obsidian-stone construct with glowing blue arcane runes and crystal shoulders — idle pose
10. Moam, giant obsidian-stone construct with glowing blue arcane runes and crystal shoulders — moving/walking pose
11. Moam, giant obsidian-stone construct with glowing blue arcane runes and crystal shoulders — melee or main attack pose
12. Moam, giant obsidian-stone construct with glowing blue arcane runes and crystal shoulders — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 41. `bosses_aq20_2.png` — 安其拉废墟 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Buru the Gorger, huge bloated silithid with crystalline armored shell and gaping maw — idle pose
2. Buru the Gorger, huge bloated silithid with crystalline armored shell and gaping maw — moving/walking pose
3. Buru the Gorger, huge bloated silithid with crystalline armored shell and gaping maw — melee or main attack pose
4. Buru the Gorger, huge bloated silithid with crystalline armored shell and gaping maw — casting signature spell pose with glow
5. Ayamiss the Hunter, giant winged silithid wasp queen, purple-gold carapace, huge stinger — idle pose
6. Ayamiss the Hunter, giant winged silithid wasp queen, purple-gold carapace, huge stinger — moving/walking pose
7. Ayamiss the Hunter, giant winged silithid wasp queen, purple-gold carapace, huge stinger — melee or main attack pose
8. Ayamiss the Hunter, giant winged silithid wasp queen, purple-gold carapace, huge stinger — casting signature spell pose with glow
9. Ossirian the Unscarred, towering Qiraji lord with flawless gold-black carapace, four arms, crown of horns — idle pose
10. Ossirian the Unscarred, towering Qiraji lord with flawless gold-black carapace, four arms, crown of horns — moving/walking pose
11. Ossirian the Unscarred, towering Qiraji lord with flawless gold-black carapace, four arms, crown of horns — melee or main attack pose
12. Ossirian the Unscarred, towering Qiraji lord with flawless gold-black carapace, four arms, crown of horns — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 42. `adds_aq20_1.png` — 安其拉废墟 阶段形态与召唤物

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Qiraji Warrior, insectoid foot soldier with spear — idle pose
2. Qiraji Warrior, insectoid foot soldier with spear — attack pose
3. Swarmguard Needler, small insectoid with needle launcher — idle pose
4. Swarmguard Needler, small insectoid with needle launcher — attack pose
5. Captain Qeez, Qiraji captain with red banner — idle pose
6. Captain Qeez, Qiraji captain with red banner — attack pose
7. Captain Tuubid, Qiraji captain with horn — idle pose
8. Captain Tuubid, Qiraji captain with horn — attack pose
9. Captain Drenn, Qiraji captain shaman — idle pose
10. Captain Drenn, Qiraji captain shaman — attack pose
11. Moam petrified, grey stone statue form with dimmed runes
12. Mana Fiend, floating blue arcane elemental with crackling energy — idle pose
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 43. `adds_aq20_2.png` — 安其拉废墟 阶段形态与召唤物

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 9 cells used, read left-to-right then top-to-bottom:
1. Mana Fiend, floating blue arcane elemental with crackling energy — attack pose
2. Buru transformed, shell cracked off, raw red-purple flesh, faster stance
3. Hive'Zara Hatchling, tiny white silithid larva — idle pose
4. Hive'Zara Hatchling, tiny white silithid larva — attack pose
5. Ayamiss hovering high with wings blurred, shadow below
6. Hive'Zara Swarmer, small wasp — idle pose
7. Hive'Zara Swarmer, small wasp — attack pose
8. Hive'Zara Larva, fat white grub — idle pose
9. Hive'Zara Larva, fat white grub — attack pose
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 44. `tiles_aq40.png` — 安其拉神殿 瓦片集 · 通用（4×4 例外：沿用现有 tiles 加载格式 256×256）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, seamless tileset. 4x4 grid of 16px top-down pixel tiles for an old-god insect temple (Temple of Ahn'Qiraj): row0 four floor variants mixing gold Qiraji stone and purple organic flesh with veins; row1 four wall-front variants of golden carved Qiraji wall overgrown with pulsing purple flesh; row2 wall-top dark flesh mass, golden reliquary crate, golden insect-statue pillar, green ichor pool; row3 four decorated floors: tentacle holes, glowing purple vein cluster, scarab shell pile, eye-shaped glyph. 256x256 total, 64x64 per tile, tiles must tile seamlessly.
```

### 45. `tiles_aq40_1.png` — 安其拉神殿 瓦片集 · 克苏恩之胃（4×4 例外：沿用现有 tiles 加载格式 256×256）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, seamless tileset. 4x4 grid of 16px top-down pixel tiles for the inside of a giant stomach: row0 pink-purple fleshy floor with acid puddles; row1 rib-like flesh wall fronts; row2 flesh mass top, bone crate, tentacle pillar, bubbling green acid pool; row3 decorated floors with half-digested bones. 256x256 total, 64x64 per tile, tiles must tile seamlessly.
```

### 46. `props_aq40.png` — 安其拉神殿 机关（每个 2 格：待机 / 触发）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 2 rows, each cell 256x256 px, 8 cells used, read left-to-right then top-to-bottom:
1. silithid tunnel hole in the floor with resin rim, idle and emerging — idle/dormant state
2. silithid tunnel hole in the floor with resin rim, idle and emerging — active/triggered state
3. dirt mound with scarab beetles crawling out — idle/dormant state
4. dirt mound with scarab beetles crawling out — active/triggered state
5. wet tentacle hole in flesh floor, purple slime rim — idle/dormant state
6. wet tentacle hole in flesh floor, purple slime rim — active/triggered state
7. stomach exit, upward rising pink fleshy vent with air bubbles — idle/dormant state
8. stomach exit, upward rising pink fleshy vent with air bubbles — active/triggered state
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 47. `mobs_aq40_1.png` — 安其拉神殿 小怪（每种 3 格：待机 / 走路 / 攻击）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Anubisath Sentinel, tall jackal-headed gold-black stone construct with glaive — idle pose facing right
2. Anubisath Sentinel, tall jackal-headed gold-black stone construct with glaive — walking stride facing right
3. Anubisath Sentinel, tall jackal-headed gold-black stone construct with glaive — attack pose (哨兵能力)
4. Vekniss Stinger, red-purple flying silithid with venomous stinger — idle pose facing right
5. Vekniss Stinger, red-purple flying silithid with venomous stinger — walking stride facing right
6. Vekniss Stinger, red-purple flying silithid with venomous stinger — attack pose (冲锋)
7. Qiraji Lasher, insectoid warrior with whip-like bladed arms, spinning stance — idle pose facing right
8. Qiraji Lasher, insectoid warrior with whip-like bladed arms, spinning stance — walking stride facing right
9. Qiraji Lasher, insectoid warrior with whip-like bladed arms, spinning stance — attack pose (旋风斩)
10. Anubisath Defender, massive armored jackal-headed construct with tower shield and obsidian runes — idle pose facing right
11. Anubisath Defender, massive armored jackal-headed construct with tower shield and obsidian runes — walking stride facing right
12. Anubisath Defender, massive armored jackal-headed construct with tower shield and obsidian runes — attack pose (暗影风暴)
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 48. `mobs_aq40_2.png` — 安其拉神殿 小怪（每种 3 格：待机 / 走路 / 攻击）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 2 rows, each cell 256x256 px, 6 cells used, read left-to-right then top-to-bottom:
1. Qiraji Brainwasher, slender insectoid psychic with enlarged head and glowing purple antennae — idle pose facing right
2. Qiraji Brainwasher, slender insectoid psychic with enlarged head and glowing purple antennae — walking stride facing right
3. Qiraji Brainwasher, slender insectoid psychic with enlarged head and glowing purple antennae — attack pose (精神鞭笞)
4. Obsidian Eradicator, floating black obsidian golem with gold Qiraji bands and purple core — idle pose facing right
5. Obsidian Eradicator, floating black obsidian golem with gold Qiraji bands and purple core — walking stride facing right
6. Obsidian Eradicator, floating black obsidian golem with gold Qiraji bands and purple core — attack pose (法力吸取)
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 49. `bosses_aq40_1.png` — 安其拉神殿 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. The Prophet Skeram, slender Qiraji prophet with ornate gold robes, elongated head, glowing staff — idle pose
2. The Prophet Skeram, slender Qiraji prophet with ornate gold robes, elongated head, glowing staff — moving/walking pose
3. The Prophet Skeram, slender Qiraji prophet with ornate gold robes, elongated head, glowing staff — melee or main attack pose
4. The Prophet Skeram, slender Qiraji prophet with ornate gold robes, elongated head, glowing staff — casting signature spell pose with glow
5. Lord Kri, bulky green-brown silithid royal with spiked carapace — idle pose
6. Lord Kri, bulky green-brown silithid royal with spiked carapace — moving/walking pose
7. Lord Kri, bulky green-brown silithid royal with spiked carapace — melee or main attack pose
8. Lord Kri, bulky green-brown silithid royal with spiked carapace — casting signature spell pose with glow
9. Vem, massive grey-blue armored silithid beetle with battering-ram head — idle pose
10. Vem, massive grey-blue armored silithid beetle with battering-ram head — moving/walking pose
11. Vem, massive grey-blue armored silithid beetle with battering-ram head — melee or main attack pose
12. Vem, massive grey-blue armored silithid beetle with battering-ram head — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 50. `bosses_aq40_2.png` — 安其拉神殿 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Princess Yauj, slender purple silithid royal with ornate wings and staff — idle pose
2. Princess Yauj, slender purple silithid royal with ornate wings and staff — moving/walking pose
3. Princess Yauj, slender purple silithid royal with ornate wings and staff — melee or main attack pose
4. Princess Yauj, slender purple silithid royal with ornate wings and staff — casting signature spell pose with glow
5. Battleguard Sartura, Qiraji battleguard with twin crescent glaives, gold armor, spinning stance — idle pose
6. Battleguard Sartura, Qiraji battleguard with twin crescent glaives, gold armor, spinning stance — moving/walking pose
7. Battleguard Sartura, Qiraji battleguard with twin crescent glaives, gold armor, spinning stance — melee or main attack pose
8. Battleguard Sartura, Qiraji battleguard with twin crescent glaives, gold armor, spinning stance — casting signature spell pose with glow
9. Fankriss the Unyielding, giant green-yellow silithid with massive scything forelimbs — idle pose
10. Fankriss the Unyielding, giant green-yellow silithid with massive scything forelimbs — moving/walking pose
11. Fankriss the Unyielding, giant green-yellow silithid with massive scything forelimbs — melee or main attack pose
12. Fankriss the Unyielding, giant green-yellow silithid with massive scything forelimbs — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 51. `bosses_aq40_3.png` — 安其拉神殿 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Viscidus, enormous green translucent poison slime with bubbles and bones floating inside — idle pose
2. Viscidus, enormous green translucent poison slime with bubbles and bones floating inside — moving/walking pose
3. Viscidus, enormous green translucent poison slime with bubbles and bones floating inside — melee or main attack pose
4. Viscidus, enormous green translucent poison slime with bubbles and bones floating inside — casting signature spell pose with glow
5. Princess Huhuran, giant purple-gold silithid wasp princess with jeweled carapace and venom stinger — idle pose
6. Princess Huhuran, giant purple-gold silithid wasp princess with jeweled carapace and venom stinger — moving/walking pose
7. Princess Huhuran, giant purple-gold silithid wasp princess with jeweled carapace and venom stinger — melee or main attack pose
8. Princess Huhuran, giant purple-gold silithid wasp princess with jeweled carapace and venom stinger — casting signature spell pose with glow
9. Emperor Vek'lor, Qiraji emperor caster with gold-purple robes and crown, arcane energy — idle pose
10. Emperor Vek'lor, Qiraji emperor caster with gold-purple robes and crown, arcane energy — moving/walking pose
11. Emperor Vek'lor, Qiraji emperor caster with gold-purple robes and crown, arcane energy — melee or main attack pose
12. Emperor Vek'lor, Qiraji emperor caster with gold-purple robes and crown, arcane energy — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 52. `bosses_aq40_4.png` — 安其拉神殿 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Emperor Vek'nilash, Qiraji emperor warrior with gold armor, crown and huge claws — idle pose
2. Emperor Vek'nilash, Qiraji emperor warrior with gold armor, crown and huge claws — moving/walking pose
3. Emperor Vek'nilash, Qiraji emperor warrior with gold armor, crown and huge claws — melee or main attack pose
4. Emperor Vek'nilash, Qiraji emperor warrior with gold armor, crown and huge claws — casting signature spell pose with glow
5. Ouro, colossal sandworm with ringed segmented body, huge circular maw with teeth, emerging from sand — idle pose
6. Ouro, colossal sandworm with ringed segmented body, huge circular maw with teeth, emerging from sand — moving/walking pose
7. Ouro, colossal sandworm with ringed segmented body, huge circular maw with teeth, emerging from sand — melee or main attack pose
8. Ouro, colossal sandworm with ringed segmented body, huge circular maw with teeth, emerging from sand — casting signature spell pose with glow
9. C'Thun eye phase, gigantic single eye stalk rising from flesh floor, purple-pink veined, tentacles around — idle pose
10. C'Thun eye phase, gigantic single eye stalk rising from flesh floor, purple-pink veined, tentacles around — moving/walking pose
11. C'Thun eye phase, gigantic single eye stalk rising from flesh floor, purple-pink veined, tentacles around — melee or main attack pose
12. C'Thun eye phase, gigantic single eye stalk rising from flesh floor, purple-pink veined, tentacles around — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 53. `adds_aq40_1.png` — 安其拉神殿 阶段形态与召唤物

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. same as Skeram with slightly translucent shimmer — idle pose
2. same as Skeram with slightly translucent shimmer — attack pose
3. Sartura's Royal Guard, Qiraji guard with glaive — idle pose
4. Sartura's Royal Guard, Qiraji guard with glaive — attack pose
5. Spawn of Fankriss, red segmented sand worm — idle pose
6. Spawn of Fankriss, red segmented sand worm — attack pose
7. Vekniss Hatchling, tiny pale silithid — idle pose
8. Vekniss Hatchling, tiny pale silithid — attack pose
9. Viscidus frozen solid, icy blue-green slime with frost cracks
10. Glob of Viscidus, small green slime blob — idle pose
11. Glob of Viscidus, small green slime blob — attack pose
12. Ouro submerged, moving dirt mound with sand spray
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 54. `adds_aq40_2.png` — 安其拉神殿 阶段形态与召唤物

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Ouro Scarab, small black beetle — idle pose
2. Ouro Scarab, small black beetle — attack pose
3. C'Thun true form, colossal fleshy old god mass with many eyes and gaping maw, tentacles
4. C'Thun weakened, deflated purple flesh mass, eyes closed
5. Eye Tentacle, thin purple tentacle topped with an eye — idle pose
6. Eye Tentacle, thin purple tentacle topped with an eye — attack pose
7. Claw Tentacle, thick tentacle with a claw maw — idle pose
8. Claw Tentacle, thick tentacle with a claw maw — attack pose
9. Giant Eye Tentacle, huge tentacle with big eye — idle pose
10. Giant Eye Tentacle, huge tentacle with big eye — attack pose
11. Giant Claw Tentacle, huge clawed tentacle — idle pose
12. Giant Claw Tentacle, huge clawed tentacle — attack pose
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 55. `adds_aq40_3.png` — 安其拉神殿 阶段形态与召唤物

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 1 rows, each cell 256x256 px, 2 cells used, read left-to-right then top-to-bottom:
1. Flesh Tentacle, pink fleshy tentacle inside stomach — idle pose
2. Flesh Tentacle, pink fleshy tentacle inside stomach — attack pose
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 56. `tiles_naxx.png` — 纳克萨玛斯 瓦片集 · 通用（4×4 例外：沿用现有 tiles 加载格式 256×256）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, seamless tileset. 4x4 grid of 16px top-down pixel tiles for a floating undead necropolis (Naxxramas, generic halls): row0 four dark green-grey necropolis stone floor variants with Scourge rune grooves; row1 four gothic necropolis wall-front variants with green glowing windows and spikes; row2 wall-top dark spiked stone, bone-reinforced crate, Scourge obelisk pillar with green crystal, plague slime pool; row3 four decorated floors: skull pile, plague grate, glowing green rune, scattered chains. 256x256 total, 64x64 per tile, tiles must tile seamlessly.
```

### 57. `tiles_naxx_1.png` — 纳克萨玛斯 瓦片集 · 蜘蛛区（4×4 例外：沿用现有 tiles 加载格式 256×256）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, seamless tileset. 4x4 grid of 16px top-down pixel tiles: Naxxramas Arachnid Quarter – row0 webbed dark stone floors; row1 walls covered in thick spider silk; row2 web-mass wall top, silk-wrapped cocoon crate, web-wrapped pillar, green venom pool; row3 floors with spider egg sacs, bones in web, venom drip, crawling spiderlings. 256x256 total, 64x64 per tile, tiles must tile seamlessly.
```

### 58. `tiles_naxx_2.png` — 纳克萨玛斯 瓦片集 · 瘟疫区（4×4 例外：沿用现有 tiles 加载格式 256×256）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, seamless tileset. 4x4 grid of 16px top-down pixel tiles: Naxxramas Plague Quarter – row0 rotten stone floors with green slime; row1 walls with plague pipes; row2 wall top, plague cauldron crate, fungus-covered pillar, plague fissure pool; row3 floors with spore mushrooms, eruption cracks, rotten roots, toxic puddle. 256x256 total, 64x64 per tile, tiles must tile seamlessly.
```

### 59. `tiles_naxx_3.png` — 纳克萨玛斯 瓦片集 · 军事区（4×4 例外：沿用现有 tiles 加载格式 256×256）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, seamless tileset. 4x4 grid of 16px top-down pixel tiles: Naxxramas Military Quarter – row0 iron-plated training floor; row1 walls with weapon racks and banners; row2 wall top, weapon crate, training dummy pillar, soul portal pool; row3 floors with sword marks, skeleton horse bones, ghostly rune, iron grate. 256x256 total, 64x64 per tile, tiles must tile seamlessly.
```

### 60. `tiles_naxx_4.png` — 纳克萨玛斯 瓦片集 · 构造区（4×4 例外：沿用现有 tiles 加载格式 256×256）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, seamless tileset. 4x4 grid of 16px top-down pixel tiles: Naxxramas Construct Quarter – row0 bloody slaughterhouse stone floors; row1 walls with hooks and stitched flesh; row2 wall top, meat crate, tesla coil pillar, slime vat pool; row3 floors with blood drain, stitched corpse parts, sewer grate, green slime trail. 256x256 total, 64x64 per tile, tiles must tile seamlessly.
```

### 61. `tiles_naxx_5.png` — 纳克萨玛斯 瓦片集 · 冰霜巨龙巢穴（4×4 例外：沿用现有 tiles 加载格式 256×256）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, seamless tileset. 4x4 grid of 16px top-down pixel tiles: Frostwyrm Lair – row0 frozen dark stone floors with frost; row1 icy walls with frozen bones; row2 snow wall top, ice block crate, frozen bone pillar, frozen pool; row3 floors with frost runes, snowdrift, frozen skeleton, blue glowing crack. 256x256 total, 64x64 per tile, tiles must tile seamlessly.
```

### 62. `props_naxx.png` — 纳克萨玛斯 机关（每个 2 格：待机 / 触发）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. large white spider web patch on floor — idle/dormant state
2. large white spider web patch on floor — active/triggered state
3. glowing green plague fissure crack, dormant and erupting — idle/dormant state
4. glowing green plague fissure crack, dormant and erupting — active/triggered state
5. Scourge tombstone — idle/dormant state
6. Scourge tombstone — active/triggered state
7. tesla coil tower with crackling blue lightning, idle and discharging — idle/dormant state
8. tesla coil tower with crackling blue lightning, idle and discharging — active/triggered state
9. ice block cube (see fx) — idle/dormant state
10. ice block cube (see fx) — active/triggered state
11. iron portcullis gate with ghostly green glow, closed and open — idle/dormant state
12. iron portcullis gate with ghostly green glow, closed and open — active/triggered state
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 63. `mobs_naxx_1.png` — 纳克萨玛斯 小怪（每种 3 格：待机 / 走路 / 攻击）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Carrion Spinner, bloated undead spider with exposed ribs and green venom — idle pose facing right
2. Carrion Spinner, bloated undead spider with exposed ribs and green venom — walking stride facing right
3. Carrion Spinner, bloated undead spider with exposed ribs and green venom — attack pose (蛛网喷射)
4. Infectious Ghoul, hunched green-skinned ghoul with long claws and exposed spine — idle pose facing right
5. Infectious Ghoul, hunched green-skinned ghoul with long claws and exposed spine — walking stride facing right
6. Infectious Ghoul, hunched green-skinned ghoul with long claws and exposed spine — attack pose (腐肉扑击)
7. Deathknight Captain, undead knight in black saronite-less dark iron plate with runeblade and tattered cape — idle pose facing right
8. Deathknight Captain, undead knight in black saronite-less dark iron plate with runeblade and tattered cape — walking stride facing right
9. Deathknight Captain, undead knight in black saronite-less dark iron plate with runeblade and tattered cape — attack pose (旋风斩)
10. Necropolis Acolyte, gaunt cultist in dark purple robes with skull mask, shadow orb — idle pose facing right
11. Necropolis Acolyte, gaunt cultist in dark purple robes with skull mask, shadow orb — walking stride facing right
12. Necropolis Acolyte, gaunt cultist in dark purple robes with skull mask, shadow orb — attack pose (暗影箭齐射)
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 64. `mobs_naxx_2.png` — 纳克萨玛斯 小怪（每种 3 格：待机 / 走路 / 攻击）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 2 rows, each cell 256x256 px, 6 cells used, read left-to-right then top-to-bottom:
1. Patchwork Golem, stitched flesh golem with hook hand and cleaver, green skin, metal plates — idle pose facing right
2. Patchwork Golem, stitched flesh golem with hook hand and cleaver, green skin, metal plates — walking stride facing right
3. Patchwork Golem, stitched flesh golem with hook hand and cleaver, green skin, metal plates — attack pose (顺劈斩)
4. Stoneskin Gargoyle, grey stone gargoyle with bat wings and glowing green eyes — idle pose facing right
5. Stoneskin Gargoyle, grey stone gargoyle with bat wings and glowing green eyes — walking stride facing right
6. Stoneskin Gargoyle, grey stone gargoyle with bat wings and glowing green eyes — attack pose (酸液齐射)
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 65. `bosses_naxx_1.png` — 纳克萨玛斯 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Anub'Rekhan, giant undead crypt lord nerubian, bone-white and dark purple carapace, scythe forelegs — idle pose
2. Anub'Rekhan, giant undead crypt lord nerubian, bone-white and dark purple carapace, scythe forelegs — moving/walking pose
3. Anub'Rekhan, giant undead crypt lord nerubian, bone-white and dark purple carapace, scythe forelegs — melee or main attack pose
4. Anub'Rekhan, giant undead crypt lord nerubian, bone-white and dark purple carapace, scythe forelegs — casting signature spell pose with glow
5. Grand Widow Faerlina, undead priestess in black-purple spider-themed robes and veil, venomous staff — idle pose
6. Grand Widow Faerlina, undead priestess in black-purple spider-themed robes and veil, venomous staff — moving/walking pose
7. Grand Widow Faerlina, undead priestess in black-purple spider-themed robes and veil, venomous staff — melee or main attack pose
8. Grand Widow Faerlina, undead priestess in black-purple spider-themed robes and veil, venomous staff — casting signature spell pose with glow
9. Maexxna, enormous undead black widow spider with bone-white markings and dripping venom fangs — idle pose
10. Maexxna, enormous undead black widow spider with bone-white markings and dripping venom fangs — moving/walking pose
11. Maexxna, enormous undead black widow spider with bone-white markings and dripping venom fangs — melee or main attack pose
12. Maexxna, enormous undead black widow spider with bone-white markings and dripping venom fangs — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 66. `bosses_naxx_2.png` — 纳克萨玛斯 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Noth the Plaguebringer, undead necromancer in green-black robes with plague skull staff, glowing green eyes — idle pose
2. Noth the Plaguebringer, undead necromancer in green-black robes with plague skull staff, glowing green eyes — moving/walking pose
3. Noth the Plaguebringer, undead necromancer in green-black robes with plague skull staff, glowing green eyes — melee or main attack pose
4. Noth the Plaguebringer, undead necromancer in green-black robes with plague skull staff, glowing green eyes — casting signature spell pose with glow
5. Heigan the Unclean, hunched undead plague priest in tattered green robes with plague censer — idle pose
6. Heigan the Unclean, hunched undead plague priest in tattered green robes with plague censer — moving/walking pose
7. Heigan the Unclean, hunched undead plague priest in tattered green robes with plague censer — melee or main attack pose
8. Heigan the Unclean, hunched undead plague priest in tattered green robes with plague censer — casting signature spell pose with glow
9. Loatheb, huge rotting fungal abomination with mushroom caps, gaping maw and spore clouds — idle pose
10. Loatheb, huge rotting fungal abomination with mushroom caps, gaping maw and spore clouds — moving/walking pose
11. Loatheb, huge rotting fungal abomination with mushroom caps, gaping maw and spore clouds — melee or main attack pose
12. Loatheb, huge rotting fungal abomination with mushroom caps, gaping maw and spore clouds — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 67. `bosses_naxx_3.png` — 纳克萨玛斯 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Instructor Razuvious, burly undead death knight instructor with spiked pauldrons and massive runeblade — idle pose
2. Instructor Razuvious, burly undead death knight instructor with spiked pauldrons and massive runeblade — moving/walking pose
3. Instructor Razuvious, burly undead death knight instructor with spiked pauldrons and massive runeblade — melee or main attack pose
4. Instructor Razuvious, burly undead death knight instructor with spiked pauldrons and massive runeblade — casting signature spell pose with glow
5. Gothik the Harvester, gaunt undead necromancer with scythe and dark green-black robes, soul flames — idle pose
6. Gothik the Harvester, gaunt undead necromancer with scythe and dark green-black robes, soul flames — moving/walking pose
7. Gothik the Harvester, gaunt undead necromancer with scythe and dark green-black robes, soul flames — melee or main attack pose
8. Gothik the Harvester, gaunt undead necromancer with scythe and dark green-black robes, soul flames — casting signature spell pose with glow
9. Thane Korth'azz, armored dwarf death knight on skeletal horse, fiery meteor hammer — idle pose
10. Thane Korth'azz, armored dwarf death knight on skeletal horse, fiery meteor hammer — moving/walking pose
11. Thane Korth'azz, armored dwarf death knight on skeletal horse, fiery meteor hammer — melee or main attack pose
12. Thane Korth'azz, armored dwarf death knight on skeletal horse, fiery meteor hammer — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 68. `bosses_naxx_4.png` — 纳克萨玛斯 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Lady Blaumeux, undead female death knight on skeletal horse, purple void magic — idle pose
2. Lady Blaumeux, undead female death knight on skeletal horse, purple void magic — moving/walking pose
3. Lady Blaumeux, undead female death knight on skeletal horse, purple void magic — melee or main attack pose
4. Lady Blaumeux, undead female death knight on skeletal horse, purple void magic — casting signature spell pose with glow
5. Highlord Mograine, death knight lord on skeletal horse with Ashbringer-like corrupted greatsword — idle pose
6. Highlord Mograine, death knight lord on skeletal horse with Ashbringer-like corrupted greatsword — moving/walking pose
7. Highlord Mograine, death knight lord on skeletal horse with Ashbringer-like corrupted greatsword — melee or main attack pose
8. Highlord Mograine, death knight lord on skeletal horse with Ashbringer-like corrupted greatsword — casting signature spell pose with glow
9. Sir Zeliek, undead paladin knight on skeletal horse, holy light corrupted — idle pose
10. Sir Zeliek, undead paladin knight on skeletal horse, holy light corrupted — moving/walking pose
11. Sir Zeliek, undead paladin knight on skeletal horse, holy light corrupted — melee or main attack pose
12. Sir Zeliek, undead paladin knight on skeletal horse, holy light corrupted — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 69. `bosses_naxx_5.png` — 纳克萨玛斯 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Patchwerk, enormous stitched abomination with hooks, cleaver and meat-hook arms, bloated green body — idle pose
2. Patchwerk, enormous stitched abomination with hooks, cleaver and meat-hook arms, bloated green body — moving/walking pose
3. Patchwerk, enormous stitched abomination with hooks, cleaver and meat-hook arms, bloated green body — melee or main attack pose
4. Patchwerk, enormous stitched abomination with hooks, cleaver and meat-hook arms, bloated green body — casting signature spell pose with glow
5. Grobbulus, bloated slime-filled abomination with tubes and green ooze leaking, giant arms — idle pose
6. Grobbulus, bloated slime-filled abomination with tubes and green ooze leaking, giant arms — moving/walking pose
7. Grobbulus, bloated slime-filled abomination with tubes and green ooze leaking, giant arms — melee or main attack pose
8. Grobbulus, bloated slime-filled abomination with tubes and green ooze leaking, giant arms — casting signature spell pose with glow
9. Gluth, monstrous undead plague hound with exposed ribs, huge jaws and rotting green fur — idle pose
10. Gluth, monstrous undead plague hound with exposed ribs, huge jaws and rotting green fur — moving/walking pose
11. Gluth, monstrous undead plague hound with exposed ribs, huge jaws and rotting green fur — melee or main attack pose
12. Gluth, monstrous undead plague hound with exposed ribs, huge jaws and rotting green fur — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 70. `bosses_naxx_6.png` — 纳克萨玛斯 首领（每个 4 格：待机 / 移动 / 攻击 / 施法）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Thaddius, giant stitched flesh golem with tesla coils embedded, blue-red electric arcs, chained — idle pose
2. Thaddius, giant stitched flesh golem with tesla coils embedded, blue-red electric arcs, chained — moving/walking pose
3. Thaddius, giant stitched flesh golem with tesla coils embedded, blue-red electric arcs, chained — melee or main attack pose
4. Thaddius, giant stitched flesh golem with tesla coils embedded, blue-red electric arcs, chained — casting signature spell pose with glow
5. Sapphiron, huge skeletal frost wyrm, icy blue bones, frost mist from ribcage, glowing blue eyes — idle pose
6. Sapphiron, huge skeletal frost wyrm, icy blue bones, frost mist from ribcage, glowing blue eyes — moving/walking pose
7. Sapphiron, huge skeletal frost wyrm, icy blue bones, frost mist from ribcage, glowing blue eyes — melee or main attack pose
8. Sapphiron, huge skeletal frost wyrm, icy blue bones, frost mist from ribcage, glowing blue eyes — casting signature spell pose with glow
9. Kel'Thuzad, floating lich in dark blue-purple robes with frost aura, skeletal face, ornate staff (level 60 Naxxramas) — idle pose
10. Kel'Thuzad, floating lich in dark blue-purple robes with frost aura, skeletal face, ornate staff (level 60 Naxxramas) — moving/walking pose
11. Kel'Thuzad, floating lich in dark blue-purple robes with frost aura, skeletal face, ornate staff (level 60 Naxxramas) — melee or main attack pose
12. Kel'Thuzad, floating lich in dark blue-purple robes with frost aura, skeletal face, ornate staff (level 60 Naxxramas) — casting signature spell pose with glow
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 71. `adds_naxx_1.png` — 纳克萨玛斯 阶段形态与召唤物

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Crypt Guard, armored undead nerubian warrior — idle pose
2. Crypt Guard, armored undead nerubian warrior — attack pose
3. Corpse Scarab, small black undead beetle — idle pose
4. Corpse Scarab, small black undead beetle — attack pose
5. Naxxramas Worshipper, robed cultist kneeling — idle pose
6. Naxxramas Worshipper, robed cultist kneeling — attack pose
7. Naxxramas Follower, armored cultist with mace — idle pose
8. Naxxramas Follower, armored cultist with mace — attack pose
9. Maexxna Spiderling, tiny black spider — idle pose
10. Maexxna Spiderling, tiny black spider — attack pose
11. Plagued Warrior, undead soldier with rusty sword — idle pose
12. Plagued Warrior, undead soldier with rusty sword — attack pose
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 72. `adds_naxx_2.png` — 纳克萨玛斯 阶段形态与召唤物

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Plagued Guardian, undead caster with green flames — idle pose
2. Plagued Guardian, undead caster with green flames — attack pose
3. Deathknight Understudy, young undead knight with shield — idle pose
4. Deathknight Understudy, young undead knight with shield — attack pose
5. Unrelenting Trainee, living death knight trainee — idle pose
6. Unrelenting Trainee, living death knight trainee — attack pose
7. Unrelenting Deathknight, mounted-less death knight — idle pose
8. Unrelenting Deathknight, mounted-less death knight — attack pose
9. Unrelenting Rider, skeletal horse rider — idle pose
10. Unrelenting Rider, skeletal horse rider — attack pose
11. Fallout Slime, glowing green radioactive ooze — idle pose
12. Fallout Slime, glowing green radioactive ooze — attack pose
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 73. `adds_naxx_3.png` — 纳克萨玛斯 阶段形态与召唤物

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. Zombie Chow, shambling bloated zombie — idle pose
2. Zombie Chow, shambling bloated zombie — attack pose
3. Stalagg, hulking blue-grey flesh golem connected to tesla coil — idle pose
4. Stalagg, hulking blue-grey flesh golem connected to tesla coil — attack pose
5. Feugen, hulking red-grey flesh golem connected to tesla coil — idle pose
6. Feugen, hulking red-grey flesh golem connected to tesla coil — attack pose
7. Sapphiron airborne, frost wyrm with wings spread, frost trailing
8. Guardian of Icecrown, giant armored undead with ice spikes — idle pose
9. Guardian of Icecrown, giant armored undead with ice spikes — attack pose
10. Unstoppable Abomination, stitched undead hulk — idle pose
11. Unstoppable Abomination, stitched undead hulk — attack pose
12. Soul Weaver, ghostly floating wraith — idle pose
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 74. `adds_naxx_4.png` — 纳克萨玛斯 阶段形态与召唤物

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 1 rows, each cell 256x256 px, 3 cells used, read left-to-right then top-to-bottom:
1. Soul Weaver, ghostly floating wraith — attack pose
2. Soldier of the Frozen Wastes, small skeleton soldier — idle pose
3. Soldier of the Frozen Wastes, small skeleton soldier — attack pose
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

### 75. `fx_raid_black_1.png` — 新增特效（黑底发光）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 12 cells used, read left-to-right then top-to-bottom:
1. pulsing orange-red bomb sigil ring with countdown sparks, top-down
2. floating purple-green curse skull icon with dripping smoke
3. glowing violet eye with tendrils, mind control mark
4. translucent golden hexagon bubble shield with reflection glint
5. spiky red fire aura shield bubble
6. green healing light pillar rising from a tribal totem base
7. huge red glaring eye symbol hovering, menacing
8. blue electric plus sign orb crackling
9. red electric minus sign orb crackling
10. four glowing sigils: orange meteor rune, purple void rune, golden holy rune, white-blue righteous rune
11. green digestive acid bubbles and froth
12. small swirling sand tornado, tan and gold, top-down 3/4
Background: solid pure black #000000 (glowing effect for additive blending; keep effect centered, fading to black at edges).
```

### 76. `fx_raid_black_2.png` — 新增特效（黑底发光）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 3 rows, each cell 256x256 px, 9 cells used, read left-to-right then top-to-bottom:
1. thick crimson blood beam with droplets, horizontal
2. zigzag chain lightning bolt, cyan-white, horizontal
3. swarm cloud of tiny dark green locusts, circular
4. falling molten lava bomb with fiery trail
5. shadow bolt projectile, purple-black flame, facing right
6. arcane explosion ring, pink-violet runic shockwave
7. holy wrath golden bouncing orb with sparkles
8. white spider web splat, circular, slightly glowing
9. thin ornate cast bar frame, dark with gold rim
Background: solid pure black #000000 (glowing effect for additive blending; keep effect centered, fading to black at edges).
```

### 77. `fx_raid_green.png` — 新增特效（绿底实体）

```
16-bit pixel art game sprite sheet, crisp hard pixels, no anti-aliasing, limited palette, 1-pixel dark outline (#0b0a12), light from top-left with 3-tone shading, top-down 3/4 RPG view like Soul Knight, chibi-leaning proportions, strict grid of square cells with no gaps, one subject per cell centered with feet on the cell bottom, identical scale in every cell, no text, no watermark, no ground shadow. Layout: 4 columns x 1 rows, each cell 256x256 px, 3 cells used, read left-to-right then top-to-bottom:
1. spinning troll throwing axe, facing right
2. chunky blue ice block, cube, top-down 3/4
3. white silk cocoon hanging, human-sized
Background: solid pure green #00FF00 everywhere outside the sprites (for chroma key; never use green inside sprites).
```

