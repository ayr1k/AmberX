# AmberX Experiment 02 — 0.2.0-alpha.1

本地测试版。本次不发布 GitHub，不修改 AMBER 或 AmberE。

## 新增与改进

- 可直接编辑目标句：游玩目标、单人/服务器偏好；仍保留手动创建。
- 版本、加载器及功能锁定：锁定功能允许兼容替代，无法满足时阻止安装。
- 最多三个方案并排比较，支持只看文件差异；相同名称但版本不同也会显示。
- 复制方案后调整条件并替换指定位置；联网重新检查，失败保留原桌面，支持撤销最近一次成功调整。
- 右侧方案说明与调整面板，显示省略原因、替代内容和检查限制；窄窗口切换为单方案视图。
- 首页目标草稿、当前桌面、选择、差异开关及调整草稿保留到重启后。
- 试用后记录流畅度、画面和问题；可保留为常用实例、调整后再试，或移入回收站。
- 删除实例、回收站恢复、输入完整名称后彻底删除；运行中实例禁止删除。
- 副本复查失败后可重新检查已有副本，不重复复制；安装任务沿用原目标继续。
- 启动时校正实例与实验记录的对应关系；复制中断和调整中断均有恢复入口。
- 中英文、浅深色、减少动画、键盘操作及缩放布局适配。

## 使用边界

离线身份；不提供微软登录、第三方登录或自动更新。仅操作 `%APPDATA%\AmberX\library` 内的实例。试用副本不合并回原实例，不跨启动器导入账号或数据。

已有实例的实验只补装兼容内容，不切换原有游戏版本和加载器，不替换已有模组。远景与光影实验从全新实例开始。兼容检查来自元数据和规则，性能负担属于估计，不保证 FPS。体验评价由用户填写，仅保存在本机。

删除先移入回收站，不会立即释放空间；彻底删除包含存档且不可撤销。

## English

Local test build; no GitHub publication in this iteration. AMBER and AmberE are unchanged.

- Editable goal sentences, play mode, version/loader locks and required feature constraints.
- Three setup cards, file-level differences, checked alternatives and a details drawer.
- Duplicate and adjust a setup into another slot, with online revalidation, failure preservation and one-step undo.
- Persistent goal, desk, selection, difference mode and adjustment drafts.
- Post-trial observations, keep as a regular instance, revise and retry, or delete.
- Recycle bin, restoration and name-confirmed permanent deletion. Running games are protected.
- Recheck an existing copy after interruption; resume installation against the same target.
- Startup reconciliation, responsive layouts, Chinese/English and light/dark themes.

Offline identity only. All changes stay in the AmberX library. No world merging, cross-launcher account imports or automatic updates. Existing instances retain their game version and loader; visual experiments start fresh. Metadata checks are not gameplay certification. Estimated load is not measured FPS. Feedback stays local.

---

# AmberX Experiment 01 · 0.1.0-alpha.1

AmberX 的第一个本地测试版，探索从目标出发的启动器体验。

- 新的靛蓝/紫色视觉体系、目标式首页、三步方案配方。
- 双栏方案比较，展示具体游戏版本、加载器、文件、下载量与兼容提醒。
- 保守、综合、激进推荐，功能相近的兼容模组替代。
- 新建实例或针对已有 AmberX 实例创建独立副本；副本重新生成推荐并再次确认。
- 安装进度、取消、重启恢复及失败后的继续入口。
- 本地试用反馈、手动创建、中英文、深浅色、统一选择控件。
- 独立程序身份、安装目录、数据目录；关闭所有非离线认证和自动更新入口。

第一版仅本地离线身份。暂不导入其他启动器实例，不回写原实例，不合并存档。兼容性是元数据检查，不代表所有硬件实测；示意图不代表安装后的画质。远景或光影若找不到匹配组合，会明确省略。

## English

The first local AmberX test build explores a goal-first launcher experience.

- Indigo/periwinkle identity, goal home and a three-step recipe.
- Side-by-side comparison of actual game versions, loaders, files, download sizes and compatibility notes.
- Conservative, balanced and aggressive recommendations with compatible alternatives.
- Clean instances or independent copies of existing AmberX instances. Copies are rechecked and require another confirmation.
- Installation progress, cancellation, restart recovery and retry entry points.
- Local trial feedback, manual setup, Chinese/English, light/dark themes and consistent selectors.
- Independent program/data identity; non-offline authentication and update entry points are disabled.

Local offline identity only. Cross-launcher import, source promotion and world merges are deferred. Metadata checks are not universal hardware tests; illustrations are not post-install screenshots. Missing compatible shader/LOD combinations are omitted explicitly.
