# AmberX — Experiment 01

[English](#english)

AmberX 是独立的本地启动器实验。第一版围绕「目标 → 方案 → 比较 → 独立试用 → 反馈」设计，采用获选的靛蓝与紫色标志。版本为 `0.1.0-alpha.1`，与 AMBER 和 AmberE 的版本序列分开。

## 可以体验

- 目标式首页：改善流畅度、生存便利、兼容远景；保留手动创建。
- 可编辑的三步方案配方，实际查询版本、加载器和依赖。
- 保守、综合、激进三档候选；双栏比较与真实文件清单。
- 原实例只读检查；在独立副本重新生成方案，确认后才安装。
- 取消、安装重试、重启恢复、可查看的本地日志。
- 本地反馈、中英文、浅色/深色、自定义选择列表、键盘操作。

## 边界

只使用本地离线玩家名。不能进入要求官方认证的服务器。没有微软或第三方登录，没有自动更新源。数据固定存放于 `%APPDATA%\AmberX\library`，不会自动读取 AMBER / AmberE 的实例或账号。请仅从本包安装，不覆盖其他启动器的程序目录。

第一版从新建实例开始；跨产品实例导入、自动合并存档、向原实例应用更改均未提供。已有 AmberX 实例可以复制后补装便利或性能内容；远景实验需要新建实例。已有手工模组、禁用项和不匹配的文件可能阻止补装，需要用户先整理，不会被悄悄替换。

兼容性来自平台元数据与本地规则，不代表经过所有硬件实测。比较页的同一张风景图只是示意图，不预览推荐后的画质，不预测 FPS。无合适远景或光影组合时会明确省略。

推荐需要网络。Modrinth、Mojang 和 Java 下载服务会接收普通下载请求；问卷硬件结果与实验反馈不会上传。日志可能包含个人路径，分享前请检查。

## 本地构建

在 `prototype` 目录使用 Node 24 和 pnpm 11：

```text
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm test:x
pnpm package:installer
```

源码沿用 MPL-2.0，保留继承模块的许可证与第三方声明。官方仓库：https://github.com/ayr1k/AmberX 。

## English

AmberX Experiment 01 (`0.1.0-alpha.1`) is an independent local launcher experiment: goal → recipe → comparison → separate trial → feedback. It uses the approved indigo/periwinkle identity and does not modify AMBER or AmberE.

Choose smoother gameplay, survival conveniences, or compatible distant terrain. Review conservative, balanced and aggressive plans with actual file lists. Existing AmberX instances are copied before additions; plans are regenerated for the copy and require another confirmation. Manual creation, installation cancellation/resume, local logs, local feedback, Chinese/English, light/dark themes and keyboard-operated selectors are available.

Offline player names only. No Microsoft or third-party sign-in, official-authenticated multiplayer or automatic update feed. Data lives in `%APPDATA%\AmberX\library`. Cross-product imports, world merges and promotion into the original are not included in this experiment. Distant terrain starts in a clean instance. Managed add-on recommendations may reject unmanaged, disabled or modified content instead of replacing it.

Compatibility checks use platform metadata and curated rules; they are not a guarantee of gameplay or FPS. Both comparison illustrations are the same image, not rendered previews of either setup. Missing compatible visual combinations are omitted visibly. Network requests are required for version metadata and downloads; hardware survey results and feedback stay local. Review logs before sharing.

Build in `prototype` with Node 24 and pnpm 11 using the commands above. MPL-2.0; inherited license notices retained. Repository: https://github.com/ayr1k/AmberX .
