/**
 * Tests for Manager Agent
 */

import { ManagerAgent } from '../../src/roles/manager';
import { Project, TaskType, TaskPriority } from '../../src/types';

describe('ManagerAgent', () => {
  let manager: ManagerAgent;

  beforeEach(() => {
    manager = new ManagerAgent();
  });

  describe('initialization', () => {
    it('should have correct role', () => {
      expect(manager.role).toBe('manager');
    });

    it('should have correct name', () => {
      expect(manager.name).toBe('Manager Agent');
    });

    it('should initialize successfully', async () => {
      await expect(manager.initialize()).resolves.not.toThrow();
    });
  });

  describe('handleProject', () => {
    it('should decompose a project into tasks', async () => {
      const project: Project = {
        id: 'proj-123',
        name: 'Authentication System',
        description: 'Build a user authentication system with JWT',
        tasks: [],
        status: 'planning',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = await manager.handleProject(project);

      expect(response.success).toBe(true);
      expect(response.data.tasks).toBeDefined();
      expect(response.data.tasks.length).toBeGreaterThan(0);
      expect(response.data.assignments).toBeDefined();
    });

    it('should create implementation tasks', async () => {
      const project: Project = {
        id: 'proj-123',
        name: 'Test Project',
        description: 'Build a feature',
        tasks: [],
        status: 'planning',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = await manager.handleProject(project);
      const implementationTasks = response.data.tasks.filter(
        (t: any) => t.type === 'implementation'
      );

      expect(implementationTasks.length).toBeGreaterThan(0);
    });

    it('should create testing tasks', async () => {
      const project: Project = {
        id: 'proj-123',
        name: 'Test Project',
        description: 'Build a feature',
        tasks: [],
        status: 'planning',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = await manager.handleProject(project);
      const testingTasks = response.data.tasks.filter(
        (t: any) => t.type === 'testing'
      );

      expect(testingTasks.length).toBeGreaterThan(0);
    });

    it('should create documentation tasks', async () => {
      const project: Project = {
        id: 'proj-123',
        name: 'Test Project',
        description: 'Build a feature',
        tasks: [],
        status: 'planning',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = await manager.handleProject(project);
      const docTasks = response.data.tasks.filter(
        (t: any) => t.type === 'documentation'
      );

      expect(docTasks.length).toBeGreaterThan(0);
    });

    it('should assign tasks to workers', async () => {
      const project: Project = {
        id: 'proj-123',
        name: 'Test Project',
        description: 'Build a feature',
        tasks: [],
        status: 'planning',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = await manager.handleProject(project);

      expect(response.data.assignments).toBeDefined();
      const assignmentKeys = Object.keys(response.data.assignments);
      expect(assignmentKeys.length).toBe(response.data.tasks.length);
    });

    it('should set correct task priorities', async () => {
      const project: Project = {
        id: 'proj-123',
        name: 'Test Project',
        description: 'Build a feature',
        tasks: [],
        status: 'planning',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = await manager.handleProject(project);
      const validPriorities: TaskPriority[] = ['high', 'medium', 'low'];

      response.data.tasks.forEach((task: any) => {
        expect(validPriorities).toContain(task.priority);
      });
    });

    it('should set correct task types', async () => {
      const project: Project = {
        id: 'proj-123',
        name: 'Test Project',
        description: 'Build a feature',
        tasks: [],
        status: 'planning',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = await manager.handleProject(project);
      const validTypes: TaskType[] = ['implementation', 'testing', 'documentation', 'review'];

      response.data.tasks.forEach((task: any) => {
        expect(validTypes).toContain(task.type);
      });
    });
  });

  describe('reviewCompletedTasks', () => {
    it('should report all tasks completed', async () => {
      const project: Project = {
        id: 'proj-123',
        name: 'Test Project',
        description: 'Build a feature',
        tasks: [],
        status: 'planning',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await manager.handleProject(project);
      
      // Simulate all tasks completed
      // In real implementation, this would be updated by workers
      
      const response = await manager.reviewCompletedTasks();

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
    });
  });
});
