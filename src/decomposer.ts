/**
 * Smart Task Decomposer
 * 
 * Analyzes project descriptions and generates structured, meaningful tasks
 * using pattern matching and heuristics (no LLM required for core logic).
 */

import { Task, TaskType, TaskPriority, TaskStatus } from './types.js';

interface DecompositionPattern {
  keywords: string[];
  tasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[];
}

const PATTERNS: DecompositionPattern[] = [
  {
    keywords: ['auth', 'authentication', 'login', 'signup', 'jwt', 'token', 'session'],
    tasks: [
      { type: 'implementation', priority: 'high', description: 'Implement user model and database schema', status: 'pending' },
      { type: 'implementation', priority: 'high', description: 'Implement registration endpoint with input validation', status: 'pending' },
      { type: 'implementation', priority: 'high', description: 'Implement login endpoint with credential verification', status: 'pending' },
      { type: 'implementation', priority: 'high', description: 'Implement JWT token generation and validation middleware', status: 'pending' },
      { type: 'implementation', priority: 'medium', description: 'Implement password reset flow', status: 'pending' },
      { type: 'testing', priority: 'high', description: 'Write unit tests for auth endpoints (register, login, token refresh)', status: 'pending' },
      { type: 'testing', priority: 'high', description: 'Write integration tests for auth flow end-to-end', status: 'pending' },
      { type: 'documentation', priority: 'medium', description: 'Document API endpoints with request/response examples', status: 'pending' },
    ],
  },
  {
    keywords: ['crud', 'api', 'rest', 'resource', 'endpoint', 'backend'],
    tasks: [
      { type: 'implementation', priority: 'high', description: 'Define data model and database schema', status: 'pending' },
      { type: 'implementation', priority: 'high', description: 'Implement Create endpoint with validation', status: 'pending' },
      { type: 'implementation', priority: 'high', description: 'Implement Read endpoint with pagination and filtering', status: 'pending' },
      { type: 'implementation', priority: 'high', description: 'Implement Update endpoint with partial updates', status: 'pending' },
      { type: 'implementation', priority: 'high', description: 'Implement Delete endpoint with soft-delete support', status: 'pending' },
      { type: 'testing', priority: 'high', description: 'Write unit tests for all CRUD operations', status: 'pending' },
      { type: 'testing', priority: 'medium', description: 'Write error handling and edge case tests', status: 'pending' },
      { type: 'documentation', priority: 'medium', description: 'Create OpenAPI/Swagger documentation', status: 'pending' },
    ],
  },
  {
    keywords: ['ui', 'frontend', 'component', 'page', 'react', 'vue', 'interface'],
    tasks: [
      { type: 'implementation', priority: 'high', description: 'Create component structure and design system tokens', status: 'pending' },
      { type: 'implementation', priority: 'high', description: 'Implement main layout and navigation components', status: 'pending' },
      { type: 'implementation', priority: 'high', description: 'Implement core UI components with responsive design', status: 'pending' },
      { type: 'implementation', priority: 'medium', description: 'Add form handling and input validation', status: 'pending' },
      { type: 'implementation', priority: 'medium', description: 'Implement state management and data flow', status: 'pending' },
      { type: 'testing', priority: 'high', description: 'Write component unit tests with accessibility checks', status: 'pending' },
      { type: 'documentation', priority: 'low', description: 'Create component storybook/documentation', status: 'pending' },
    ],
  },
  {
    keywords: ['database', 'schema', 'migration', 'model', 'orm', 'sql'],
    tasks: [
      { type: 'implementation', priority: 'high', description: 'Design entity-relationship diagram and normalize schema', status: 'pending' },
      { type: 'implementation', priority: 'high', description: 'Create migration scripts for schema creation', status: 'pending' },
      { type: 'implementation', priority: 'high', description: 'Implement model definitions with relationships', status: 'pending' },
      { type: 'implementation', priority: 'medium', description: 'Create seed data scripts for development', status: 'pending' },
      { type: 'testing', priority: 'high', description: 'Write model validation and constraint tests', status: 'pending' },
      { type: 'documentation', priority: 'medium', description: 'Document schema design decisions and indexes', status: 'pending' },
    ],
  },
  {
    keywords: ['test', 'testing', 'qa', 'quality', 'coverage'],
    tasks: [
      { type: 'testing', priority: 'high', description: 'Set up testing framework and configuration', status: 'pending' },
      { type: 'testing', priority: 'high', description: 'Write unit tests for core business logic', status: 'pending' },
      { type: 'testing', priority: 'high', description: 'Write integration tests for API endpoints', status: 'pending' },
      { type: 'testing', priority: 'medium', description: 'Write end-to-end tests for critical user flows', status: 'pending' },
      { type: 'testing', priority: 'medium', description: 'Add performance/load test suite', status: 'pending' },
      { type: 'documentation', priority: 'low', description: 'Document testing strategy and coverage requirements', status: 'pending' },
    ],
  },
];

const DEFAULT_TASKS: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { type: 'implementation', priority: 'high', description: 'Implement core functionality and main features', status: 'pending' },
  { type: 'implementation', priority: 'medium', description: 'Implement supporting utilities and helpers', status: 'pending' },
  { type: 'testing', priority: 'high', description: 'Write unit tests for core functionality', status: 'pending' },
  { type: 'testing', priority: 'medium', description: 'Write integration tests', status: 'pending' },
  { type: 'review', priority: 'medium', description: 'Code review and quality check', status: 'pending' },
  { type: 'documentation', priority: 'low', description: 'Create documentation and usage examples', status: 'pending' },
];

export class TaskDecomposer {
  /**
   * Decompose a project description into structured tasks
   */
  decompose(description: string): Task[] {
    const lower = description.toLowerCase();
    
    // Find matching patterns
    const matchedPatterns = PATTERNS.filter(pattern =>
      pattern.keywords.some(kw => lower.includes(kw))
    );

    // Use the best matching pattern, or fall back to defaults
    const taskTemplates = matchedPatterns.length > 0
      ? this.mergePatterns(matchedPatterns)
      : DEFAULT_TASKS;

    return taskTemplates.map((template, index) => ({
      ...template,
      id: `task-${index + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  /**
   * Merge multiple matched patterns into a single task list, deduplicating
   */
  private mergePatterns(patterns: DecompositionPattern[]): Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] {
    const seen = new Set<string>();
    const tasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    for (const pattern of patterns) {
      for (const task of pattern.tasks) {
        const key = `${task.type}:${task.description}`;
        if (!seen.has(key)) {
          seen.add(key);
          tasks.push(task);
        }
      }
    }

    // Sort: high priority first, then by type order
    const typeOrder: Record<TaskType, number> = {
      implementation: 0,
      testing: 1,
      review: 2,
      documentation: 3,
    };
    const priorityOrder: Record<TaskPriority, number> = {
      high: 0,
      medium: 1,
      low: 2,
    };

    tasks.sort((a, b) => {
      const typeDiff = typeOrder[a.type] - typeOrder[b.type];
      if (typeDiff !== 0) return typeDiff;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return tasks;
  }

  /**
   * Get a summary of what would be decomposed without actually creating tasks
   */
  analyze(description: string): { matchedKeywords: string[]; estimatedTasks: number; taskBreakdown: Record<TaskType, number> } {
    const lower = description.toLowerCase();
    const matchedKeywords = PATTERNS
      .flatMap(p => p.keywords)
      .filter(kw => lower.includes(kw));

    const tasks = this.decompose(description);
    const taskBreakdown: Record<TaskType, number> = {
      implementation: 0,
      testing: 0,
      review: 0,
      documentation: 0,
    };
    for (const task of tasks) {
      taskBreakdown[task.type]++;
    }

    return { matchedKeywords: [...new Set(matchedKeywords)], estimatedTasks: tasks.length, taskBreakdown };
  }
}
