/**
 * Main entry point - Demonstrates role-based agent collaboration
 */

import { Orchestrator } from './orchestrator.js';

async function main() {
  const orchestrator = new Orchestrator();

  try {
    // Start the orchestrator
    await orchestrator.start();

    // Example request
    const request = 'Build a user authentication system with JWT tokens';
    
    // Process the request
    await orchestrator.processRequest(request);

    // Stop the orchestrator
    await orchestrator.stop();

    console.log('\n✨ Demo completed! This project demonstrates role-based agent collaboration.');
    console.log('📚 Key concepts:');
    console.log('  - Role clarity: Each agent has specific responsibilities');
    console.log('  - Hierarchical coordination: CEO → Manager → Workers');
    console.log('  - No cross-level communication: Maintains clarity');
    console.log('\n🔗 Learn more: https://github.com/robertsong2019/agent-role-orchestrator');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the demo
main();
