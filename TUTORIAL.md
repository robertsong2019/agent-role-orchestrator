# Tutorial: Building Your First Multi-Agent System

Learn how to build a multi-agent system using the Agent Role Orchestrator framework.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Part 1: Understanding the Architecture](#part-1-understanding-the-architecture)
- [Part 2: Basic Usage - Simulation Mode](#part-2-basic-usage---simulation-mode)
- [Part 3: Real LLM Integration](#part-3-real-llm-integration)
- [Part 4: Advanced Patterns](#part-4-advanced-patterns)
- [Part 5: Real-World Example](#part-5-real-world-example)

---

## Prerequisites

- Node.js 16+ installed
- TypeScript knowledge (basic)
- Understanding of async/await
- Optional: Zhipu AI API key for LLM mode

```bash
# Clone the repository
git clone https://github.com/robertsong2019/agent-role-orchestrator.git
cd agent-role-orchestrator

# Install dependencies
npm install

# Build the project
npm run build
```

---

## Part 1: Understanding the Architecture

### The Three-Layer Model

The system uses a hierarchical structure inspired by real organizations:

```
┌─────────────┐
│  CEO Agent  │  ← Strategic decisions
└──────┬──────┘
       │
┌──────▼──────┐
│   Manager   │  ← Task coordination
└──────┬──────┘
       │
┌──────▼──────┐
│   Workers   │  ← Implementation
└─────────────┘
```

**Key Principle**: Each layer has clear responsibilities and boundaries.

### Role Responsibilities

**CEO Agent**:
- Analyzes high-level requests
- Sets strategic priorities
- Allocates resources
- Reviews final results

**Manager Agent**:
- Breaks down projects into tasks
- Assigns tasks to workers
- Tracks progress
- Ensures quality

**Worker Agents**:
- Execute specific tasks
- Report progress
- Specialize in different areas:
  - Implementation
  - Testing
  - Documentation
  - Review

---

## Part 2: Basic Usage - Simulation Mode

### Hello World Example

Create your first multi-agent system:

```typescript
// examples/hello-world.ts
import { Orchestrator } from '../src';

async function main() {
  // Create orchestrator in simulation mode
  const orchestrator = new Orchestrator();
  
  // Process a simple request
  const result = await orchestrator.processRequest(
    'Create a simple hello world function'
  );
  
  console.log('Result:', result.summary);
  
  // Clean up
  orchestrator.shutdown();
}

main().catch(console.error);
```

Run it:

```bash
npm run build
node examples/hello-world.ts
```

**Expected Output**:

```
🎯 CEO: Analyzing request: "Create a simple hello world function"
📋 Manager: Decomposing into 2 tasks
  - Task 1: Implement hello world function (high priority)
  - Task 2: Write unit tests (medium priority)
🔨 Worker 1: Implementing hello world function
🔨 Worker 2: Writing unit tests
✅ Manager: All tasks completed, reviewing...
🎉 CEO: Project completed successfully!
```

### Understanding the Flow

1. **Orchestrator** receives the request
2. **CEO Agent** analyzes and creates a plan
3. **Manager Agent** breaks down into tasks
4. **Worker Agents** execute tasks
5. **Manager Agent** reviews results
6. **CEO Agent** approves final output

---

## Part 3: Real LLM Integration

### Setup Zhipu AI

Get your API key from [Zhipu AI](https://open.bigmodel.cn/).

```bash
# Create .env file
cat > .env << 'EOF'
ZHIPU_API_KEY=your_api_key_here
EOF
```

### Enable LLM Mode

```typescript
// examples/llm-mode.ts
import { Orchestrator } from '../src';

async function main() {
  // Create orchestrator with LLM enabled
  const orchestrator = new Orchestrator({
    enableLLM: true,
    apiKeys: {
      zhipu: process.env.ZHIPU_API_KEY
    }
  });
  
  const result = await orchestrator.processRequest(
    'Build a REST API endpoint for user registration with validation'
  );
  
  console.log('LLM-generated output:', result.summary);
  
  // Check if LLM was actually used
  result.tasks.forEach(task => {
    console.log(`Task ${task.taskId}: ${task.mode}`);
  });
  
  orchestrator.shutdown();
}

main().catch(console.error);
```

### Understanding LLM vs Simulation

**Simulation Mode** (default):
- Fast execution
- No API costs
- Deterministic output
- Good for testing

**LLM Mode**:
- Real AI-generated code
- Dynamic responses
- Requires API key
- Better for production

**Automatic Fallback**:
If LLM fails, the system automatically falls back to simulation mode.

```typescript
// LLM mode with fallback
const orchestrator = new Orchestrator({ enableLLM: true });

// If LLM fails, automatically uses simulation
const result = await orchestrator.processRequest(request);

// Check which mode was used
result.tasks.forEach(task => {
  console.log(`Mode: ${task.mode}`); // 'llm' or 'simulation'
});
```

---

## Part 4: Advanced Patterns

### Pattern 1: Specialized Workers

Create workers with specific expertise:

```typescript
// examples/specialized-workers.ts
import { Orchestrator, WorkerAgent } from '../src';

async function main() {
  const orchestrator = new Orchestrator({ enableLLM: true });
  
  // Create specialized workers
  const implWorker = new WorkerAgent('impl', {
    specialization: 'implementation',
    enableLLM: true
  });
  
  const testWorker = new WorkerAgent('test', {
    specialization: 'testing',
    enableLLM: true
  });
  
  const docWorker = new WorkerAgent('docs', {
    specialization: 'documentation',
    enableLLM: true
  });
  
  // Add workers to orchestrator
  orchestrator.addWorker(implWorker);
  orchestrator.addWorker(testWorker);
  orchestrator.addWorker(docWorker);
  
  const result = await orchestrator.processRequest(
    'Build a calculator with add, subtract, multiply, divide'
  );
  
  // Each task will be assigned to the most specialized worker
  result.tasks.forEach(task => {
    console.log(`Task ${task.taskId}: ${task.workerId} (${task.type})`);
  });
  
  orchestrator.shutdown();
}
```

### Pattern 2: Task Dependencies

Handle tasks that depend on each other:

```typescript
// examples/task-dependencies.ts
import { Orchestrator, ManagerAgent, Task } from '../src';

async function main() {
  const orchestrator = new Orchestrator();
  const manager = new ManagerAgent('manager-1');
  
  // Create tasks with dependencies
  const tasks: Task[] = [
    {
      id: 'task-1',
      type: 'implementation',
      priority: 'high',
      description: 'Implement data model',
      status: 'pending',
      dependencies: [] // No dependencies
    },
    {
      id: 'task-2',
      type: 'implementation',
      priority: 'high',
      description: 'Implement API endpoints',
      status: 'pending',
      dependencies: ['task-1'] // Depends on task-1
    },
    {
      id: 'task-3',
      type: 'testing',
      priority: 'medium',
      description: 'Write integration tests',
      status: 'pending',
      dependencies: ['task-2'] // Depends on task-2
    }
  ];
  
  // Manager will respect dependencies
  await manager.assignTasksWithDependencies(tasks);
  
  const progress = await manager.trackProgress();
  console.log('Progress:', progress);
}

main().catch(console.error);
```

### Pattern 3: Progress Monitoring

Track progress in real-time:

```typescript
// examples/progress-monitor.ts
import { Orchestrator } from '../src';

async function main() {
  const orchestrator = new Orchestrator();
  
  // Set up event listeners
  orchestrator.on('taskStarted', (task) => {
    console.log(`▶️  Started: ${task.description}`);
  });
  
  orchestrator.on('taskCompleted', (result) => {
    console.log(`✅ Completed: ${result.taskId} (${result.duration}ms)`);
  });
  
  orchestrator.on('projectCompleted', (result) => {
    console.log(`\n🎉 Project Complete!`);
    console.log(`Total time: ${result.metrics.totalTime}ms`);
    console.log(`Tasks: ${result.metrics.completedTasks}/${result.metrics.totalTasks}`);
  });
  
  await orchestrator.processRequest(
    'Build a todo list application'
  );
  
  orchestrator.shutdown();
}

main().catch(console.error);
```

**Expected Output**:

```
▶️  Started: Implement todo model
▶️  Started: Implement todo API
✅ Completed: task-1 (1523ms)
✅ Completed: task-2 (2104ms)
▶️  Started: Write tests
✅ Completed: task-3 (876ms)

🎉 Project Complete!
Total time: 4503ms
Tasks: 3/3
```

### Pattern 4: Error Handling and Retry

Handle failures gracefully:

```typescript
// examples/error-handling.ts
import { Orchestrator, WorkerAgent } from '../src';

async function main() {
  const orchestrator = new Orchestrator({ enableLLM: true });
  
  // Create worker with retry logic
  const worker = new WorkerAgent('worker-1', {
    enableLLM: true,
    maxRetries: 3,
    retryDelay: 1000
  });
  
  try {
    const result = await orchestrator.processRequest(
      'Build a complex microservice'
    );
    
    console.log('Success:', result.summary);
  } catch (error) {
    console.error('Failed:', error);
    
    // System automatically retried and fell back
    console.log('Check logs for retry attempts');
  }
  
  orchestrator.shutdown();
}

main().catch(console.error);
```

---

## Part 5: Real-World Example

### Building a Complete REST API

Let's build a real-world REST API step by step:

```typescript
// examples/real-world-api.ts
import { Orchestrator, WorkerAgent } from '../src';

async function buildRestAPI() {
  console.log('🚀 Starting REST API Project\n');
  
  // Step 1: Create orchestrator with LLM
  const orchestrator = new Orchestrator({
    enableLLM: true,
    apiKeys: {
      zhipu: process.env.ZHIPU_API_KEY
    },
    logging: true
  });
  
  // Step 2: Create specialized workers
  const workers = [
    new WorkerAgent('impl-core', {
      specialization: 'implementation',
      enableLLM: true
    }),
    new WorkerAgent('impl-auth', {
      specialization: 'implementation',
      enableLLM: true
    }),
    new WorkerAgent('test-unit', {
      specialization: 'testing',
      enableLLM: true
    }),
    new WorkerAgent('test-integration', {
      specialization: 'testing',
      enableLLM: true
    }),
    new WorkerAgent('docs-api', {
      specialization: 'documentation',
      enableLLM: true
    })
  ];
  
  workers.forEach(w => orchestrator.addWorker(w));
  
  // Step 3: Define project requirements
  const requirements = `
Build a REST API for a blog platform with the following features:
1. User authentication (JWT-based)
2. CRUD operations for blog posts
3. Comment system
4. Search functionality
5. Rate limiting
6. Input validation
7. Unit tests
8. API documentation
  `.trim();
  
  // Step 4: Process the request
  console.log('📋 Requirements:\n', requirements);
  console.log('\n⏳ Processing...\n');
  
  const result = await orchestrator.processRequest(requirements);
  
  // Step 5: Review results
  console.log('\n📊 Results:');
  console.log('─'.repeat(50));
  console.log('Summary:', result.summary);
  console.log('\nMetrics:');
  console.log(`  Total Tasks: ${result.metrics.totalTasks}`);
  console.log(`  Completed: ${result.metrics.completedTasks}`);
  console.log(`  Failed: ${result.metrics.failedTasks}`);
  console.log(`  Total Time: ${(result.metrics.totalTime / 1000).toFixed(2)}s`);
  
  // Step 6: Review individual tasks
  console.log('\n📝 Task Breakdown:');
  result.tasks.forEach((task, index) => {
    console.log(`\n${index + 1}. ${task.taskId}`);
    console.log(`   Status: ${task.status}`);
    console.log(`   Mode: ${task.mode}`);
    console.log(`   Duration: ${task.duration}ms`);
    console.log(`   Worker: ${task.workerId}`);
  });
  
  // Step 7: Check CEO approval
  if (result.review?.approved) {
    console.log('\n✅ Project approved by CEO!');
    console.log('Feedback:', result.review.feedback);
  } else {
    console.log('\n⚠️  Project needs revision');
    console.log('Suggestions:', result.review?.suggestions);
  }
  
  // Step 8: Clean up
  orchestrator.shutdown();
  
  return result;
}

// Run the example
buildRestAPI()
  .then(result => {
    console.log('\n🎉 Project completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Project failed:', error);
    process.exit(1);
  });
```

Run it:

```bash
npm run build
node examples/real-world-api.ts
```

**Expected Output**:

```
🚀 Starting REST API Project

📋 Requirements:
Build a REST API for a blog platform with the following features:
1. User authentication (JWT-based)
2. CRUD operations for blog posts
3. Comment system
4. Search functionality
5. Rate limiting
6. Input validation
7. Unit tests
8. API documentation

⏳ Processing...

🎯 CEO: Analyzing request...
📋 Manager: Decomposing into 12 tasks
🔨 Worker impl-core: Implementing authentication
🔨 Worker impl-auth: Implementing blog post CRUD
🔨 Worker impl-core: Implementing comment system
... (more tasks)

📊 Results:
──────────────────────────────────────────────────
Summary: Complete REST API with authentication, CRUD, comments, and tests

Metrics:
  Total Tasks: 12
  Completed: 12
  Failed: 0
  Total Time: 45.23s

📝 Task Breakdown:

1. task-1
   Status: completed
   Mode: llm
   Duration: 3421ms
   Worker: impl-core

2. task-2
   Status: completed
   Mode: llm
   Duration: 2876ms
   Worker: impl-auth

... (more tasks)

✅ Project approved by CEO!
Feedback: All features implemented with proper tests and documentation

🎉 Project completed successfully!
```

---

## Best Practices

### 1. Start with Simulation Mode

```typescript
// Development: Use simulation mode
const devOrchestrator = new Orchestrator({ enableLLM: false });

// Production: Use LLM mode
const prodOrchestrator = new Orchestrator({ enableLLM: true });
```

### 2. Specialize Your Workers

```typescript
// ✅ Good: Specialized workers
const implWorker = new WorkerAgent('impl', {
  specialization: 'implementation'
});
const testWorker = new WorkerAgent('test', {
  specialization: 'testing'
});

// ❌ Bad: Generic workers for complex tasks
const genericWorker = new WorkerAgent('generic');
```

### 3. Monitor Progress

```typescript
// Set up monitoring
orchestrator.on('taskCompleted', (result) => {
  metrics.record(result.duration);
});

orchestrator.on('projectCompleted', (result) => {
  logger.info('Project stats', result.metrics);
});
```

### 4. Handle Errors Gracefully

```typescript
try {
  const result = await orchestrator.processRequest(request);
  
  if (!result.review?.approved) {
    // Handle revision needed
    await handleRevision(result);
  }
} catch (error) {
  // System automatically retried and fell back
  logger.error('Failed after retries', error);
}
```

### 5. Clean Up Resources

```typescript
// Always shutdown when done
orchestrator.shutdown();
```

---

## Common Patterns

### Pattern 1: Simple Project

```typescript
const orchestrator = new Orchestrator();
const result = await orchestrator.processRequest('Build X');
orchestrator.shutdown();
```

### Pattern 2: Complex Project with Monitoring

```typescript
const orchestrator = new Orchestrator({ enableLLM: true });

orchestrator.on('taskStarted', task => logger.info(task));
orchestrator.on('taskCompleted', result => metrics.record(result));

const result = await orchestrator.processRequest(complexRequest);

orchestrator.shutdown();
```

### Pattern 3: Multiple Projects

```typescript
const orchestrator = new Orchestrator();

const requests = ['Build A', 'Build B', 'Build C'];
const results = await Promise.all(
  requests.map(req => orchestrator.processRequest(req))
);

orchestrator.shutdown();
```

---

## Troubleshooting

### Issue: LLM API Errors

**Problem**: API connection fails or rate limits hit.

**Solution**: System automatically falls back to simulation mode.

```typescript
const result = await orchestrator.processRequest(request);

// Check which mode was actually used
result.tasks.forEach(task => {
  console.log(`Task ${task.taskId}: ${task.mode}`);
});
```

### Issue: Slow Performance

**Problem**: Tasks take too long.

**Solution**: Use simulation mode for development, LLM mode for production.

```typescript
// Fast development
const devOrchestrator = new Orchestrator({ enableLLM: false });

// Quality production
const prodOrchestrator = new Orchestrator({ enableLLM: true });
```

### Issue: Task Failures

**Problem**: Some tasks fail.

**Solution**: Check error details and implement retry logic.

```typescript
const result = await orchestrator.processRequest(request);

const failedTasks = result.tasks.filter(t => t.status === 'failed');
failedTasks.forEach(task => {
  console.error(`Failed: ${task.taskId}`, task.error);
});
```

---

## Next Steps

1. **Explore Examples**: Check the `examples/` directory
2. **Read API Docs**: See [API.md](./API.md) for detailed reference
3. **Join Community**: Star the repo and contribute!
4. **Build Your Own**: Create custom agents and workflows

---

## Resources

- **GitHub**: https://github.com/robertsong2019/agent-role-orchestrator
- **API Docs**: [API.md](./API.md)
- **Examples**: `examples/` directory
- **Issues**: https://github.com/robertsong2019/agent-role-orchestrator/issues

---

**Tutorial Version**: 1.0.0
**Last Updated**: 2026-03-21
