# AmberX — Experiment 02

[English](#english)

AmberX 是探索目标式操作与方案比较的独立 Minecraft Java 启动器。当前本地测试版本为 `0.2.0-alpha.1`。

从一句可编辑的目标开始，锁定版本、加载器或需要的功能；将最多三个方案放在桌面比较。可以复制并调整一个方案，检查成功后替换指定位置，并撤销上一次调整。所有方案在安装前重新核验。

现有实例的更改在独立副本中进行。试用结束后记录感受，选择保留、再调整或删除。删除先移入回收站；恢复会保留存档，彻底删除需要输入完整实例名称。

目标、桌面和调整草稿自动保存在本机；中断的安装可以继续，已创建副本可以重新检查。手动创建、中英文、浅深色和减少动画仍可使用。

## 数据与限制

- 离线身份，不支持要求官方认证的服务器；无微软、第三方登录及自动更新。
- 数据在 `%APPDATA%\AmberX\library`；不读取或修改 AMBER / AmberE 的数据。
- 不合并存档、不向原实例应用试用更改；保留副本就是保留一个独立实例。
- 既有实例仅补装内容，版本与加载器不变。远景、光影从全新实例开始。
- 检查依据是平台元数据与兼容规则；负担是估计，不是实测 FPS。反馈只保存在本机。
- 推荐与下载需要联网。分享日志前请检查其中的本地路径和个人信息。

## 本地构建

在 `prototype` 内使用 Node 24 与 pnpm 11：

```text
pnpm install --frozen-lockfile
pnpm test
pnpm test:x
pnpm build
pnpm package:installer
```

安装包、源码包及校验文件位于 `releases/Experiment02`。第一版交付件保留在 `releases/Experiment01`。第二版预发布下载：https://github.com/ayr1k/AmberX/releases/tag/v0.2.0-alpha.1 。

## English

AmberX Experiment 02 (`0.2.0-alpha.1`) explores editable goals, bounded setup comparison and independent trials. Lock a game version, loader or required feature; compare up to three plans, duplicate and adjust a plan, inspect file differences and undo the last successful adjustment. Installation always rechecks metadata.

Changes to existing instances happen in separate copies. After playing, record your observations, keep the instance, revise your goal or recycle the trial. Restoration includes worlds; permanent deletion requires the full instance name. Drafts and the current desk persist locally, and interrupted installations can resume.

Offline identity only. No Microsoft or third-party authentication, automatic updates, world merging or modifications to AMBER/AmberE. Data stays in `%APPDATA%\AmberX\library`. Existing instances retain their version and loader; visual experiments start fresh. Compatibility metadata is not gameplay certification and estimated load is not measured FPS. Hardware choices and feedback stay local.

Build with Node 24 and pnpm 11 using the commands above. Experiment 02 is available as a prerelease at https://github.com/ayr1k/AmberX/releases/tag/v0.2.0-alpha.1 . MPL-2.0; inherited license and third-party notices are retained.
