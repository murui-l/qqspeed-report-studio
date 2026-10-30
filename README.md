<div align="center">

# QQ飞车战报工坊

**QQ Speed Report Studio**

从逐局比分生成2v2竞速战报，累计选手总分、场次、均分和冲线率。

代码、模板、实际使用的图片原文件和演示成图一起提供。

[快速开始](#快速开始) · [全部成图](docs/GALLERY.md) · [图片素材](assets/README.md) · [数据格式](docs/DATA.md) · [MIT](LICENSE)

</div>

## 成图先看

### 七局战报 · 爱康tv VS 虾头路障

[![七局战报，爱康tv113比134虾头路障](docs/images/report-06.jpg)](docs/images/report-06.png)

### 九局战报 · 寒岛 VS 宇宙胖猴

[![九局战报，寒岛162比152宇宙胖猴](docs/images/report-05.jpg)](docs/images/report-05.png)

### 累计均分榜

<div align="center">
<a href="docs/images/ranking.png"><img src="docs/images/ranking.jpg" width="520" alt="12名选手累计均分榜，总均分8.06"></a>
</div>

战报为 **3840×2160**，均分榜为 **2160×2880**，同时输出PNG和JPG。点击图片查看高清PNG；[图片目录](docs/images/)中保留全部6场战报和均分榜的原尺寸文件。

上面的演示使用了指定书法字体。仓库默认使用系统中文字体，也可传入自己的TTF，见下方字体用法。

## 能做什么

- **生成战报**：两队各两人、1–12局，逐局赛道竖卡、个人总分和队伍总分。
- **生成均分榜**：1–12名已参赛选手，同分并列，人数变化时自动调整行距。
- **累计多场成绩**：从原始比赛JSON重算，支持显示名映射，拒绝重复比赛ID。
- **核对数据**：总分、局数、缺图、中文溢出与比分排版检查，真实零分显示为`+0`。
- **本地运行**：Node.js + Playwright，生成图片时不需要图像API或API Key。

## 图片原文件也在仓库里

| 内容 | 数量 | 路径 |
|---|---:|---|
| 实际使用的赛道原图 | 22 | [assets/maps/originals](assets/maps/originals/) |
| 对应赛道缩略图 | 22 | [assets/maps](assets/maps/) |
| 透明队标 | 6 | [assets/logos](assets/logos/) |
| 榜单装饰背景 | 1 | [assets/backgrounds](assets/backgrounds/) |
| 高清演示图 | 14 | [docs/images](docs/images/)：7张PNG及7张JPG |

赛道逐张预览及出处见 [图片素材总览](assets/README.md)。[来源索引](assets/sources.json)记录来源和校验值，方便查找与复用。

<table>
<tr>
<td align="center"><img src="assets/logos/bomiao-logo.png" width="180" alt="波喵队标"><br>波喵</td>
<td align="center"><img src="assets/logos/handao-logo.png" width="180" alt="寒岛队标"><br>寒岛</td>
<td align="center"><img src="assets/logos/buzhidou-logo.png" width="180" alt="不知豆队秋裤人物队标"><br>不知豆队</td>
</tr>
<tr>
<td align="center"><img src="assets/logos/xiatou-luzhang-logo.png" width="180" alt="虾头路障队标"><br>虾头路障</td>
<td align="center"><img src="assets/logos/yuzhou-panghou-logo.png" width="180" alt="宇宙胖猴队标"><br>宇宙胖猴</td>
<td align="center"><img src="assets/logos/aikang-tv-logo.png" width="180" alt="爱康tv队标"><br>爱康tv</td>
</tr>
</table>

## 快速开始

准备Node.js 22或更高版本，在终端运行：

```bash
git clone https://github.com/murui-l/qqspeed-report-studio.git
cd qqspeed-report-studio
npm ci
npx playwright install chromium

npm run demo
npm run ranking
```

生成的PNG、JPG、渲染HTML和校验结果保存在`outputs/`及`work/`。Windows上会优先使用已安装的Chrome/Edge；也可以通过`QQSPEED_BROWSER`或`--browser`指定浏览器路径。Linux系统需要中文字体；若缺少，可安装Noto Sans CJK，或使用下面的`--font`。

### 换成自己的比赛

复制 [examples/matches](examples/matches/) 中的一个JSON，修改队名、两名选手、队标路径和每局分数，再运行：

```bash
npm run report -- --config examples/matches/我的比赛.json --out-dir outputs --work-dir work/my-match
```

队标路径相对比分JSON所在目录解析。赛道从仓库内的`assets/maps/catalog.json`读取，也可用`--library`指定其他图库。更改版面可编辑 [templates/report.html](templates/report.html)。

### 自动汇总多场成绩

```bash
npm run standings -- --matches examples/matches --aliases examples/aliases.json --event 杨胖杯 --out outputs/standings.json
npm run ranking -- --config outputs/standings.json --out-dir outputs
```

示例的6场比赛合计 **1547分／192个选手参赛局数**，总均分为 **8.06**。统计从原始分数重算，不会把已四舍五入的均分或百分比直接取平均。

别名在 [examples/aliases.json](examples/aliases.json) 中显式登记。例如战报的“沐瑞”合并到榜单“林敏波”，避免同一个人被拆成两条记录。

### 使用自己的字体

```bash
npm run ranking -- --font "/你的字体/字体.ttf"
```

示例使用过的“字魂白鸽天行体”TTF不随仓库分发。未传字体时使用系统字体，不影响统计逻辑。字体替换目前用于均分榜；战报字体在HTML模板中设置。

## 数据与计分说明

每名选手的`scores`必须与`rounds`逐局对应。零分填`0`，缺项会报错；如填写`total`，必须与逐局求和一致。完整字段和示例见 [数据格式](docs/DATA.md)。

均分＝累计得分÷累计参赛局数。默认把每局最高正分视为第一名，同最高分按并列第一统计；全员零分时无人计第一。如赛事有同秒扣分等规则，使用逐局`first_places`布尔数组提供实际第一名，避免仅凭分数推断。

## 项目结构

```text
src/              战报渲染、均分榜渲染、累计统计、图片索引
templates/        可修改的战报HTML/CSS模板
assets/           图片原文件、缩略图、透明队标、背景及来源
examples/         6场真实比分示例、当前榜单和选手别名
docs/             成图展示和数据说明
test/             累计统计与素材完整性测试
```

验证命令：

```bash
npm test
npm run maps:audit
```

## 开源与贡献

代码及文档采用 [MIT License](LICENSE)。游戏美术、角色参考、队标组成素材和字体分别保留其原有权利，具体见 [图片及字体说明](THIRD_PARTY_NOTICES.md)。图片原文件公开提供，第三方作品不被重新授权为MIT。

欢迎提交 [Issue](https://github.com/murui-l/qqspeed-report-studio/issues) 或PR，详见 [贡献指南](CONTRIBUTING.md)。本工具由 [杨胖杯赛事图鉴](https://github.com/murui-l/yangpang-cup) 中的制作流程整理而来；赛事归档和通用工具分别维护。
