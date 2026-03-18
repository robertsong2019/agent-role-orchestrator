/**
 * Orchestrator - Coordinates all agents
 * 
 * Responsibilities:
 * - Initialize all agents
 * - Route requests to appropriate agents
 * - Manage communication between agents
 * - Track overall progress
 */

import { CEOAgent } from './roles/ceo.js';
import { ManagerAgent } from './roles/manager.js';
import { WorkerAgent } from './roles/worker.js';
import { AgentResponse } from './types.js';

export class Orchestrator {
  private ceo: CEOAgent;
  private manager: ManagerAgent;
  private workers: WorkerAgent[] = [];
  private isRunning: boolean = false;

  constructor() {
    this.ceo = new CEOAgent();
    this.manager = new ManagerAgent();
    this.workers = [
      new WorkerAgent('Worker-1'),
      new WorkerAgent('Worker-2'),
      new WorkerAgent('Worker-3')
    ];
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Orchestrator is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Agent Role Orchestrator...\n');

    // Initialize all agents
    await this.ceo.initialize();
    await this.manager.initialize();
    for (const worker of this.workers) {
      await worker.initialize();
    }

    console.log('\n✅ All agents initialized and ready\n');
  }

  async processRequest(request: string): Promise<AgentResponse> {
    if (!this.isRunning) {
      throw new Error('Orchestrator is not running. Call start() first.');
    }

    console.log('═══════════════════════════════════════');
    console.log(`Processing request: "${request}"`);
    console.log('═══════════════════════════════════════\n');

    // Step 1: CEO analyzes the request
    const ceoResponse = await this.ceo.handleRequest(request);
    
    if (!ceoResponse.success) {
    return ceoResponse;
    }

    // Step 2: Manager decomposes project into tasks
    const project = ceoResponse.data.project;
    const managerResponse = await this.manager.handleProject(project);
    
    if (!managerResponse.success) {
    return managerResponse;
    }

    // Step 3: Workers execute tasks
    const tasks = managerResponse.data.tasks;
    for (const task of tasks) {
      const worker = this.getAvailableWorker();
      if (worker) {
        await worker.executeTask(task);
      }
    }

    // Step 4: Manager reviews completed work
    const reviewResponse = await this.manager.reviewCompletedTasks();
    
    // Step 5: CEO receives final report
    console.log('\n═══════════════════════════════════════');
    console.log('🎉 PROJECT COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════\n');

    return {
      success: true,
      message: 'Request processed successfully',
      data: {
        ceoResponse,
        managerResponse,
        reviewResponse
      }
    };
  }

  private getAvailableWorker(): WorkerAgent | null {
    // Simple round-robin for demo
    return this.workers[Math.floor(Math.random() * this.workers.length)];
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    console.log('\n🛑 Stopping Orchestrator...');
  }
}
