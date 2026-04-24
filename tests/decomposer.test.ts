import { TaskDecomposer } from '../src/decomposer.js';

describe('TaskDecomposer', () => {
  let decomposer: TaskDecomposer;

  beforeEach(() => {
    decomposer = new TaskDecomposer();
  });

  test('should decompose auth-related projects', () => {
    const tasks = decomposer.decompose('Build a user authentication system with JWT tokens');

    expect(tasks.length).toBeGreaterThanOrEqual(6);
    expect(tasks.some(t => t.description.toLowerCase().includes('jwt'))).toBe(true);
    expect(tasks.some(t => t.description.toLowerCase().includes('login'))).toBe(true);
    expect(tasks.some(t => t.type === 'testing')).toBe(true);
    expect(tasks.some(t => t.type === 'documentation')).toBe(true);
  });

  test('should decompose CRUD API projects', () => {
    const tasks = decomposer.decompose('Create a REST API for managing products');

    expect(tasks.length).toBeGreaterThanOrEqual(5);
    expect(tasks.some(t => t.description.toLowerCase().includes('create'))).toBe(true);
    expect(tasks.some(t => t.description.toLowerCase().includes('read') || t.description.toLowerCase().includes('pagination'))).toBe(true);
  });

  test('should decompose UI/frontend projects', () => {
    const tasks = decomposer.decompose('Build a React dashboard UI component');

    expect(tasks.length).toBeGreaterThanOrEqual(4);
    expect(tasks.some(t => t.description.toLowerCase().includes('component'))).toBe(true);
    expect(tasks.some(t => t.description.toLowerCase().includes('responsive'))).toBe(true);
  });

  test('should use default tasks for unknown project types', () => {
    const tasks = decomposer.decompose('Build something cool');

    expect(tasks.length).toBeGreaterThanOrEqual(4);
    expect(tasks.some(t => t.type === 'implementation')).toBe(true);
    expect(tasks.some(t => t.type === 'testing')).toBe(true);
  });

  test('should sort tasks by type then priority', () => {
    const tasks = decomposer.decompose('Create REST API with authentication');

    // Implementation tasks should come before testing, testing before documentation
    let lastTypeOrder = -1;
    const typeOrder: Record<string, number> = { implementation: 0, testing: 1, review: 2, documentation: 3 };

    for (const task of tasks) {
      const order = typeOrder[task.type];
      expect(order).toBeGreaterThanOrEqual(lastTypeOrder);
      lastTypeOrder = order;
    }
  });

  test('should assign unique IDs to tasks', () => {
    const tasks = decomposer.decompose('Build authentication system');
    const ids = tasks.map(t => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('should set correct timestamps', () => {
    const before = new Date();
    const tasks = decomposer.decompose('Build auth system');
    const after = new Date();

    for (const task of tasks) {
      expect(task.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(task.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(task.status).toBe('pending');
    }
  });

  test('should merge multiple matching patterns without duplicates', () => {
    // Matches both 'auth' and 'api' patterns
    const tasks = decomposer.decompose('Build authentication REST API');
    const descriptions = tasks.map(t => t.description);
    const uniqueDescriptions = new Set(descriptions);
    expect(uniqueDescriptions.size).toBe(descriptions.length);
  });

  test('should analyze without creating tasks', () => {
    const analysis = decomposer.analyze('Build a user authentication system with JWT tokens');

    expect(analysis.matchedKeywords).toContain('auth');
    expect(analysis.estimatedTasks).toBeGreaterThan(0);
    expect(analysis.taskBreakdown.implementation).toBeGreaterThan(0);
    expect(analysis.taskBreakdown.testing).toBeGreaterThan(0);
  });
});
