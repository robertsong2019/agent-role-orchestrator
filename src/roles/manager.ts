/**
 * Manager Agent - Task decomposition and coordination
 * 
 * Responsibilities:
 * - Decompose projects into tasks
 * - Assign tasks to workers
 * - Track progress
 * - Review completed work
 * - Report to CEO
 * - Doesn't implement features directly
 */

import { Agent, AgentRole, Project, Task, AgentResponse } from '../types.js';

export class ManagerAgent implements Agent {
  role: AgentRole = 'manager';
  name = 'Manager Agent';
  private project: Project | null = null;
  private tasks: Task[] = [];

  async initialize(): Promise<void> {
    console.log('📋 Manager Agent initialized');
  }

  async handleProject(project: Project): Promise<AgentResponse> {
    this.project = project;
    this.tasks = [];
    
    console.log(`\n📋 Manager: Received project "${project.name}"`);
    console.log(`📋 Manager: Decomposing into tasks...`);
    
    // Simulate task decomposition
    await this.delay(1000);
    
    const decomposedTasks = this.decomposeProject(project.description);
    this.tasks = decomposedTasks;
    
    console.log(`📋 Manager: Created ${decomposedTasks.length} tasks`);
    
    // Assign tasks to workers
    const assignments = await this.assignTasks(decomposedTasks);
    
    return {
      success: true,
      message: `Project "${project.name}" decomposed into ${decomposedTasks.length} tasks`,
      data: {
        tasks: decomposedTasks,
        assignments
      },
      nextActions: ['execute_tasks']
    };
  }

  private decomposeProject(description: string): Task[] {
    // Simulate intelligent task decomposition
    // This would normally be done by an LLM
    const tasks: Task[] = [];
    
    // Generate implementation tasks
    const implCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < implCount; i++) {
      tasks.push({
        id: `task-impl-${i + 1}`,
        type: 'implementation',
        priority: 'high',
        description: `Implement feature ${i + 1}`,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Generate testing task
    tasks.push({
      id: 'task-testing',
      type: 'testing',
      priority: 'high',
      description: 'Write unit tests',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Generate documentation task
    tasks.push({
      id: 'task-documentation',
      type: 'documentation',
      priority: 'medium',
      description: 'Create API documentation',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return tasks;
  }

  private async assignTasks(tasks: Task[]): Promise<{ [taskId: string]: string }> {
    const assignments: { [taskId: string]: string } = {};
    
    for (const task of tasks) {
      // Simple round-robin assignment
      const workerId = `worker-${(Math.floor(Math.random() * 3) + 1)}`;
      assignments[task.id] = workerId;
      console.log(`  📝 Assigned "${task.description}" to ${workerId}`);
      await this.delay(500);
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
      return {
        success: true,
        message: 'All tasks completed successfully',
        data: {
          completedTasks: completedTasks.length,
          totalTasks: this.tasks.length
        },
        nextActions: ['report_to_ceo']
      };
    }
    
    return {
      success: true,
      message: 'Review in progress',
      data: {
        completed: completedTasks.length,
        inProgress: inProgressTasks.length,
        pending: pendingTasks.length
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
