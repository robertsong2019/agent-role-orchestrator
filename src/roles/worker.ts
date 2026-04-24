/**
 * Worker Agent - Task execution
 * 
 * Responsibilities:
 * - Execute assigned tasks
 * - Implement features
 * - Write tests
 * - Create documentation
 * - Report completion to Manager
 */

import { Agent, AgentRole, Task, AgentResponse } from '../types.js';
import { getLLMClient, LLMClient } from '../llm-client.js';
import { MemorySystem } from '../memory.js';

export interface WorkerConfig {
  useLLM?: boolean;
  simulateDelay?: number;
}

export class WorkerAgent implements Agent {
  role: AgentRole = 'worker';
  name: string;
  private currentTask: Task | null = null;
  private useLLM: boolean;
  private simulateDelay: number;
  private llmClient: LLMClient;
  private memory!: MemorySystem;

  constructor(name: string, config: WorkerConfig = {}) {
    this.name = name;
    this.useLLM = config.useLLM || false;
    this.simulateDelay = config.simulateDelay || 1500;
    this.llmClient = getLLMClient();
  }

  async initialize(): Promise<void> {
    this.memory = new MemorySystem({
      working: { capacity: 3 },
      shortTerm: { maxAgeMs: 3600000, maxEntries: 30 },
      longTerm: { persistenceEnabled: false },
    });
    
    console.log(`🔨 ${this.name} initialized with memory system`);
    if (this.useLLM && this.llmClient.isConfigured()) {
      console.log(`🤖 ${this.name}: LLM mode enabled`);
    } else if (this.useLLM) {
      console.warn(`⚠️  ${this.name}: LLM mode requested but API not configured, falling back to simulation`);
      this.useLLM = false;
    }
  }

  async executeTask(task: Task): Promise<AgentResponse> {
    this.currentTask = task;
    task.status = 'in-progress';
    task.updatedAt = new Date();
    
    console.log(`\n🔨 ${this.name}: Starting task "${task.description}"`);
    
    // Check memory for similar tasks
    const similarTasks = this.memory.longTerm.query({
      type: 'task',
      keywords: task.description.split(' ').slice(0, 3),
      limit: 2,
    });
    
    if (similarTasks.length > 0) {
      console.log(`💭 ${this.name}: Recalled ${similarTasks.length} similar tasks from memory`);
    }
    
    // Store current task in working memory
    this.memory.working.add({
      type: 'task',
      content: `Working on: ${task.description}`,
      importance: 0.9,
      metadata: {
        taskId: task.id,
        taskType: task.type,
        startedAt: new Date().toISOString(),
      },
    });
    
    let result: any;
    
    if (this.useLLM && this.llmClient.isConfigured()) {
      result = await this.executeWithLLM(task);
    } else {
      result = await this.executeWithSimulation(task);
    }
    
    // Complete the task
    task.status = 'completed';
    task.updatedAt = new Date();
    
    console.log(`✅ ${this.name}: Completed task "${task.description}"`);
    
    // Store completion in short-term memory
    this.memory.shortTerm.add({
      type: 'fact',
      content: `Completed ${task.type} task: ${task.description}`,
      importance: 0.7,
      metadata: {
        taskId: task.id,
        taskType: task.type,
        duration: result.duration,
      },
    });
    
    // If task was particularly important, store in long-term memory
    if (task.priority === 'high') {
      this.memory.longTerm.add({
        type: 'task',
        content: `Successfully completed high-priority ${task.type}: ${task.description}`,
        importance: 0.8,
        metadata: {
          taskId: task.id,
          taskType: task.type,
          completedAt: new Date().toISOString(),
        },
      });
    }
    
    return {
      success: true,
      message: `Task "${task.description}" completed successfully`,
      data: result,
      nextActions: ['report_to_manager']
    };
  }

  private async executeWithLLM(task: Task): Promise<any> {
    const systemPrompt = this.getSystemPrompt(task.type);
    const prompt = `Task: ${task.description}\n\nPlease complete this ${task.type} task.`;
    
    const startTime = Date.now();
    const response = await this.llmClient.generate(prompt, systemPrompt);
    const duration = Date.now() - startTime;
    
    if (!response.success) {
      console.error(`❌ ${this.name}: LLM error: ${response.error}`);
      // Fall back to simulation
      return await this.executeWithSimulation(task);
    }
    
    return {
      taskId: task.id,
      taskType: task.type,
      output: response.content,
      duration: `${duration}ms`,
      tokens: response.usage
    };
  }

  private async executeWithSimulation(task: Task): Promise<any> {
    await this.delay(this.simulateDelay);
    
    return {
      taskId: task.id,
      taskType: task.type,
      duration: `${this.simulateDelay}ms`
    };
  }

  private getSystemPrompt(taskType: string): string {
    const prompts: Record<string, string> = {
      implementation: `You are an expert software developer. Your task is to implement code according to specifications. Write clean, efficient, and well-documented code.`,
      testing: `You are a QA engineer. Your task is to write comprehensive tests. Include unit tests, edge cases, and integration tests as needed.`,
      documentation: `You are a technical writer. Your task is to create clear and comprehensive documentation. Include usage examples, API references, and best practices.`,
      review: `You are a code reviewer. Your task is to review code for quality, security, and performance. Provide constructive feedback and suggestions.`
    };
    
    return prompts[taskType] || prompts.implementation;
  }

  async reportProgress(): Promise<void> {
    if (this.currentTask) {
      console.log(`${this.name}: Currently working on "${this.currentTask.description}"`);
    } else {
      console.log(`${this.name}: No active task`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
