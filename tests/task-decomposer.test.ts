/**
 * Tests for TaskDecomposer
 */

import { TaskDecomposer } from '../src/decomposer';

describe('TaskDecomposer', () => {
  let decomposer: TaskDecomposer;

  beforeEach(() => {
    decomposer = new TaskDecomposer();
  });

  describe('decompose', () => {
    test('should produce auth-related tasks for auth keywords', () => {
      const description = 'Build a secure authentication system with login and JWT tokens';
      const tasks = decomposer.decompose(description);

      expect(tasks.length).toBeGreaterThan(0);

      // Check that auth-related tasks are present
      const taskDescriptions = tasks.map(t => t.description.toLowerCase());
      expect(taskDescriptions.some(d => d.includes('user'))).toBe(true);
      expect(taskDescriptions.some(d => d.includes('login') || d.includes('registration'))).toBe(true);
      expect(taskDescriptions.some(d => d.includes('jwt') || d.includes('token'))).toBe(true);
    });

    test('should produce CRUD tasks for CRUD keywords', () => {
      const description = 'Create a CRUD API for managing user resources';
      const tasks = decomposer.decompose(description);

      expect(tasks.length).toBeGreaterThan(0);

      // Check that CRUD tasks are present
      const taskDescriptions = tasks.map(t => t.description.toLowerCase());
      expect(taskDescriptions.some(d => d.includes('create'))).toBe(true);
      expect(taskDescriptions.some(d => d.includes('read'))).toBe(true);
      expect(taskDescriptions.some(d => d.includes('update'))).toBe(true);
      expect(taskDescriptions.some(d => d.includes('delete'))).toBe(true);
    });

    test('should fall back to default tasks when no keywords match', () => {
      const description = 'Build a generic project';
      const tasks = decomposer.decompose(description);

      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks.some(t => t.type === 'implementation')).toBe(true);
      expect(tasks.some(t => t.type === 'testing')).toBe(true);
    });

    test('should assign valid IDs and timestamps to all tasks', () => {
      const description = 'Create a simple project';
      const tasks = decomposer.decompose(description);

      tasks.forEach(task => {
        expect(task.id).toBeDefined();
        expect(task.createdAt).toBeInstanceOf(Date);
        expect(task.updatedAt).toBeInstanceOf(Date);
        expect(task.status).toBe('pending');
      });
    });
  });

  describe('analyze', () => {
    test('should return correct analysis structure', () => {
      const description = 'Build authentication with JWT';
      const analysis = decomposer.analyze(description);

      expect(analysis).toHaveProperty('matchedKeywords');
      expect(analysis).toHaveProperty('estimatedTasks');
      expect(analysis).toHaveProperty('taskBreakdown');
      expect(analysis.taskBreakdown).toHaveProperty('implementation');
      expect(analysis.taskBreakdown).toHaveProperty('testing');
      expect(analysis.taskBreakdown).toHaveProperty('documentation');
    });

    test('should identify matched keywords', () => {
      const description = 'Build authentication with JWT and login';
      const analysis = decomposer.analyze(description);

      expect(analysis.matchedKeywords.length).toBeGreaterThan(0);
      expect(analysis.matchedKeywords).toContain('authentication');
      expect(analysis.matchedKeywords).toContain('jwt');
    });

    test('should estimate correct number of tasks', () => {
      const description = 'Build authentication with JWT';
      const analysis = decomposer.analyze(description);
      const tasks = decomposer.decompose(description);

      expect(analysis.estimatedTasks).toBe(tasks.length);
    });

    test('should count tasks by type correctly', () => {
      const description = 'Build authentication with JWT';
      const analysis = decomposer.analyze(description);

      const typeCount = Object.values(analysis.taskBreakdown).reduce((sum, count) => sum + count, 0);
      expect(typeCount).toBe(analysis.estimatedTasks);
    });
  });

  describe('mergePatterns', () => {
    test('should deduplicate tasks when multiple patterns match', () => {
      // Both auth and crud patterns could match this
      const description = 'Build a CRUD API with JWT authentication';
      const tasks = decomposer.decompose(description);

      // Check that tasks are not duplicated
      const descriptions = tasks.map(t => t.description);
      const uniqueDescriptions = new Set(descriptions);
      expect(descriptions.length).toBe(uniqueDescriptions.size);
    });

    test('should merge tasks from multiple patterns', () => {
      const description = 'Build frontend UI with authentication and database schema';
      const tasks = decomposer.decompose(description);

      // Should have more tasks than a single pattern
      expect(tasks.length).toBeGreaterThan(5);
    });
  });
});
