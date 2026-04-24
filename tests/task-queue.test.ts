/**
 * Tests for TaskQueue
 */

import { TaskQueue } from '../src/task-queue';
import { Task } from '../src/types';
import { EventBus } from '../src/events';

describe('TaskQueue', () => {
  let queue: TaskQueue;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    queue = new TaskQueue({ maxConcurrency: 2, maxRetries: 2, retryDelayMs: 10, taskTimeoutMs: 5000 }, eventBus);
  });

  describe('enqueue single task', () => {
    test('should execute a single task successfully', async () => {
      const executor = jest.fn().mockResolvedValue('result');
      const task: Task = {
        id: 'task-1',
        type: 'implementation',
        priority: 'high',
        description: 'Test task',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await queue.enqueue(task, executor);

      expect(executor).toHaveBeenCalledTimes(1);
      expect(result).toBe('result');
      expect(task.status).toBe('completed');
    });

    test('should emit task-started event', async () => {
      const executor = jest.fn().mockResolvedValue('result');
      const task: Task = {
        id: 'task-1',
        type: 'implementation',
        priority: 'high',
        description: 'Test task',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const eventSpy = jest.fn();
      eventBus.on('worker:task-started', eventSpy);

      await queue.enqueue(task, executor);

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy.mock.calls[0][0].payload.task.id).toBe('task-1');
    });

    test('should emit task-completed event', async () => {
      const executor = jest.fn().mockResolvedValue('result');
      const task: Task = {
        id: 'task-1',
        type: 'implementation',
        priority: 'high',
        description: 'Test task',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const eventSpy = jest.fn();
      eventBus.on('worker:task-completed', eventSpy);

      await queue.enqueue(task, executor);

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy.mock.calls[0][0].payload.task.id).toBe('task-1');
    });
  });

  describe('enqueueAll with multiple tasks', () => {
    test('should execute all tasks', async () => {
      const executor = jest.fn().mockResolvedValue('result');
      const tasks: Task[] = [
        {
          id: 'task-1',
          type: 'implementation',
          priority: 'high',
          description: 'Task 1',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'task-2',
          type: 'testing',
          priority: 'high',
          description: 'Task 2',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'task-3',
          type: 'documentation',
          priority: 'medium',
          description: 'Task 3',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const results = await queue.enqueueAll(tasks, executor);

      expect(executor).toHaveBeenCalledTimes(3);
      expect(results.size).toBe(3);
      expect(results.get('task-1')).toEqual({ success: true, result: 'result' });
      expect(results.get('task-2')).toEqual({ success: true, result: 'result' });
      expect(results.get('task-3')).toEqual({ success: true, result: 'result' });
    });

    test('should return success and error results for mixed outcomes', async () => {
      const executor = jest.fn().mockImplementation(async (task) => {
        if (task.id === 'task-2') {
          throw new Error('failed');
        }
        return 'success';
      });

      const tasks: Task[] = [
        {
          id: 'task-1',
          type: 'implementation',
          priority: 'high',
          description: 'Task 1',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'task-2',
          type: 'testing',
          priority: 'high',
          description: 'Task 2',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'task-3',
          type: 'documentation',
          priority: 'medium',
          description: 'Task 3',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const results = await queue.enqueueAll(tasks, executor);

      expect(results.get('task-1')).toEqual({ success: true, result: 'success' });
      expect(results.get('task-2')).toEqual({ success: false, error: 'failed' });
      expect(results.get('task-3')).toEqual({ success: true, result: 'success' });
    });
  });

  describe('retry on failure', () => {
    test('should retry failed tasks up to maxRetries', async () => {
      let attempts = 0;
      const executor = jest.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('fail');
        }
        return 'success';
      });

      const task: Task = {
        id: 'task-1',
        type: 'implementation',
        priority: 'high',
        description: 'Test task',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await queue.enqueue(task, executor);

      expect(executor).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
      expect(result).toBe('success');
      expect(task.status).toBe('completed');
    });

    test('should mark task as blocked after max retries', async () => {
      const executor = jest.fn().mockRejectedValue(new Error('permanent failure'));
      const task: Task = {
        id: 'task-1',
        type: 'implementation',
        priority: 'high',
        description: 'Test task',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await expect(queue.enqueue(task, executor)).rejects.toThrow('permanent failure');
      expect(task.status).toBe('blocked');
      expect(executor).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });

    test('should emit task-failed event after max retries', async () => {
      const executor = jest.fn().mockRejectedValue(new Error('failed'));
      const task: Task = {
        id: 'task-1',
        type: 'implementation',
        priority: 'high',
        description: 'Test task',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const eventSpy = jest.fn();
      eventBus.on('worker:task-failed', eventSpy);

      await expect(queue.enqueue(task, executor)).rejects.toThrow();

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy.mock.calls[0][0].payload.task.id).toBe('task-1');
      expect(eventSpy.mock.calls[0][0].payload.error).toBe('failed');
    });
  });

  describe('max concurrency is respected', () => {
    test('should execute at most maxConcurrency tasks simultaneously', async () => {
      let runningCount = 0;
      let maxRunning = 0;
      const executor = jest.fn().mockImplementation(async () => {
        runningCount++;
        maxRunning = Math.max(maxRunning, runningCount);
        await new Promise(resolve => setTimeout(resolve, 50));
        runningCount--;
        return 'done';
      });

      const tasks: Task[] = Array.from({ length: 5 }, (_, i) => ({
        id: `task-${i}`,
        type: 'implementation' as const,
        priority: 'high' as const,
        description: `Task ${i}`,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await queue.enqueueAll(tasks, executor);

      expect(maxRunning).toBeLessThanOrEqual(2); // maxConcurrency
      expect(executor).toHaveBeenCalledTimes(5);
    });
  });

  describe('getStats', () => {
    test('should return correct statistics', async () => {
      const failExecutor = jest.fn().mockRejectedValue(new Error('fail'));
      const successExecutor = jest.fn().mockResolvedValue('success');
      
      const tasks: Task[] = [
        {
          id: 'task-1',
          type: 'implementation',
          priority: 'high',
          description: 'Success task',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'task-2',
          type: 'testing',
          priority: 'high',
          description: 'Fail task',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Enqueue separately to control which executor handles which
      const p1 = queue.enqueue(tasks[0], successExecutor);
      const p2 = queue.enqueue(tasks[1], failExecutor).catch(() => {});
      
      await Promise.all([p1, p2]);
      await queue.drain();

      const stats = queue.getStats();

      expect(stats.pending).toBe(0);
      expect(stats.running).toBe(0);
      expect(stats.completed).toBe(1);
      expect(stats.failed).toBe(1);
      expect(stats.total).toBe(2);
    });
  });
});
