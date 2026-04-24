/**
 * End-to-end test - Full workflow simulation
 */

import { Orchestrator } from '../src/orchestrator';

describe('End-to-End Workflow', () => {
  let orchestrator: Orchestrator;

  beforeAll(async () => {
    orchestrator = new Orchestrator({ simulateDelay: 10 });
    await orchestrator.start();
  });

  afterAll(async () => {
    await orchestrator.stop();
  });

  it('should complete a full project workflow', async () => {
    // Step 1: Submit a project request
    const request = 'Build a user authentication system with JWT tokens';
    
    console.log('\n=== Starting End-to-End Test ===\n');
    console.log(`Request: ${request}\n`);

    // Step 2: Process the request
    const response = await orchestrator.processRequest(request);

    // Step 3: Verify CEO stage
    expect(response.data.ceoResponse.success).toBe(true);
    const project = response.data.ceoResponse.data.project;
    expect(project.name).toBeDefined();
    expect(project.description).toBe(request);
    console.log(`✅ CEO created project: ${project.name}`);

    // Step 4: Verify Manager stage
    expect(response.data.managerResponse.success).toBe(true);
    const tasks = response.data.managerResponse.data.tasks;
    expect(tasks.length).toBeGreaterThan(0);
    console.log(`✅ Manager decomposed into ${tasks.length} tasks`);

    // Step 5: Verify task types
    const taskTypes = tasks.map((t: any) => t.type);
    expect(taskTypes).toContain('implementation');
    expect(taskTypes).toContain('testing');
    expect(taskTypes).toContain('documentation');
    console.log(`✅ Tasks include: ${[...new Set(taskTypes)].join(', ')}`);

    // Step 6: Verify final result
    expect(response.success).toBe(true);
    console.log(`\n✅ Project completed successfully!\n`);
    console.log('=== End-to-End Test Passed ===\n');
  }, 30000); // Increased timeout to 30s

  it('should handle multiple project types', async () => {
    const requests = [
      'Build a REST API',
      'Create a frontend dashboard',
      'Implement a background job system',
    ];

    for (const request of requests) {
      const response = await orchestrator.processRequest(request);
      expect(response.success).toBe(true);
      console.log(`✅ Completed: ${request}`);
    }
  }, 30000);

  it('should maintain project isolation', async () => {
    const request1 = 'Build feature A';
    const request2 = 'Build feature B';

    const response1 = await orchestrator.processRequest(request1);
    const response2 = await orchestrator.processRequest(request2);

    const project1 = response1.data.ceoResponse.data.project;
    const project2 = response2.data.ceoResponse.data.project;

    // Projects should be different
    expect(project1.id).not.toBe(project2.id);
    expect(project1.name).not.toBe(project2.name);

    console.log(`✅ Project isolation maintained`);
  }, 60000); // Increased timeout to 60s
});
