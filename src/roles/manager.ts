/**
 * Manager Agent - Task decomposition and coordination
 */

import { Agent, AgentRole, Project, Task, AgentResponse } from '../types.js';
import { MemorySystem } from '../memory.js';
import { EventBus } from '../events.js';
import { TaskDecomposer } from '../decomposer.js';

export class ManagerAgent implements Agent {
  role: AgentRole = 'manager';
  name = 'Manager Agent';
  private project: Project | null = null;
  private tasks: Task[] = [];
  private memory!: MemorySystem;
  private eventBus: EventBus;
  private decomposer: TaskDecomposer;

  constructor(eventBus: EventBus, decomposer: TaskDecomposer) {
    this.eventBus = eventBus;
    this.decomposer = decomposer;
  }

  async initialize(): Promise<void> {
    this.memory = new MemorySystem({
      working: { capacity: 7 },
      shortTerm: { maxAgeMs: 3600000, maxEntries: 100 },
      longTerm: { persistenceEnabled: false },
    });
    console.log('📋 Manager Agent initialized with memory system');
  }

  async handleProject(project: Project): Promise<AgentResponse> {
    this.project = project;
    this.tasks = [];

    console.log(`\n📋 Manager: Received project "${project.name}"`);
    console.log(`📋 Manager: Decomposing into tasks using TaskDecomposer...`);

    const decomposedTasks = this.decomposer.decompose(project.description);
    this.tasks = decomposedTasks;

    console.log(`📋 Manager: Created ${decomposedTasks.length} tasks`);

    // Store in memory
    this.memory.working.add({
      type: 'task',
      content: `Decomposed "${project.name}" into ${decomposedTasks.length} tasks`,
      importance: 0.8,
      metadata: {
        projectId: project.id,
        taskCount: decomposedTasks.length,
        taskTypes: decomposedTasks.map(t => t.type),
      },
    });

    const assignments = await this.assignTasks(decomposedTasks);

    return {
      success: true,
      message: `Project "${project.name}" decomposed into ${decomposedTasks.length} tasks`,
      data: { tasks: decomposedTasks, assignments },
      nextActions: ['execute_tasks'],
    };
  }

  private async assignTasks(tasks: Task[]): Promise<{ [taskId: string]: string }> {
    const assignments: { [taskId: string]: string } = {};
    for (const task of tasks) {
      const workerId = `worker-${(Math.floor(Math.random() * 3) + 1)}`;
      assignments[task.id] = workerId;
      console.log(`  📝 Assigned "${task.description}" to ${workerId}`);
    }
    return assignments;
  }

  async reviewCompletedTasks(): Promise<AgentResponse> {
    console.log(`\n📋 Manager: Reviewing completed tasks...`);

    const completedTasks = this.tasks.filter(t => t.status === 'completed');
    const inProgressTasks = this.tasks.filter(t => t.status === 'in-progress');
    const pendingTasks = this.tasks.filter(t => t.status === 'pending');

    console.log(`📋 Manager: Status Report`);
    console.log(`  ✅ Completed: ${completedTasks.length}`);
    console.log(`  🔄 In Progress: ${inProgressTasks.length}`);
    console.log(`  ⏳ Pending: ${pendingTasks.length}`);

    if (pendingTasks.length === 0 && inProgressTasks.length === 0) {
      console.log(`\n📋 Manager: All tasks completed! Reporting to CEO...`);

      this.memory.longTerm.add({
        type: 'fact',
        content: `Project "${this.project?.name}" completed with ${this.tasks.length} tasks`,
        importance: 0.9,
        metadata: {
          projectId: this.project?.id,
          taskCount: this.tasks.length,
          completedAt: new Date().toISOString(),
        },
      });

      return {
        success: true,
        message: 'All tasks completed successfully',
        data: {
          completedTasks: completedTasks.length,
          totalTasks: this.tasks.length,
        },
        nextActions: ['report_to_ceo'],
      };
    }

    return {
      success: true,
      message: 'Review in progress',
      data: {
        completed: completedTasks.length,
        inProgress: inProgressTasks.length,
        pending: pendingTasks.length,
      },
    };
  }
}
