# AmberX Experiment 02 验证记录 / Validation

版本：0.2.0-alpha.1。本地测试；未上传 GitHub。

## 已验证

- 252 项已有核心测试及 28 项 AmberX 测试通过。
- 版本/加载器锁定、必需功能不可用时阻断、复制调整失败保留原桌面、撤销和跨重启恢复。
- 副本复查失败继续使用已有副本；安装续传保持同一目标。
- 运行中实例拒绝删除及保留；删除/恢复/彻底删除与实验状态对应。
- 独立 Windows 桌面 UI 验证：目标、对比、差异开关、调整草稿重启恢复、删除/恢复/名称确认彻底删除。
- 浅深色、中英文和 100%/125%/150%/200% 缩放；页面无横向溢出，窄窗口为单卡切换。
- 实际联网查询固定版本的推荐，调整方案并安装到独立副本，启动 Minecraft 并观察到渲染/资源初始化。
- 试用后体验记录、保留、移入回收站、恢复及彻底删除流程完成；原实例受跟踪文件的校验保持不变。

- 最终安装包启动检查通过，111 个运行时文件与最终源码/构建产物一致；安装器的跨产品目录保护通过。
- 实际遇到副本创建后的网络中断，重启后重新检查并复用同一副本完成安装、启动和删除恢复闭环。

## 限制

实际启动验证使用隔离测试目录中的 Minecraft 26.3 / Fabric 0.20.1。它不是所有 Minecraft 版本、GPU、光影组合或多人服务器的全面认证，也没有测量 FPS。

离线身份、没有自动更新；AMBER 和 AmberE 不在本次修改范围内。第一版的安装包与源码包保持独立保留。

## English

252 core tests and 28 AmberX tests passed. Desktop interaction checks cover goal and constraint editing, three-way file comparison, restored drafts, recycling/restoration/permanent deletion, both languages/themes and 100–200% zoom. Live metadata and independent-copy installation were exercised on Minecraft 26.3 / Fabric 0.20.1, followed by a game initialization check and the post-trial lifecycle. Tracked source-instance hashes were unchanged. This is not an FPS benchmark or certification for every game version, GPU, shader or server.
