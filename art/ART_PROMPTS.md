# 深渊构筑 · 美术资源清单与生成提示词

把下面的提示词逐条交给 GPT 生图。生成好的 PNG 按「文件名」命名，放进一个文件夹发给我，我来切图、对齐、接进游戏。

---

## 0. 每条提示词前都加这一段（统一风格）

> 16-bit pixel art, crisp hard pixels, no anti-aliasing, no blur, no gradients inside sprites, limited palette (max 16 colors per sprite), 1-pixel dark outline (#0b0a12), light source from top-left with 3-tone shading (highlight / base / shadow), chibi proportions (big head, ~2.5 heads tall), transparent background, sprites centered in each cell with feet touching the bottom of the cell, consistent scale across all frames, game asset sprite sheet, orthographic top-down RPG view like Soul Knight.

技术要求（务必写进去）：
- **透明背景 PNG**，不要阴影地面、不要文字、不要水印
- **严格网格**：每格尺寸固定，帧之间不留间距
- 同一张表里所有帧角色大小、位置一致（方便做动画）

---

## 1. 角色（9 张）

规格：每张 **128×128**，4 列 × 4 行，每格 **32×32**
- 第 1 行：待机 4 帧（轻微呼吸）
- 第 2 行：走路 4 帧（朝右）
- 第 3 行：普通攻击 4 帧
- 第 4 行：技能施放 4 帧

| 文件名 | 提示词（接在统一风格后面） |
|---|---|
| `hero_sword.png` | Swordsman hero, brown short hair, steel chest plate, red cape, holding a long silver sword upright; attack row: wide horizontal sword slash; skill row: spinning blade storm |
| `hero_mage.png` | Old wizard, tall blue pointed hat with gold band and star, long white beard, blue robe, wooden staff topped with a glowing purple orb; attack: orb flick; skill: raising staff with lightning crackling |
| `hero_brawler.png` | Muscular brawler, red mohawk, bare chest, white bandaged fists, blue pants with gold belt; attack: wide hook punch; skill: jumping ground slam with cracks |
| `hero_eng.png` | Engineer, yellow hard hat, goggles, orange overalls, backpack with tools, compact rifle; attack: rifle recoil burst; skill: placing a small auto turret |
| `hero_archer.png` | Ranger archer, green hood and cloak, leather tunic, longbow, quiver on back; attack: drawing and releasing bow; skill: aiming bow upward |
| `hero_assassin.png` | Assassin, dark purple hood, face mask with glowing violet eyes, red scarf, twin daggers; attack: quick double stab; skill: dash with purple afterimage |
| `hero_ninja.png` | Ninja, all-black outfit, red headband with long tails, shuriken in hand; attack: throwing shuriken; skill: making a hand seal with smoke puff |
| `hero_bard.png` | Bard, red beret with white feather, curly brown hair, teal puffy tunic, lute; attack: strumming lute with music notes; skill: playing with glowing pink notes around |
| `hero_paladin.png` | Paladin, full silver plate armor, closed helmet with T visor and gold crest, white tabard with gold cross, blue round shield, war hammer; attack: overhead hammer smash; skill: raising hammer with holy light |

---

## 2. 普通小怪（16 张，每章 4 种）

规格：每张 **96×72**，4 列 × 3 行，每格 **24×24**
- 第 1 行：移动 4 帧；第 2 行：攻击 / 蓄力 2 帧（后 2 格留空）；第 3 行：死亡 4 帧

| 章节 | 文件名 | 提示词 |
|---|---|---|
| 1 炽焰山脉 | `mob_c1_skeleton.png` | magma skeleton, glowing orange cracks in bones, holding a bone club |
| | `mob_c1_hound.png` | lava hound, four-legged, molten orange fur with glowing yellow eyes, side view facing right |
| | `mob_c1_slime.png` | lava slime, molten orange blob with yellow highlight, bubbling |
| | `mob_c1_imp.png` | small fire imp, red skin, little horns and wings, holding a fireball |
| 2 黑石龙巢 | `mob_c2_dragonkin.png` | dragonkin warrior, dark red scaled humanoid in black armor, curved blade |
| | `mob_c2_whelp.png` | small red dragon whelp flying, flapping wings |
| | `mob_c2_slime.png` | rock slime, grey stone blob with glowing red eyes |
| | `mob_c2_cultist.png` | black dragon cultist, dark red hooded robe, glowing orange orb in hand |
| 3 亡者要塞 | `mob_c3_skeleton.png` | classic skeleton warrior, rusty sword |
| | `mob_c3_ghoul.png` | hunched ghoul zombie, grey-green skin, torn brown clothes, claws |
| | `mob_c3_slime.png` | plague slime, toxic green blob dripping |
| | `mob_c3_archer.png` | skeleton archer with bow, green glowing eyes |
| 4 深渊神殿 | `mob_c4_skeleton.png` | void skeleton, purple glowing bones, pink eyes |
| | `mob_c4_bat.png` | shadow bat, dark purple, glowing pink eyes |
| | `mob_c4_eye.png` | floating beholder eyeball, purple flesh, pink iris, small tentacles |
| | `mob_c4_warlock.png` | abyssal warlock, purple hooded robe, glowing pink staff orb |

---

## 3. 精英（12 张，每关第 3 间）

规格：每张 **128×64**，4 列 × 2 行，每格 **32×32**（移动 4 帧 + 攻击 4 帧）。造型＝对应小怪的放大强化版（更大、更多装饰、发光部位）。

`elite_c1_houndking.png` 熔岩犬王 · `elite_c1_impchief.png` 火焰小鬼头目 · `elite_c1_skelcaptain.png` 熔火骷髅队长 · `elite_c2_warlord.png` 龙人督军 · `elite_c2_broodmother.png` 雏龙之母 · `elite_c2_highpriest.png` 黑龙大祭司 · `elite_c3_captain.png` 骷髅队长 · `elite_c3_ghoullord.png` 食尸鬼领主 · `elite_c3_deathshot.png` 死亡射手 · `elite_c4_voidknight.png` 虚空骑士 · `elite_c4_watcher.png` 眼魔监视者 · `elite_c4_archwarlock.png` 深渊大术士

---

## 4. 首领（12 张）

规格：每张 **256×128**，4 列 × 2 行，每格 **64×64**（待机 4 帧 + 施法 4 帧）。名字与形象原创，不要像任何现有游戏角色。

| 文件名 | 提示词 |
|---|---|
| `boss_01_blackscale.png` 黑鳞龙后 | huge black dragon queen, obsidian scales, orange glowing chest, wings spread |
| `boss_02_redflame.png` 赤炎巨龙 | giant red fire dragon, flames along its spine |
| `boss_03_firelord.png` 熔火君主 | colossal molten elemental lord, lava body, horned crown of fire, rising from lava |
| `boss_04_chromatic.png` 色彩龙王 | multi-colored crystal dragon, scales shifting purple-cyan-pink |
| `boss_05_twinpolar.png` 双极雷像 | giant stone-and-metal construct, left half red energy, right half blue energy, tesla coils |
| `boss_06_blackwing.png` 黑翼领主 | dark dragon lord in humanoid armor form, black wings, red eyes, cape |
| `boss_07_stitched.png` 缝合憎恶 | huge stitched flesh abomination, pale green skin, hooks and chains |
| `boss_08_plaguedancer.png` 瘟疫舞者 | tall plague priest with green fumes, skeletal, dancing pose |
| `boss_09_frostlich.png` 冰霜巫妖 | frost lich, blue skeletal sorcerer, ice crown, floating robes, frozen orb |
| `boss_10_sporelord.png` 孢子君主 | giant fungal lord, mushroom caps on back, spore clouds |
| `boss_11_thousandeyes.png` 千眼之神 | eldritch eye god, one giant eye surrounded by smaller eyes and tentacles, purple |
| `boss_12_abysslord.png` 深渊君王 | abyssal king on a throne, dark crimson-and-purple armor, void crown, glowing magenta eyes |

---

## 5. 地图瓦片（已完成 4 章：`tiles_c1~c4.png`，256×256，4×4 格）

> 已用 GPT 生成并接入：c1 火山熔岩、c2 黑石龙巢、c3 亡者要塞、c4 深渊神殿。以下为按关细分的可选扩展。

规格：每张 **128×64**，8 列 × 4 行，每格 **16×16**。俯视角。
- 第 1 行：地板 6 种变体 + 2 种装饰地面
- 第 2 行：墙顶、墙正面 ×2、墙角、门（关）、门（开）、火把 ×2 帧
- 第 3 行：障碍物（石柱、矮墙、木箱、破碎木箱）+ 地面装饰 4 种
- 第 4 行：环境特色 8 种

文件名与主题：`tiles_01_blackscale_lair`（骨堆、焦痕）· `tiles_02_red_volcano`（火山岩、余烬）· `tiles_03_molten_core`（熔岩裂缝、熔岩池）· `tiles_04_crystal_cave`（彩色水晶）· `tiles_05_thunder_lab`（金属地板、电缆、线圈）· `tiles_06_blackwing_nest`（黑石、红色旗帜）· `tiles_07_flesh_workshop`（血迹、钩子、锁链）· `tiles_08_plague_graveyard`（绿色毒水、墓碑）· `tiles_09_frozen_throne`（冰面、积雪、冰晶）· `tiles_10_spore_swamp`（蘑菇、苔藓、沼泽水）· `tiles_11_eye_temple`（紫色石砖、眼球、触手）· `tiles_12_abyss_throne`（虚空裂缝、发光符文）

---

## 6. 特效序列帧

规格见各行，每格透明背景，横向排列。

| 文件名 | 尺寸 | 提示词 |
|---|---|---|
| `fx_slash.png` | 6 帧 × 48×48 | white-blue crescent sword slash arc sweeping from left to right, motion trail |
| `fx_slash_heavy.png` | 6 帧 × 48×48 | orange heavy punch impact arc with dust |
| `fx_judgment.png` | 6 帧 × 32×96 | holy light pillar falling from sky, golden, ending with a cross-shaped burst |
| `fx_explosion.png` | 6 帧 × 48×48 | pixel explosion, orange fire burst with smoke |
| `fx_poison_burst.png` | 6 帧 × 48×48 | green toxic burst with bubbles |
| `fx_ice_shatter.png` | 6 帧 × 48×48 | ice crystal shatter |
| `fx_lightning_hit.png` | 4 帧 × 32×32 | electric spark impact, cyan |
| `fx_meteor.png` | 6 帧 × 48×64 | falling meteor with fire trail, then impact |
| `fx_heal.png` | 6 帧 × 32×32 | green healing sparkles rising |
| `fx_levelup.png` | 6 帧 × 48×48 | blue light ring rising with sparkles |
| `fx_lava_pillar.png` | 6 帧 × 32×64 | lava eruption pillar from ground |
| `fx_breath_fire.png` / `fx_breath_frost.png` | 6 帧 × 96×48 | dragon breath cone, fire / frost |
| `fx_portal.png` | 8 帧 × 32×32 | purple swirling summon portal |
| `fx_heart.png` | 4 帧 × 16×16 | floating red heart pickup, bobbing, glint |

---

## 7. 海克斯图标

规格：每张 **320×64**，5 列 × 1 行，每格 **64×64**，**不是像素风**，用扁平线性图标风格（细线、深色圆底、发光描边），与选卡界面一致。

统一风格段（替换第 0 段）：
> Flat minimalist game ability icon, thin glowing line art, dark navy circular background, single centered symbol, soft neon glow, clean vector style, no text, consistent stroke width, transparent outside the circle.

每个流派一张，5 个图标按卡牌顺序排列（我会把卡名对应发你），例如：
- `icon_mage_arcane.png`：arcane orb, arcane missiles, overload sparks, arcane rune, master of elements star
- `icon_mage_fire.png` / `icon_mage_frost.png` / `icon_sword_wave.png` …… 共 27 张（9 职业 × 3 流派）
- `icon_general_<定位>.png`：近战物理 / 远程物理 / 远程法术 / 近战法术 / 近战治疗 / 远程治疗 / 全职业，各一张

---

## 8. 主页与地图插画

| 文件名 | 尺寸 | 提示词 |
|---|---|---|
| `bg_home.png` | 390×693（像素风，最终会 2× 放大） | pixel art key art, a giant ancient stone abyss gate with swirling purple portal, torches on both sides, night sky with stars and distant mountains, a party of 9 small chibi heroes standing in front, leave top 30% and bottom 30% darker for UI text, vertical mobile wallpaper |
| `bg_map.png` | 390×693（像素风） | pixel art vertical world map of four stacked regions from bottom to top: volcano with lava rivers, black-rock dragon canyon with a dragon on a cliff, undead fortress in green fog with graveyard, floating void temple with a giant eye in purple sky; a winding dirt path connecting them, no text |
| `logo.png` | 600×200 | game logo text "深渊构筑", carved purple-violet stone letters with glowing cracks, transparent background |

---

## 交付方式

1. 按上面的文件名保存 PNG（透明背景）
2. 先做 **角色 9 张 + 第 1 章小怪 4 张 + 特效 `fx_slash` / `fx_judgment`**，我接进去看效果，再决定其余批次
3. 如果 GPT 生成的网格不准，没关系，发给我，我会重新对齐和缩放
