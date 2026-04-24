/**
 * Main entry point - Demonstrates role-based agent collaboration with event logging
 */

import { Orchestrator } from './orchestrator.js';

async function main() {
  const orchestrator = new Orchestrator();

  try {
    // Start the orchestrator
    await orchestrator.start();

    // Subscribe to events for demonstration
    const eventBus = orchestrator.getEventBus();
    
    console.log('📡 Event logging enabled - monitoring agent communication...\n');
    
    eventBus.on('request:received', (e) => {
      console.log(`📬 [EVENT] Request received: "${e.payload.request}"`);
    });

    eventBus.on('ceo:project-created', (e) => {
      console.log(`📬 [EVENT] CEO created project: ${e.payload.project.name}`);
    });

    eventBus.on('manager:tasks-decomposed', (e) => {
      console.log(`📬 [EVENT] Manager decomposed into ${e.payload.tasks.length} tasks`);
      e.payload.tasks.forEach((t: any, i: number) => {
        console.log(`   ${i + 1}. [${t.type.toUpperCase()}] ${t.description} (${t.priority} priority)`);
      });
    });

    eventBus.on('worker:task-started', (e) => {
      console.log(`📬 [EVENT] Worker started: ${e.payload.task.description}`);
    });

    eventBus.on('worker:task-completed', (e) => {
      console.log(`📬 [EVENT] Worker completed: ${e.payload.task.description}`);
    });

    eventBus.on('manager:review-complete', (e) => {
      console.log(`📬 [EVENT] Manager review complete`);
    });

    eventBus.on('orchestrator:project-complete', (e) => {
      console.log(`📬 [EVENT] Project complete: ${e.payload.project.name}`);
    });

    // Example request with auth keywords to show TaskDecomposer in action
    const request = 'Build a user authentication system with JWT tokens and secure session management';
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 PROCESSING REQUEST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Process the request
    const result = await orchestrator.processRequest(request);

    // Show event history
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 EVENT SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const history = eventBus.getHistory();
    console.log(`Total events: ${history.length}`);
    history.forEach((e, i) => {
      console.log(`${i + 1}. [${e.source}] ${e.name} - ${e.timestamp.toLocaleTimeString()}`);
    });

    // Show TaskQueue statistics
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚡ TASK QUEUE STATS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const queueStats = orchestrator.getTaskQueue().getStats();
    console.log(`Pending: ${queueStats.pending}`);
    console.log(`Running: ${queueStats.running}`);
    console.log(`Completed: ${queueStats.completed}`);
    console.log(`Failed: ${queueStats.failed}`);
    console.log(`Total: ${queueStats.total}`);

    // Stop the orchestrator
    await orchestrator.stop();

    console.log('\n✨ Demo completed!');
    console.log('\n📚 Key concepts demonstrated:');
    console.log('  ✅ Event-driven architecture with EventBus');
    console.log('  ✅ Concurrent task execution via TaskQueue');
    console.log('  ✅ Smart task decomposition with TaskDecomposer');
    console.log('  ✅ Role-based agent hierarchy (CEO → Manager → Workers)');
    console.log('  ✅ Memory systems for context retention');
    console.log('\n🔗 Learn more: https://github.com/robertsong2019/agent-role-orchestrator');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the demo
main();
