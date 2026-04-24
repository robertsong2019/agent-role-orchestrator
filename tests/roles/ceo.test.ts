/**
 * Tests for CEO Agent
 */

import { CEOAgent } from '../../src/roles/ceo';
import { AgentRole } from '../../src/types';
import { EventBus } from '../../src/events';

describe('CEOAgent', () => {
  let ceo: CEOAgent;

  beforeEach(() => {
    ceo = new CEOAgent(new EventBus());
  });

  describe('initialization', () => {
    it('should have correct role', () => {
      expect(ceo.role).toBe('ceo');
    });

    it('should have correct name', () => {
      expect(ceo.name).toBe('CEO Agent');
    });

    it('should initialize successfully', async () => {
      await expect(ceo.initialize()).resolves.not.toThrow();
    });
  });

  describe('handleRequest', () => {
  beforeEach(async () => {
    await ceo.initialize();
  });

  it('should analyze a request and create a project plan', async () => {
      const request = 'Build a user authentication system';
      const response = await ceo.handleRequest(request);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Project plan created');
      expect(response.data).toBeDefined();
      expect(response.data.project).toBeDefined();
      expect(response.data.project.name).toBeDefined();
      expect(response.data.project.description).toBe(request);
      expect(response.data.priorities).toBeDefined();
      expect(response.data.priorities.length).toBeGreaterThan(0);
      expect(response.nextActions).toContain('manager_decompose');
    });

    it('should identify security-related priorities', async () => {
      const request = 'Implement secure authentication with JWT';
      const response = await ceo.handleRequest(request);

      expect(response.data.priorities).toContain('security');
      expect(response.data.priorities).toContain('authentication');
    });

    it('should identify frontend-related priorities', async () => {
      const request = 'Build a beautiful UI dashboard';
      const response = await ceo.handleRequest(request);

      expect(response.data.priorities).toContain('user-experience');
      expect(response.data.priorities).toContain('frontend');
    });

    it('should generate unique project IDs', async () => {
      const request1 = 'Build feature A';
      const request2 = 'Build feature B';

      const response1 = await ceo.handleRequest(request1);
      const response2 = await ceo.handleRequest(request2);

      expect(response1.data.project.id).not.toBe(response2.data.project.id);
    });
  });

  describe('reviewProject', () => {
  beforeEach(async () => {
    await ceo.initialize();
  });

  it('should approve completed projects', async () => {
      const project = {
        id: 'test-project',
        name: 'Test Project',
        description: 'A test project',
        tasks: [
          { id: 'task-1', status: 'completed' } as any,
          { id: 'task-2', status: 'completed' } as any,
        ],
        status: 'completed' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = await ceo.reviewProject(project);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Project approved');
    });

    it('should not approve incomplete projects', async () => {
      const project = {
        id: 'test-project',
        name: 'Test Project',
        description: 'A test project',
        tasks: [
          { id: 'task-1', status: 'completed' } as any,
          { id: 'task-2', status: 'pending' } as any,
        ],
        status: 'in-progress' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = await ceo.reviewProject(project);

      expect(response.success).toBe(false);
      expect(response.message).toBe('Project still in progress');
    });
  });
});
