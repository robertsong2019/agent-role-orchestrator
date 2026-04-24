/**
 * Task Queue - Manages task scheduling, retry, and parallel execution
 */

import { Task, TaskStatus, TaskType, TaskPriority } from './types.js';
import { EventBus, EventName } from './events.js';

export interface TaskQueueConfig {
  maxConcurrency: number;
  maxRetries: number;
  retryDelayMs: number;
  taskTimeoutMs: number;
}

const DEFAULT_CONFIG: TaskQueueConfig = {
  maxConcurrency: 3,
  maxRetries: 2,
  retryDelayMs: 1000,
  taskTimeoutMs: 30000,
};

export type TaskExecutor = (task: Task) => Promise<any>;

interface QueuedTask {
  task: Task;
  executor: TaskExecutor;
  retries: number;
  resolve: (result: any) => void;
  reject: (error: any) => void;
}

export class TaskQueue {
  private config: TaskQueueConfig;
  private queue: QueuedTask[] = [];
  private running: Map<string, QueuedTask> = new Map();
  private completed: Task[] = [];
  private failed: Task[] = [];
  private eventBus?: EventBus;

  constructor(config?: Partial<TaskQueueConfig>, eventBus?: EventBus) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.eventBus = eventBus;
  }

  /**
   * Add a task to the queue
   */
  enqueue(task: Task, executor: TaskExecutor): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, executor, retries: 0, resolve, reject });
      this.process();
    });
  }

  /**
   * Add multiple tasks
   */
  async enqueueAll(tasks: Task[], executor: TaskExecutor): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    const promises = tasks.map(task =>
      this.enqueue(task, executor).then(
        result => { results.set(task.id, { success: true, result }); },
        error => { results.set(task.id, { success: false, error: error.message }); }
      )
    );
    await Promise.all(promises);
    return results;
  }

  /**
   * Process the queue
   */
  private process(): void {
    while (this.running.size < this.config.maxConcurrency && this.queue.length > 0) {
      const item = this.queue.shift()!;
      this.executeTask(item);
    }
  }

  /**
   * Execute a single task with timeout and retry
   */
  private async executeTask(item: QueuedTask): Promise<void> {
    const { task, executor } = item;
    this.running.set(task.id, item);
    task.status = 'in-progress';
    task.updatedAt = new Date();

    this.eventBus?.emit('worker:task-started', { task }, 'system');

    try {
      // Execute with timeout
      const result = await Promise.race([
        executor(task),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Task timeout')), this.config.taskTimeoutMs)
        ),
      ]);

      task.status = 'completed';
      task.updatedAt = new Date();
      this.completed.push(task);
      this.running.delete(task.id);

      this.eventBus?.emit('worker:task-completed', { task, result }, 'system');
      item.resolve(result);
    } catch (error: any) {
      item.retries++;

      if (item.retries <= this.config.maxRetries) {
        // Retry after delay
        task.status = 'pending';
        task.updatedAt = new Date();
        console.log(`🔄 Retrying task "${task.description}" (attempt ${item.retries}/${this.config.maxRetries})`);

        setTimeout(() => {
          this.queue.unshift(item);
          this.running.delete(task.id);
          this.process();
        }, this.config.retryDelayMs * item.retries);
      } else {
        // Max retries exceeded
        task.status = 'blocked';
        task.updatedAt = new Date();
        this.failed.push(task);
        this.running.delete(task.id);

        this.eventBus?.emit('worker:task-failed', { task, error: error.message }, 'system');
        item.reject(error);
      }
    } finally {
      this.process();
    }
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      pending: this.queue.length,
      running: this.running.size,
      completed: this.completed.length,
      failed: this.failed.length,
      total: this.queue.length + this.running.size + this.completed.length + this.failed.length,
    };
  }

  /**
   * Get all completed tasks
   */
  getCompleted(): Task[] {
    return [...this.completed];
  }

  /**
   * Get all failed tasks
   */
  getFailed(): Task[] {
    return [...this.failed];
  }

  /**
   * Check if all tasks are done (completed or failed)
   */
  isDone(): boolean {
    return this.queue.length === 0 && this.running.size === 0;
  }

  /**
   * Wait for all current tasks to complete
   */
  async drain(): Promise<void> {
    while (!this.isDone()) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}
