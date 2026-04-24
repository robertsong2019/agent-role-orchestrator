/**
 * Tests for Memory System
 */

import { MemorySystem, WorkingMemory, ShortTermMemory, LongTermMemory, MemoryEntry } from '../src/memory.js';

describe('WorkingMemory', () => {
  let memory: WorkingMemory;

  beforeEach(() => {
    memory = new WorkingMemory({ capacity: 3 });
  });

  test('should initialize with correct capacity', () => {
    expect(memory.size()).toBe(0);
  });

  test('should add entries', () => {
    const entry = memory.add({
      type: 'fact',
      content: 'Test fact',
      importance: 0.8,
    });
    
    expect(entry.id).toBeDefined();
    expect(entry.content).toBe('Test fact');
    expect(memory.size()).toBe(1);
  });

  test('should evict least important entries when at capacity', () => {
    memory.add({ type: 'fact', content: 'Low importance', importance: 0.3 });
    memory.add({ type: 'fact', content: 'High importance', importance: 0.9 });
    memory.add({ type: 'fact', content: 'Medium importance', importance: 0.6 });
    memory.add({ type: 'fact', content: 'Very high importance', importance: 1.0 });
    
    expect(memory.size()).toBe(3);
    
    const entries = memory.getAll();
    expect(entries[0].importance).toBe(1.0);
    expect(entries[1].importance).toBe(0.9);
    expect(entries[2].importance).toBe(0.6);
    expect(entries.find(e => e.importance === 0.3)).toBeUndefined();
  });

  test('should query by type', () => {
    memory.add({ type: 'fact', content: 'Fact 1', importance: 0.5 });
    memory.add({ type: 'decision', content: 'Decision 1', importance: 0.5 });
    memory.add({ type: 'fact', content: 'Fact 2', importance: 0.5 });
    
    const facts = memory.query({ type: 'fact' });
    expect(facts.length).toBe(2);
    
    const decisions = memory.query({ type: 'decision' });
    expect(decisions.length).toBe(1);
  });

  test('should query by importance', () => {
    memory.add({ type: 'fact', content: 'Low', importance: 0.3 });
    memory.add({ type: 'fact', content: 'Medium', importance: 0.6 });
    memory.add({ type: 'fact', content: 'High', importance: 0.9 });
    
    const important = memory.query({ minImportance: 0.5 });
    expect(important.length).toBe(2);
  });

  test('should query by keywords', () => {
    memory.add({ type: 'fact', content: 'AI agents are powerful', importance: 0.5 });
    memory.add({ type: 'fact', content: 'Python is a language', importance: 0.5 });
    memory.add({ type: 'fact', content: 'Agents can learn', importance: 0.5 });
    
    const results = memory.query({ keywords: ['agent', 'AI'] });
    expect(results.length).toBe(2);
  });

  test('should clear memory', () => {
    memory.add({ type: 'fact', content: 'Test', importance: 0.5 });
    expect(memory.size()).toBe(1);
    
    memory.clear();
    expect(memory.size()).toBe(0);
  });
});

describe('ShortTermMemory', () => {
  let memory: ShortTermMemory;

  beforeEach(() => {
    memory = new ShortTermMemory({ maxAgeMs: 1000, maxEntries: 5 });
  });

  test('should add entries with expiration', () => {
    const entry = memory.add({
      type: 'fact',
      content: 'Test fact',
      importance: 0.7,
    });
    
    expect(entry.id).toBeDefined();
    expect(entry.expiresAt).toBeDefined();
    expect(memory.size()).toBe(1);
  });

  test('should expire old entries', async () => {
    memory.add({ type: 'fact', content: 'Test', importance: 0.5 });
    expect(memory.size()).toBe(1);
    
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    expect(memory.size()).toBe(0);
  });

  test('should prune when exceeding max entries', () => {
    for (let i = 0; i < 10; i++) {
      memory.add({ type: 'fact', content: `Fact ${i}`, importance: i / 10 });
    }
    
    expect(memory.size()).toBe(5);
    
    const entries = memory.getAll();
    expect(entries[0].importance).toBe(0.9);
  });

  test('should export and import', () => {
    memory.add({ type: 'fact', content: 'Fact 1', importance: 0.5 });
    memory.add({ type: 'fact', content: 'Fact 2', importance: 0.6 });
    
    const exported = memory.export();
    expect(exported.length).toBe(2);
    
    const newMemory = new ShortTermMemory();
    newMemory.import(exported);
    expect(newMemory.size()).toBe(2);
  });
});

describe('LongTermMemory', () => {
  let memory: LongTermMemory;

  beforeEach(() => {
    memory = new LongTermMemory({ persistenceEnabled: false });
  });

  test('should add entries', () => {
    const entry = memory.add({
      type: 'fact',
      content: 'Important fact',
      importance: 0.8,
    });
    
    expect(entry.id).toBeDefined();
    expect(memory.size()).toBe(1);
  });

  test('should not add duplicates', () => {
    memory.add({ type: 'fact', content: 'Same content', importance: 0.5 });
    memory.add({ type: 'fact', content: 'Same content', importance: 0.5 });
    
    expect(memory.size()).toBe(1);
  });

  test('should update importance', () => {
    const entry = memory.add({ type: 'fact', content: 'Test', importance: 0.5 });
    
    const updated = memory.updateImportance(entry.id, 0.9);
    expect(updated).toBe(true);
    
    const entries = memory.getAll();
    expect(entries[0].importance).toBe(0.9);
  });

  test('should remove entries', () => {
    const entry = memory.add({ type: 'fact', content: 'Test', importance: 0.5 });
    expect(memory.size()).toBe(1);
    
    const removed = memory.remove(entry.id);
    expect(removed).toBe(true);
    expect(memory.size()).toBe(0);
  });

  test('should query by time range', async () => {
    const entry1 = memory.add({ type: 'fact', content: 'Old fact', importance: 0.5 });
    await new Promise(resolve => setTimeout(resolve, 100));
    const entry2 = memory.add({ type: 'fact', content: 'New fact', importance: 0.5 });
    
    const recent = memory.query({
      timeRange: {
        start: new Date(Date.now() - 50),
        end: new Date(),
      },
    });
    
    expect(recent.length).toBe(1);
    expect(recent[0].content).toBe('New fact');
  });
});

describe('MemorySystem', () => {
  let system: MemorySystem;

  beforeEach(() => {
    system = new MemorySystem({
      working: { capacity: 3 },
      shortTerm: { maxAgeMs: 3600000, maxEntries: 10 },
      longTerm: { persistenceEnabled: false },
    });
  });

  test('should initialize all three tiers', () => {
    expect(system.working).toBeDefined();
    expect(system.shortTerm).toBeDefined();
    expect(system.longTerm).toBeDefined();
  });

  test('should promote entries between tiers', () => {
    const entry = system.working.add({
      type: 'fact',
      content: 'Test fact',
      importance: 0.8,
    });
    
    const promoted1 = system.promoteToShortTerm(entry.id);
    expect(promoted1).toBe(true);
    expect(system.shortTerm.size()).toBe(1);
    
    const stmEntry = system.shortTerm.getAll()[0];
    const promoted2 = system.promoteToLongTerm(stmEntry.id);
    expect(promoted2).toBe(true);
    expect(system.longTerm.size()).toBe(1);
  });

  test('should search across all tiers', () => {
    system.working.add({ type: 'fact', content: 'Working memory AI', importance: 0.8 });
    system.shortTerm.add({ type: 'fact', content: 'Short-term AI memory', importance: 0.7 });
    system.longTerm.add({ type: 'fact', content: 'Long-term AI knowledge', importance: 0.9 });
    
    const results = system.search({ keywords: ['AI'] });
    
    expect(results.working.length).toBe(1);
    expect(results.shortTerm.length).toBe(1);
    expect(results.longTerm.length).toBe(1);
  });

  test('should get statistics', () => {
    system.working.add({ type: 'fact', content: 'Test 1', importance: 0.5 });
    system.shortTerm.add({ type: 'fact', content: 'Test 2', importance: 0.5 });
    system.longTerm.add({ type: 'fact', content: 'Test 3', importance: 0.5 });
    
    const stats = system.getStats();
    
    expect(stats.working).toBe(1);
    expect(stats.shortTerm).toBe(1);
    expect(stats.longTerm).toBe(1);
    expect(stats.total).toBe(3);
  });

  test('should export and import all memories', () => {
    system.working.add({ type: 'fact', content: 'W1', importance: 0.5 });
    system.shortTerm.add({ type: 'fact', content: 'S1', importance: 0.5 });
    system.longTerm.add({ type: 'fact', content: 'L1', importance: 0.5 });
    
    const exported = system.export();
    expect(exported.working.length).toBe(1);
    expect(exported.shortTerm.length).toBe(1);
    expect(exported.longTerm.length).toBe(1);
    
    const newSystem = new MemorySystem();
    newSystem.import(exported);
    
    const stats = newSystem.getStats();
    expect(stats.total).toBe(3);
  });

  test('should clear all memories', () => {
    system.working.add({ type: 'fact', content: 'Test', importance: 0.5 });
    system.shortTerm.add({ type: 'fact', content: 'Test', importance: 0.5 });
    system.longTerm.add({ type: 'fact', content: 'Test', importance: 0.5 });
    
    system.clearAll();
    
    const stats = system.getStats();
    expect(stats.total).toBe(0);
  });
});
