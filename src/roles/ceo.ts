/**
 * CEO Agent - Strategic decision maker
 * 
 * Responsibilities:
 * - Analyze incoming requests
 * - Set project priorities
 * - Allocate resources (agents)
 * - Review final deliverables
 * - Never implements features directly
 */

import { Agent, AgentRole, Project, Task, AgentResponse } from '../types.js';

export class CEOAgent implements Agent {
  role: AgentRole = 'ceo';
  name = 'CEO Agent';
  private project: Project | null = null;

  async initialize(): Promise<void> {
    console.log('👔 CEO Agent initialized');
  }

  async handleRequest(request: string): Promise<AgentResponse> {
    console.log(`\n🎯 CEO: Analyzing request: "${request}"`);
    
    // Simulate strategic analysis
    await this.delay(500);

    // Create project plan
    this.project = {
      id: this.generateId(),
      name: this.extractProjectName(request),
      description: request,
      tasks: [],
      status: 'planning',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Determine priorities and resources needed
    const priorities = this.analyzePriorities(request);
    console.log(`📋 CEO: Project priorities set: ${priorities.join(', ')}`);

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
    
    // Simulate review
    await this.delay(500);

    const completedTasks = project.tasks.filter(t => t.status === 'completed');
    const totalTasks = project.tasks.length;

    console.log(`✅ CEO: ${completedTasks.length}/${totalTasks} tasks completed`);

    if (completedTasks.length === totalTasks) {
      console.log(`🎉 CEO: Project completed successfully!`);
      return {
        success: true,
        message: 'Project approved',
        data: { project },
      };
    }

    console.log(`⚠️ CEO: Project not yet complete`);
    return {
      success: false,
      message: 'Project still in progress',
    };
  }

  private extractProjectName(request: string): string {
    // Extract a meaningful project name from the request
    const keywords = ['build', 'create', 'implement', 'develop', 'design'];
    let name = request.toLowerCase().trim();
    
    // Remove common keywords to get the core description
    for (const keyword of keywords) {
      const regex = new RegExp(`^${keyword}\\s+`, 'i');
      name = name.replace(regex, '');
    }
    
    // Take first 3-4 words as project name
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
