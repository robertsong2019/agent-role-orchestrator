/**
 * Type validation tests
 */

import { 
  AgentRole, 
  TaskType, 
  TaskPriority, 
  TaskStatus, 
  Task, 
  Project, 
  AgentResponse 
} from '../src/types';

describe('Types', () => {
  describe('Task', () => {
    it('should create a valid task', () => {
      const task: Task = {
        id: 'task-1',
        type: 'implementation',
        priority: 'high',
        description: 'Test task',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(task.id).toBeDefined();
      expect(task.type).toBe('implementation');
      expect(task.priority).toBe('high');
      expect(task.status).toBe('pending');
    });

    it('should support all task types', () => {
      const types: TaskType[] = ['implementation', 'testing', 'documentation', 'review'];
      
      types.forEach(type => {
        const task: Task = {
          id: `task-${type}`,
          type,
          priority: 'medium',
          description: `Test ${type}`,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(task.type).toBe(type);
      });
    });

    it('should support all task priorities', () => {
      const priorities: TaskPriority[] = ['high', 'medium', 'low'];
      
      priorities.forEach(priority => {
        const task: Task = {
          id: `task-${priority}`,
          type: 'implementation',
          priority,
          description: `Test ${priority} priority`,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(task.priority).toBe(priority);
      });
    });

    it('should support all task statuses', () => {
      const statuses: TaskStatus[] = ['pending', 'in-progress', 'completed', 'blocked'];
      
      statuses.forEach(status => {
        const task: Task = {
          id: `task-${status}`,
          type: 'implementation',
          priority: 'medium',
          description: `Test ${status}`,
          status,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(task.status).toBe(status);
      });
    });
  });

  describe('Project', () => {
    it('should create a valid project', () => {
      const project: Project = {
        id: 'proj-1',
        name: 'Test Project',
        description: 'A test project',
        tasks: [],
        status: 'planning',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(project.id).toBeDefined();
      expect(project.name).toBe('Test Project');
      expect(project.status).toBe('planning');
      expect(project.tasks).toEqual([]);
    });

    it('should support all project statuses', () => {
      const statuses: Array<'planning' | 'in-progress' | 'completed'> = [
        'planning',
        'in-progress',
        'completed',
      ];

      statuses.forEach(status => {
        const project: Project = {
          id: `proj-${status}`,
          name: 'Test',
          description: 'Test',
          tasks: [],
          status,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(project.status).toBe(status);
      });
    });
  });

  describe('AgentResponse', () => {
    it('should create a success response', () => {
      const response: AgentResponse = {
        success: true,
        message: 'Operation successful',
        data: { foo: 'bar' },
        nextActions: ['action1', 'action2'],
      };

      expect(response.success).toBe(true);
      expect(response.message).toBe('Operation successful');
      expect(response.data).toEqual({ foo: 'bar' });
      expect(response.nextActions).toEqual(['action1', 'action2']);
    });

    it('should create a failure response', () => {
      const response: AgentResponse = {
        success: false,
        message: 'Operation failed',
      };

      expect(response.success).toBe(false);
      expect(response.message).toBe('Operation failed');
    });

    it('should allow optional fields', () => {
      const response: AgentResponse = {
        success: true,
        message: 'Simple response',
      };

      expect(response.data).toBeUndefined();
      expect(response.nextActions).toBeUndefined();
    });
  });
});
