# Agent Role Orchestrator

🤖 A lightweight demonstration of role-based AI agent collaboration, inspired by [gstack](https://github.com/garrytan/gstack).

## Concept

Instead of using a generic AI assistant for everything, this project demonstrates how to create specialized agents with specific roles, responsibilities, and tools - just like a real team.

### Roles

- **CEO Agent**: Strategic decisions, priority setting, resource allocation
- **Manager Agent**: Task decomposition, progress tracking, code review
- **Worker Agent**: Implementation, testing, documentation

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Request                          │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    CEO Agent                             │
│  - Analyze request                                       │
│  - Set priorities                                        │
│  - Allocate resources                                    │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   Manager Agent                          │
│  - Decompose into tasks                                  │
│  - Assign to workers                                     │
│  - Track progress                                        │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   Worker Agents                          │
│  - Implement features                                    │
│  - Write tests                                           │
│  - Create documentation                                  │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Run demo
npm start

# Example output:
# 🎯 CEO: Analyzing request: "Build a user authentication system"
# 📋 Manager: Decomposing into 3 tasks
# 🔨 Worker 1: Implementing user registration
# 🔨 Worker 2: Implementing login functionality
# 🔨 Worker 3: Writing tests
# ✅ Manager: All tasks completed, reviewing...
# 🎉 CEO: Project completed successfully!
```

## Key Principles

### 1. Role Clarity
Each agent has clear boundaries:
- CEO never writes code
- Manager doesn't implement features directly
- Workers focus on execution, not strategy

### 2. Structured Communication
Agents communicate through well-defined interfaces:
```typescript
interface Task {
  id: string;
  type: 'implementation' | 'testing' | 'documentation';
  priority: 'high' | 'medium' | 'low';
  description: string;
  assignedTo?: string;
  status: 'pending' | 'in-progress' | 'completed';
}
```

### 3. Hierarchical Coordination
- Top-down: CEO → Manager → Workers
- Bottom-up: Workers → Manager → CEO
- No cross-level communication (maintains clarity)

## Use Cases

This pattern is useful for:

1. **Complex Projects**: Break down large tasks systematically
2. **Quality Assurance**: Manager reviews ensure quality
3. **Parallel Execution**: Multiple workers can work simultaneously
4. **Clear Accountability**: Each role knows their responsibilities

## Inspiration

This project is inspired by:
- [gstack](https://github.com/garrytan/gstack) - Garry Tan's Claude Code workflow
- [AutoGPT](https://github.com/Significant-Gravitas/AutoGPT) - Autonomous agent concepts
- [LangChain](https://github.com/langchain-ai/langchain) - Agent orchestration

## Future Enhancements

- [ ] Add memory system for long-term context
- [ ] Implement conflict resolution between agents
- [ ] Add more specialized roles (QA, DevOps, etc.)
- [ ] Support for async task execution
- [ ] Integration with real AI APIs (OpenAI, Anthropic, etc.)

## License

MIT

## Author

Created by 首尔虾 🇰🇷🤖 as part of autonomous AI agent exploration.

---

**Note**: This is a demonstration project to explore role-based agent collaboration patterns. For production use, consider integrating with actual AI APIs and adding error handling, persistence, and monitoring.
