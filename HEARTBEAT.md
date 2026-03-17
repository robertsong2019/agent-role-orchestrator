# HEARTBEAT.md

# 心跳任务列表

## 每日开发技术随笔

**任务**：每天发送一篇开发技术随笔到个人主页

**检查逻辑**：
1. 读取 `memory/daily-post-state.json` 获取上次发送日期
2. 如果今天还没发送，生成一篇新的技术随笔
3. 更新 `https://robertsong2019.github.io/` 的随笔板块
4. 更新状态文件，记录发送日期

**随笔主题方向**：
- OpenClaw / AI Agent 相关技术
- 编程语言和框架
- 开发工具和效率
- 云原生和 DevOps
- 软件工程最佳实践
- 有趣的技术发现

**状态文件**：`memory/daily-post-state.json`
