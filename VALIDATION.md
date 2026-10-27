# Experiment 01 验证记录 / Validation

2026-10-27 · Windows x64 · Electron 45 · Node 24

- 252 项继承核心回归通过；13 项 AmberX 专项测试通过。覆盖版本推荐、兼容依赖、独立副本、原文件变化检测、复制失败、网络失败、恢复、目标绑定、重复操作与离线认证边界。
- 真实网络测试：自动推荐 Minecraft 26.3 / Fabric 0.20.1，安装 Java、游戏和 Sodium、Lithium、FerriteCore；在独立副本中补装便利内容，原实例受检查文件清单及哈希保持一致。
- 副本游戏进程实际启动，日志达到资源/渲染初始化，再关闭该测试进程；保存本地反馈。不是长时间游玩、FPS 基准或所有光影组合的实测。
- 桌面检查：中英文、深浅色、100/125/150/200% 缩放，无横向页面溢出。标签禁止选择；输入与日志允许复制。首页、配方、比较桌面、实验记录与设置已截图检查。
- 打包程序冒烟检查通过：资源读取、系统加密能力、主要 IPC、产品名与版本正确；不暴露微软登录、第三方认证、原实例合并、数据迁移或程序更新接口。

252 inherited core tests and 13 AmberX tests passed. A live download/install/copy/add-on/launch/feedback loop completed with source hashes unchanged. The isolated game reached resource/render initialization; this is not a long-play, FPS or universal shader benchmark. Chinese/English, light/dark and 100–200% scaling were inspected. The packaged app passed startup and exposed-interface checks.

尚未完成 / Not yet covered: all GPU vendors, all Windows scaling/font combinations, all game versions and long-running gameplay. User testing remains necessary. Cross-launcher import and world/source promotion are intentionally absent from this experiment.
