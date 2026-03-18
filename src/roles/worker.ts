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

export class WorkerAgent implements Agent {
  role: AgentRole = 'worker';
  name: string;
  private currentTask: Task | null;

  constructor(name: string) {
    this.name = name;
  }

  async initialize(): Promise<void> {
    console.log(`🔨 ${this.name} initialized and ready`);
  }

  async executeTask(task: Task): Promise<AgentResponse> {
    this.currentTask = task;
    task.status = 'in-progress';
    task.updatedAt = new Date();
    
    console.log(`\n🔨 ${this.name}: Starting task "${task.description}"`);
    
    // Simulate task execution
    await this.delay(1500);
    
    // Complete the task
    task.status = 'completed';
    task.updatedAt = new Date();
    
    console.log(`✅ ${this.name}: Completed task "${task.description}"`);
    
    return {
      success: true,
      message: `Task "${task.description}" completed successfully`,
      data: {
        taskId: task.id,
        taskType: task.type,
        duration: '1.5s'
      },
      nextActions: ['report_to_manager']
    };
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
