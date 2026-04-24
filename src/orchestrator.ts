/**
 * Orchestrator - Coordinates all agents via EventBus + TaskQueue
 */

import { CEOAgent } from './roles/ceo.js';
import { ManagerAgent } from './roles/manager.js';
import { WorkerAgent } from './roles/worker.js';
import { AgentResponse, Task } from './types.js';
import { EventBus } from './events.js';
import { TaskQueue, TaskExecutor } from './task-queue.js';
import { TaskDecomposer } from './decomposer.js';

export class Orchestrator {
  private ceo: CEOAgent;
  private manager: ManagerAgent;
  private workers: WorkerAgent[] = [];
  private isRunning: boolean = false;
  private eventBus: EventBus;
  private taskQueue: TaskQueue;
  private decomposer: TaskDecomposer;

  constructor() {
    this.eventBus = new EventBus();
    this.taskQueue = new TaskQueue({ maxConcurrency: 2 }, this.eventBus);
    this.decomposer = new TaskDecomposer();
    this.ceo = new CEOAgent(this.eventBus);
    this.manager = new ManagerAgent(this.eventBus, this.decomposer);
    this.workers = [
      new WorkerAgent('Worker-1'),
      new WorkerAgent('Worker-2'),
      new WorkerAgent('Worker-3'),
    ];
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Orchestrator is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Agent Role Orchestrator...\n');

    await this.eventBus.emit('orchestrator:started', {}, 'system');

    await this.ceo.initialize();
    await this.manager.initialize();
    for (const worker of this.workers) {
      await worker.initialize();
    }

    console.log('\n✅ All agents initialized and ready\n');
  }

  async processRequest(request: string): Promise<AgentResponse> {
    if (!this.isRunning) {
      throw new Error('Orchestrator is not running. Call start() first.');
    }

    console.log('═══════════════════════════════════════');
    console.log(`Processing request: "${request}"`);
    console.log('═══════════════════════════════════════\n');

    await this.eventBus.emit('request:received', { request }, 'system');

    // Step 1: CEO analyzes the request
    const ceoResponse = await this.ceo.handleRequest(request);
    if (!ceoResponse.success) {
      return ceoResponse;
    }

    await this.eventBus.emit('ceo:project-created', { project: ceoResponse.data.project }, 'ceo');

    // Step 2: Manager decomposes project into tasks
    const project = ceoResponse.data.project;
    const managerResponse = await this.manager.handleProject(project);
    if (!managerResponse.success) {
      return managerResponse;
    }

    const tasks: Task[] = managerResponse.data.tasks;
    await this.eventBus.emit('manager:tasks-decomposed', { tasks }, 'manager');

    // Step 3: Workers execute tasks via TaskQueue
    const executor: TaskExecutor = async (task: Task) => {
      const worker = this.getAvailableWorker(task);
      const result = await worker.executeTask(task);
      return result;
    };

    const results = await this.taskQueue.enqueueAll(tasks, executor);
    await this.taskQueue.drain();

    await this.eventBus.emit('manager:tasks-assigned', {
      assignments: Object.fromEntries(results),
    }, 'manager');

    // Step 4: Manager reviews completed work
    const reviewResponse = await this.manager.reviewCompletedTasks();
    await this.eventBus.emit('manager:review-complete', { review: reviewResponse }, 'manager');

    // Step 5: CEO receives final report
    const finalReview = await this.ceo.reviewProject({
      ...project,
      tasks: tasks.map(t => ({ ...t, status: 'completed' as const, updatedAt: new Date() })),
    });

    await this.eventBus.emit('ceo:project-reviewed', { review: finalReview }, 'ceo');
    await this.eventBus.emit('orchestrator:project-complete', { project }, 'system');

    console.log('\n═══════════════════════════════════════');
    console.log('🎉 PROJECT COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════\n');

    return {
      success: true,
      message: 'Request processed successfully',
      data: { ceoResponse, managerResponse, reviewResponse },
    };
  }

  private getAvailableWorker(task: Task): WorkerAgent {
    // Simple assignment based on task type
    const idx = Math.abs(task.description.length) % this.workers.length;
    return this.workers[idx];
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    await this.eventBus.emit('orchestrator:stopped', {}, 'system');
    console.log('\n🛑 Stopping Orchestrator...');
  }

  getEventBus(): EventBus {
    return this.eventBus;
  }

  getTaskQueue(): TaskQueue {
    return this.taskQueue;
  }
}
