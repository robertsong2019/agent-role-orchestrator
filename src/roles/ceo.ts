/**
 * CEO Agent - Strategic decision maker
 */

import { Agent, AgentRole, Project, Task, AgentResponse } from '../types.js';
import { MemorySystem, MemoryEntry } from '../memory.js';
import { EventBus } from '../events.js';

export class CEOAgent implements Agent {
  role: AgentRole = 'ceo';
  name = 'CEO Agent';
  private project: Project | null = null;
  private memory!: MemorySystem;
  private eventBus: EventBus;

  private simulateDelay: number;

  constructor(eventBus: EventBus, config?: { simulateDelay?: number }) {
    this.eventBus = eventBus;
    this.simulateDelay = config?.simulateDelay ?? 500;
  }

  async initialize(): Promise<void> {
    this.memory = new MemorySystem({
      working: { capacity: 5 },
      shortTerm: { maxAgeMs: 3600000, maxEntries: 50 },
      longTerm: { persistenceEnabled: false },
    });
    console.log('👔 CEO Agent initialized with memory system');

    // Subscribe to project completion events
    this.eventBus.on('manager:review-complete', async (event) => {
      console.log('👔 CEO: Received project completion notification from Manager');
    });
  }

  async handleRequest(request: string): Promise<AgentResponse> {
    console.log(`\n🎯 CEO: Analyzing request: "${request}"`);

    const recentDecisions = this.memory.working.query({
      type: 'decision',
      limit: 3,
    });

    if (recentDecisions.length > 0) {
      console.log(`💭 CEO: Recalling ${recentDecisions.length} recent decisions from memory`);
    }

    await this.delay(this.simulateDelay);

    this.project = {
      id: this.generateId(),
      name: this.extractProjectName(request),
      description: request,
      tasks: [],
      status: 'planning',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const priorities = this.analyzePriorities(request);
    console.log(`📋 CEO: Project priorities set: ${priorities.join(', ')}`);

    this.memory.working.add({
      type: 'decision',
      content: `Project "${this.project.name}" created with priorities: ${priorities.join(', ')}`,
      importance: 0.9,
      metadata: {
        projectId: this.project.id,
        priorities: priorities,
      },
    });

    this.memory.shortTerm.add({
      type: 'task',
      content: request,
      importance: 0.7,
      metadata: {
        projectId: this.project.id,
        projectName: this.project.name,
      },
    });

    return {
      success: true,
      message: 'Project plan created',
      data: {
        project: this.project,
        priorities: priorities,
      },
      nextActions: ['manager_decompose'],
    };
  }

  async reviewProject(project: Project): Promise<AgentResponse> {
    console.log(`\n🔍 CEO: Reviewing project: ${project.name}`);

    const projectMemories = this.memory.shortTerm.query({
      keywords: [project.name],
      limit: 5,
    });

    if (projectMemories.length > 0) {
      console.log(`💭 CEO: Recalled ${projectMemories.length} memories about this project`);
    }

    await this.delay(this.simulateDelay);

    const completedTasks = project.tasks.filter(t => t.status === 'completed');
    const totalTasks = project.tasks.length;

    console.log(`✅ CEO: ${completedTasks.length}/${totalTasks} tasks completed`);

    if (completedTasks.length === totalTasks) {
      console.log(`🎉 CEO: Project completed successfully!`);

      this.memory.longTerm.add({
        type: 'fact',
        content: `Project "${project.name}" completed successfully with ${totalTasks} tasks`,
        importance: 0.8,
        metadata: {
          projectId: project.id,
          taskCount: totalTasks,
          completedAt: new Date().toISOString(),
        },
      });

      this.memory.promoteToLongTerm(projectMemories[0]?.id || '');

      return {
        success: true,
        message: 'Project approved',
        data: { project },
      };
    }

    console.log(`⚠️ CEO: Project not yet complete`);

    this.memory.working.add({
      type: 'feedback',
      content: `Project ${completedTasks.length}/${totalTasks} tasks completed`,
      importance: 0.6,
      metadata: {
        projectId: project.id,
        progress: completedTasks.length / totalTasks,
      },
    });

    return {
      success: false,
      message: 'Project still in progress',
    };
  }

  private extractProjectName(request: string): string {
    const keywords = ['build', 'create', 'implement', 'develop', 'design'];
    let name = request.toLowerCase().trim();

    for (const keyword of keywords) {
      const regex = new RegExp(`^${keyword}\\s+`, 'i');
      name = name.replace(regex, '');
    }

    const words = name.split(/\s+/).slice(0, 4);
    return words.join(' ') || 'Unnamed Project';
  }

  private analyzePriorities(request: string): string[] {
    const lowerRequest = request.toLowerCase();

    if (lowerRequest.includes('authentication') || lowerRequest.includes('security')) {
      return ['security', 'authentication', 'testing'];
    } else if (lowerRequest.includes('ui') || lowerRequest.includes('frontend')) {
      return ['user-experience', 'frontend', 'testing'];
    } else {
      return ['functionality', 'quality', 'documentation'];
    }
  }

  private generateId(): string {
    return `proj-${Date.now()}-${Math.random().toString(36).substr(2, 11)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
