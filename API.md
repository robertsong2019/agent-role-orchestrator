# API Documentation - Agent Role Orchestrator

Complete API reference for the role-based AI agent orchestration system.

## Table of Contents

- [Core Classes](#core-classes)
  - [Orchestrator](#orchestrator)
  - [CEOAgent](#ceoagent)
  - [ManagerAgent](#manageragent)
  - [WorkerAgent](#workeragent)
- [Types and Interfaces](#types-and-interfaces)
- [Configuration](#configuration)
- [Error Handling](#error-handling)

---

## Core Classes

### Orchestrator

The main coordinator that manages all agents and handles the complete workflow.

#### Constructor

```typescript
new Orchestrator(config?: OrchestratorConfig)
```

**Parameters:**
- `config` (optional): Configuration object
  - `enableLLM`: boolean - Enable real LLM API calls (default: false)
  - `apiKeys`: object - API keys for LLM providers
  - `logging`: boolean - Enable detailed logging (default: true)

**Example:**

```typescript
import { Orchestrator } from 'agent-role-orchestrator';

// Basic usage (simulation mode)
const orchestrator = new Orchestrator();

// With LLM integration
const orchestrator = new Orchestrator({
  enableLLM: true,
  apiKeys: {
    zhipu: process.env.ZHIPU_API_KEY
  },
  logging: true
});
```

#### Methods

##### `processRequest(request: string): Promise<ProjectResult>`

Process a user request through the complete agent workflow.

**Parameters:**
- `request`: string - User's project request

**Returns:**
- `Promise<ProjectResult>` - Complete project result with tasks and outputs

**Example:**

```typescript
const result = await orchestrator.processRequest(
  'Build a REST API with user authentication'
);

console.log(result.summary);
console.log(result.tasks);
```

##### `shutdown(): void`

Gracefully shutdown the orchestrator and all agents.

**Example:**

```typescript
orchestrator.shutdown();
```

---

### CEOAgent

Strategic decision-maker that analyzes requests and sets priorities.

#### Constructor

```typescript
new CEOAgent(id: string, config?: AgentConfig)
```

**Parameters:**
- `id`: string - Unique agent identifier
- `config` (optional): Agent configuration
  - `enableLLM`: boolean - Use real LLM (default: false)

**Example:**

```typescript
import { CEOAgent } from 'agent-role-orchestrator';

const ceo = new CEOAgent('ceo-1', { enableLLM: true });
```

#### Methods

##### `analyzeRequest(request: string): Promise<ProjectPlan>`

Analyze a user request and create a strategic plan.

**Parameters:**
- `request`: string - User's project request

**Returns:**
- `Promise<ProjectPlan>` - Strategic plan with priorities and resource allocation

**Example:**

```typescript
const plan = await ceo.analyzeRequest(
  'Build a web scraping tool with rate limiting'
);

console.log(plan.priorities); // ['high', 'medium', 'low']
console.log(plan.estimatedTime); // '2-3 days'
```

##### `reviewProject(result: ProjectResult): Promise<ProjectReview>`

Review completed project and provide strategic feedback.

**Parameters:**
- `result`: ProjectResult - Completed project result

**Returns:**
- `Promise<ProjectReview>` - Review with approval status and feedback

**Example:**

```typescript
const review = await ceo.reviewProject(projectResult);

if (review.approved) {
  console.log('✅ Project approved:', review.feedback);
} else {
  console.log('❌ Needs revision:', review.suggestions);
}
```

---

### ManagerAgent

Task decomposition and coordination specialist.

#### Constructor

```typescript
new ManagerAgent(id: string, config?: AgentConfig)
```

**Parameters:**
- `id`: string - Unique agent identifier
- `config` (optional): Agent configuration

**Example:**

```typescript
import { ManagerAgent } from 'agent-role-orchestrator';

const manager = new ManagerAgent('manager-1');
```

#### Methods

##### `decomposeProject(plan: ProjectPlan): Promise<Task[]>`

Decompose a project plan into specific tasks.

**Parameters:**
- `plan`: ProjectPlan - Strategic plan from CEO

**Returns:**
- `Promise<Task[]>` - Array of specific tasks

**Example:**

```typescript
const tasks = await manager.decomposeProject(plan);

tasks.forEach(task => {
  console.log(`Task ${task.id}: ${task.description}`);
  console.log(`Priority: ${task.priority}`);
  console.log(`Type: ${task.type}`);
});
```

##### `assignTask(task: Task, worker: WorkerAgent): Promise<void>`

Assign a task to a worker agent.

**Parameters:**
- `task`: Task - Task to assign
- `worker`: WorkerAgent - Worker to assign to

**Example:**

```typescript
await manager.assignTask(task, worker1);
```

##### `trackProgress(): Promise<ProgressReport>`

Track progress of all assigned tasks.

**Returns:**
- `Promise<ProgressReport>` - Current progress status

**Example:**

```typescript
const progress = await manager.trackProgress();

console.log(`Completed: ${progress.completed}/${progress.total}`);
console.log(`In Progress: ${progress.inProgress}`);
console.log(`Pending: ${progress.pending}`);
```

---

### WorkerAgent

Implementation specialist that executes specific tasks.

#### Constructor

```typescript
new WorkerAgent(id: string, config?: WorkerConfig)
```

**Parameters:**
- `id`: string - Unique agent identifier
- `config` (optional): Worker configuration
  - `enableLLM`: boolean - Use real LLM (default: false)
  - `specialization`: TaskType - Worker's specialization
    - 'implementation'
    - 'testing'
    - 'documentation'
    - 'review'

**Example:**

```typescript
import { WorkerAgent } from 'agent-role-orchestrator';

// Generalist worker
const worker1 = new WorkerAgent('worker-1');

// Specialized worker
const testerWorker = new WorkerAgent('worker-test', {
  specialization: 'testing',
  enableLLM: true
});
```

#### Methods

##### `executeTask(task: Task): Promise<TaskResult>`

Execute a specific task and return results.

**Parameters:**
- `task`: Task - Task to execute

**Returns:**
- `Promise<TaskResult>` - Task execution result

**Example:**

```typescript
const result = await worker.executeTask(task);

console.log(result.status); // 'completed' | 'failed'
console.log(result.output); // Task output
console.log(result.duration); // Execution time in ms
```

##### `reportProgress(): Promise<WorkerProgress>`

Report current progress and status.

**Returns:**
- `Promise<WorkerProgress>` - Current worker status

**Example:**

```typescript
const progress = await worker.reportProgress();

console.log(`Status: ${progress.status}`);
console.log(`Current Task: ${progress.currentTask?.id}`);
console.log(`Completed Tasks: ${progress.completedTasks}`);
```

---

## Types and Interfaces

### ProjectPlan

```typescript
interface ProjectPlan {
  id: string;
  request: string;
  priorities: Priority[];
  estimatedTime: string;
  requiredResources: string[];
  risks: string[];
  successCriteria: string[];
}

type Priority = 'high' | 'medium' | 'low';
```

### Task

```typescript
interface Task {
  id: string;
  type: TaskType;
  priority: Priority;
  description: string;
  assignedTo?: string;
  status: TaskStatus;
  dependencies?: string[];
  estimatedDuration?: number;
}

type TaskType = 'implementation' | 'testing' | 'documentation' | 'review';
type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'failed';
```

### ProjectResult

```typescript
interface ProjectResult {
  id: string;
  summary: string;
  tasks: TaskResult[];
  metrics: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    totalTime: number;
  };
  review?: ProjectReview;
}
```

### TaskResult

```typescript
interface TaskResult {
  taskId: string;
  status: TaskStatus;
  output: string;
  duration: number;
  workerId: string;
  error?: string;
}
```

---

## Configuration

### Environment Variables

```bash
# Zhipu AI API Key (for LLM mode)
ZHIPU_API_KEY=your_api_key_here

# Enable debug logging
DEBUG=agent-role-orchestrator:*

# Log level
LOG_LEVEL=info
```

### Configuration File

Create `orchestrator.config.json`:

```json
{
  "enableLLM": true,
  "apiKeys": {
    "zhipu": "${ZHIPU_API_KEY}"
  },
  "logging": {
    "level": "info",
    "format": "pretty"
  },
  "agents": {
    "ceo": {
      "enableLLM": true
    },
    "manager": {
      "enableLLM": true
    },
    "workers": [
      {
        "id": "worker-impl",
        "specialization": "implementation",
        "enableLLM": true
      },
      {
        "id": "worker-test",
        "specialization": "testing",
        "enableLLM": true
      },
      {
        "id": "worker-docs",
        "specialization": "documentation",
        "enableLLM": true
      }
    ]
  }
}
```

---

## Error Handling

### Common Errors

#### `AgentInitializationError`

Thrown when an agent fails to initialize.

```typescript
try {
  const worker = new WorkerAgent('worker-1', { enableLLM: true });
} catch (error) {
  if (error instanceof AgentInitializationError) {
    console.error('Failed to initialize agent:', error.message);
    // Fallback to simulation mode
    const worker = new WorkerAgent('worker-1', { enableLLM: false });
  }
}
```

#### `TaskExecutionError`

Thrown when a task fails to execute.

```typescript
try {
  const result = await worker.executeTask(task);
} catch (error) {
  if (error instanceof TaskExecutionError) {
    console.error('Task failed:', error.taskId, error.message);
    // Retry with fallback
    const retryResult = await worker.executeTask({
      ...task,
      enableLLM: false
    });
  }
}
```

#### `LLMConnectionError`

Thrown when LLM API connection fails.

```typescript
try {
  const plan = await ceo.analyzeRequest(request);
} catch (error) {
  if (error instanceof LLMConnectionError) {
    console.error('LLM connection failed, using simulation mode');
    // System automatically falls back to simulation
  }
}
```

### Error Recovery

The system includes automatic error recovery:

1. **LLM Fallback**: If LLM API fails, automatically switches to simulation mode
2. **Task Retry**: Failed tasks are retried with exponential backoff
3. **Graceful Degradation**: System continues with reduced functionality

```typescript
// Automatic fallback example
const worker = new WorkerAgent('worker-1', { enableLLM: true });

// If LLM fails, automatically uses simulation
const result = await worker.executeTask(task);

console.log(result.mode); // 'llm' | 'simulation'
```

---

## Best Practices

### 1. Use Simulation Mode for Development

```typescript
// Development
const orchestrator = new Orchestrator({ enableLLM: false });

// Production
const orchestrator = new Orchestrator({ enableLLM: true });
```

### 2. Specialize Workers

```typescript
// Better: Specialized workers
const implWorker = new WorkerAgent('impl', {
  specialization: 'implementation'
});
const testWorker = new WorkerAgent('test', {
  specialization: 'testing'
});

// Avoid: Generalist workers for complex tasks
```

### 3. Handle Errors Gracefully

```typescript
try {
  const result = await orchestrator.processRequest(request);
  
  if (result.review?.approved) {
    console.log('✅ Success!');
  } else {
    console.log('⚠️ Needs revision');
  }
} catch (error) {
  console.error('Failed:', error);
  // Implement fallback logic
}
```

### 4. Monitor Progress

```typescript
// Track progress periodically
setInterval(async () => {
  const progress = await manager.trackProgress();
  console.log(`Progress: ${progress.completed}/${progress.total}`);
}, 5000);
```

---

## Advanced Usage

### Custom Task Types

```typescript
interface CustomTask extends Task {
  type: 'deployment' | 'integration' | 'optimization';
  customData?: any;
}

const customTask: CustomTask = {
  id: 'deploy-1',
  type: 'deployment',
  priority: 'high',
  description: 'Deploy to production',
  status: 'pending',
  customData: {
    environment: 'production',
    region: 'us-east-1'
  }
};
```

### Event Listeners

```typescript
orchestrator.on('taskStarted', (task) => {
  console.log(`Task ${task.id} started`);
});

orchestrator.on('taskCompleted', (result) => {
  console.log(`Task ${result.taskId} completed`);
});

orchestrator.on('projectCompleted', (result) => {
  console.log('Project finished!', result.summary);
});
```

---

## Performance Optimization

### Batch Processing

```typescript
// Process multiple requests in parallel
const requests = [
  'Build API',
  'Create tests',
  'Write documentation'
];

const results = await Promise.all(
  requests.map(req => orchestrator.processRequest(req))
);
```

### Caching

```typescript
// Enable caching for repeated tasks
const orchestrator = new Orchestrator({
  enableCaching: true,
  cacheTTL: 3600 // 1 hour
});
```

---

## Support

- **GitHub Issues**: https://github.com/robertsong2019/agent-role-orchestrator/issues
- **Documentation**: https://github.com/robertsong2019/agent-role-orchestrator/wiki
- **Examples**: https://github.com/robertsong2019/agent-role-orchestrator/tree/main/examples

---

**Last Updated**: 2026-03-21
**API Version**: 1.0.0
