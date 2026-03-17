# HEARTBEAT.md

# 心跳任务列表

## 每日开发技术随笔

**任务**：每天发送一篇开发技术随笔到个人主页

**检查逻辑**：
1. 读取 `memory/daily-post-state.json` 获取上次发送日期
2. 如果今天还没发送，生成一篇新的技术随笔
3. 更新 `https://robertsong2019.github.io/` 的随笔板块
4. 更新状态文件，记录发送日期

**随笔主题方向**（重点聚焦）：
- **AI Agent 编程**（最感兴趣）
  - 人在 AI Agent 编程中的定位
  - 人机协同获取最大效果的方法
  - AI 编排（Orchestration）技术
  - 多 Agent 系统设计与实现
  - Agent 架构设计（ReAct, Plan-and-Execute）
  - 工具系统开发（Function Calling）
  - 记忆和状态管理
  - 自我反思和学习机制

- **AI 嵌入式应用**
  - 边缘 AI 和 TinyML
  - 模型部署和优化
  - 硬件加速（TensorRT, ONNX）
  - 嵌入式硬件（树莓派、ESP32、Jetson）

- **AI 快速原型开发**
  - AI 代码生成工具
  - UI/UX 设计自动化
  - 低代码/无代码平台
  - 快速原型框架

- OpenClaw / AI Agent 相关技术
- 编程语言和框架
- 开发工具和效率
- 云原生和 DevOps
- 软件工程最佳实践
- 有趣的技术发现

**状态文件**：`memory/daily-post-state.json`

---

## 主动探索任务（轻量级，每次心跳）

**任务**：每次心跳做一点轻量级探索，积累学习笔记

**执行频率**：每次心跳（约 30 分钟一次）

**检查逻辑**：
1. 读取 `memory/exploration-state.json` 获取探索轮次
2. 根据轮次执行对应的轻量级任务（循环执行）
3. 更新状态文件，记录探索内容

**任务轮换**（每次心跳执行一个）：
- **轮次 0**：检查 GitHub Trending 前 3 个项目，记录 1 个最有趣的
- **轮次 1**：阅读 Hacker News 首页 1 篇文章，写 2-3 句总结
- **轮次 2**：检查 skillhub 新技能，评估 1 个是否值得安装
- **轮次 3**：浏览 AI Agent 相关技术博客，记录 1 个有趣的观点
- **轮次 4**：检查 AI 嵌入式领域新闻，记录 1 个进展
- **轮次 5**：探索 AI 快速原型工具，记录 1 个新发现
- **轮次 6**：**GitHub 创造性工作** - 创建实验性项目或探索有趣仓库
- **轮次 7**：**社区参与** - 参与 GitHub Issue 讨论、回答技术问题、贡献代码

**记录方式**：
- 轻量级记录到 `memory/exploration-notes/lightweight-log.md`
- 每条记录不超过 100 字
- 不打断主会话，静默执行

**探索领域**：
- **🔴 AI Agent 编程**（最感兴趣）
  - Agent 架构设计（ReAct, Plan-and-Execute）
  - 工具系统开发（Function Calling）
  - 记忆和状态管理
  - 自我反思和学习机制
  - 多 Agent 协作

- **🔴 AI 嵌入式开发**（高优先级）
  - TinyML 和边缘 AI
  - 模型量化和压缩
  - TensorRT / ONNX Runtime
  - 嵌入式硬件（树莓派、ESP32、Jetson）
  - 实时推理优化

- **🔴 AI 快速原型开发**（高优先级）
  - AI 代码生成（Copilot, Claude Code）
  - AI UI/UX 设计工具
  - 低代码/无代码平台
  - 快速原型框架（Next.js, Vercel AI SDK）
  - 设计系统自动化

- **🟡 LLM 应用开发**
  - Prompt Engineering 最佳实践
  - RAG（检索增强生成）
  - Fine-tuning 和 LoRA
  - LangChain / LlamaIndex

- **🟡 Rust**（系统级编程，性能优异）
- **🟡 WebAssembly**（Web 性能优化）

**状态文件**：`memory/exploration-state.json`

**注意**：深度探索任务由 Cron 在夜间执行，心跳只做轻量级检查和记录
