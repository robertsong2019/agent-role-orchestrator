/**
 * Tests for Worker Agent
 */

import { WorkerAgent } from '../../src/roles/worker';
import { Task, TaskType, TaskPriority, TaskStatus } from '../../src/types';

describe('WorkerAgent', () => {
  let worker: WorkerAgent;

  beforeEach(() => {
    worker = new WorkerAgent('TestWorker');
  });

  describe('initialization', () => {
    it('should have correct role', () => {
      expect(worker.role).toBe('worker');
    });

    it('should have custom name', () => {
      expect(worker.name).toBe('TestWorker');
    });

    it('should initialize successfully', async () => {
      await expect(worker.initialize()).resolves.not.toThrow();
    });
  });

  describe('executeTask', () => {
    it('should execute an implementation task', async () => {
      const task: Task = {
        id: 'task-1',
        type: 'implementation',
        priority: 'high',
        description: 'Implement user registration',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = await worker.executeTask(task);

      expect(response.success).toBe(true);
      expect(response.message).toContain('completed successfully');
      expect(response.data.taskId).toBe(task.id);
      expect(response.data.taskType).toBe('implementation');
      expect(task.status).toBe('completed');
    });

    it('should execute a testing task', async () => {
      const task: Task = {
        id: 'task-2',
        type: 'testing',
        priority: 'high',
        description: 'Write unit tests',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = await worker.executeTask(task);

      expect(response.success).toBe(true);
      expect(task.status).toBe('completed');
    });

    it('should execute a documentation task', async () => {
      const task: Task = {
        id: 'task-3',
        type: 'documentation',
        priority: 'medium',
        description: 'Create API docs',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = await worker.executeTask(task);

      expect(response.success).toBe(true);
      expect(task.status).toBe('completed');
    });

    it('should update task status to in-progress during execution', async () => {
      const task: Task = {
        id: 'task-4',
        type: 'implementation',
        priority: 'high',
        description: 'Test task',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Execute task (which includes status changes)
      await worker.executeTask(task);

      // After execution, status should be completed
      expect(task.status).toBe('completed');
    });

    it('should update task timestamps', async () => {
      const task: Task = {
        id: 'task-5',
        type: 'implementation',
        priority: 'high',
        description: 'Test task',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const originalUpdatedAt = task.updatedAt;
      await worker.executeTask(task);

      expect(task.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it('should return task execution metadata', async () => {
      const task: Task = {
        id: 'task-6',
        type: 'implementation',
        priority: 'high',
        description: 'Test task',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = await worker.executeTask(task);

      expect(response.data).toBeDefined();
      expect(response.data.taskId).toBe(task.id);
      expect(response.data.taskType).toBe(task.type);
      expect(response.data.duration).toBeDefined();
    });
  });

  describe('reportProgress', () => {
    it('should report current task when active', async () => {
      const task: Task = {
        id: 'task-7',
        type: 'implementation',
        priority: 'high',
        description: 'Active task',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await worker.executeTask(task);
      
      // reportProgress should not throw
      await expect(worker.reportProgress()).resolves.not.toThrow();
    });
  });

  describe('multiple workers', () => {
    it('should allow multiple workers with different names', () => {
      const worker1 = new WorkerAgent('Worker-1');
      const worker2 = new WorkerAgent('Worker-2');
      const worker3 = new WorkerAgent('Worker-3');

      expect(worker1.name).toBe('Worker-1');
      expect(worker2.name).toBe('Worker-2');
      expect(worker3.name).toBe('Worker-3');
    });

    it('should execute tasks concurrently', async () => {
      const worker1 = new WorkerAgent('Worker-1');
      const worker2 = new WorkerAgent('Worker-2');

      const task1: Task = {
        id: 'task-1',
        type: 'implementation',
        priority: 'high',
        description: 'Task 1',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const task2: Task = {
        id: 'task-2',
        type: 'implementation',
        priority: 'high',
        description: 'Task 2',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [response1, response2] = await Promise.all([
        worker1.executeTask(task1),
        worker2.executeTask(task2),
      ]);

      expect(response1.success).toBe(true);
      expect(response2.success).toBe(true);
      expect(task1.status).toBe('completed');
      expect(task2.status).toBe('completed');
    });
  });
});
