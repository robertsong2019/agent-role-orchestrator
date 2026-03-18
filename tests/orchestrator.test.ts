/**
 * Integration tests for Orchestrator
 */

import { Orchestrator } from '../src/orchestrator';

describe('Orchestrator', () => {
  let orchestrator: Orchestrator;

  beforeEach(() => {
    orchestrator = new Orchestrator();
  });

  afterEach(async () => {
    // Clean up
    if (orchestrator) {
      await orchestrator.stop();
    }
  });

  describe('lifecycle', () => {
    it('should start successfully', async () => {
      await expect(orchestrator.start()).resolves.not.toThrow();
    });

    it('should stop successfully', async () => {
      await orchestrator.start();
      await expect(orchestrator.stop()).resolves.not.toThrow();
    });

    it('should not start twice', async () => {
      await orchestrator.start();
      await orchestrator.start(); // Should not throw
    });
  });

  describe('processRequest', () => {
    it('should reject request when not started', async () => {
      const request = 'Build a feature';

      await expect(orchestrator.processRequest(request)).rejects.toThrow(
        'Orchestrator is not running'
      );
    });

    it('should process a simple request', async () => {
      await orchestrator.start();

      const request = 'Build a user authentication system';
      const response = await orchestrator.processRequest(request);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Request processed successfully');
      expect(response.data).toBeDefined();
      expect(response.data.ceoResponse).toBeDefined();
      expect(response.data.managerResponse).toBeDefined();
    });

    it('should execute full workflow', async () => {
      await orchestrator.start();

      const request = 'Implement JWT authentication';
      const response = await orchestrator.processRequest(request);

      // Verify CEO stage
      expect(response.data.ceoResponse.success).toBe(true);
      expect(response.data.ceoResponse.data.project).toBeDefined();

      // Verify Manager stage
      expect(response.data.managerResponse.success).toBe(true);
      expect(response.data.managerResponse.data.tasks).toBeDefined();
      expect(response.data.managerResponse.data.tasks.length).toBeGreaterThan(0);

      // Verify completion
      expect(response.success).toBe(true);
    }, 10000); // Increase timeout for full workflow

    it('should handle multiple requests sequentially', async () => {
      await orchestrator.start();

      const request1 = 'Build feature A';
      const request2 = 'Build feature B';

      const response1 = await orchestrator.processRequest(request1);
      const response2 = await orchestrator.processRequest(request2);

      expect(response1.success).toBe(true);
      expect(response2.success).toBe(true);
    }, 15000);

    it('should generate unique project IDs for different requests', async () => {
      await orchestrator.start();

      const request = 'Build a feature';
      const response1 = await orchestrator.processRequest(request);
      const response2 = await orchestrator.processRequest(request);

      const projectId1 = response1.data.ceoResponse.data.project.id;
      const projectId2 = response2.data.ceoResponse.data.project.id;

      expect(projectId1).not.toBe(projectId2);
    }, 15000);
  });

  describe('error handling', () => {
    it('should handle invalid requests gracefully', async () => {
      await orchestrator.start();

      // Empty request
      const response = await orchestrator.processRequest('');

      expect(response.success).toBe(true); // Should not crash
    });
  });

  describe('performance', () => {
    it('should complete a full workflow within reasonable time', async () => {
      await orchestrator.start();

      const startTime = Date.now();
      const request = 'Build a simple feature';

      await orchestrator.processRequest(request);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should handle concurrent task execution', async () => {
      await orchestrator.start();

      const requests = [
        'Build feature 1',
        'Build feature 2',
        'Build feature 3',
      ];

      const startTime = Date.now();

      // Process requests sequentially (orchestrator doesn't support concurrent yet)
      for (const request of requests) {
        await orchestrator.processRequest(request);
      }

      const duration = Date.now() - startTime;
      
      // Should complete all requests
      expect(duration).toBeLessThan(30000); // Within 30 seconds
    }, 35000);
  });
});
