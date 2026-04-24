/**
 * Tests for Holographic Memory System
 */

import { HolographicMemory } from '../src/holographic-memory.js';
import { LongTermMemory } from '../src/memory.js';

describe('HolographicMemory', () => {
  let holographicMemory: HolographicMemory;

  beforeEach(() => {
    holographicMemory = new HolographicMemory({
      vectorDimensions: 64,
      fragmentationRate: 0.3,
    });
  });

  describe('Storage', () => {
    it('should store a memory', () => {
      const memory = holographicMemory.store(
        'test-1',
        'AI agents use holographic memory for distributed storage',
        { type: 'fact' }
      );

      expect(memory.id).toBe('test-1');
      expect(memory.content).toBe('AI agents use holographic memory for distributed storage');
      expect(memory.vector).toBeInstanceOf(Float32Array);
      expect(memory.vector.length).toBe(64);
      expect(memory.fragments.length).toBeGreaterThan(0);
    });

    it('should create distributed fragments', () => {
      const memory = holographicMemory.store(
        'test-2',
        'Test content for fragmentation',
        {}
      );

      // Each fragment should have partial information
      expect(memory.fragments.length).toBeGreaterThan(0);
      memory.fragments.forEach((fragment) => {
        expect(fragment.memoryId).toBe('test-2');
        expect(fragment.vector).toBeInstanceOf(Float32Array);
        expect(fragment.contentHash).toBeDefined();
      });
    });

    it('should store multiple memories', () => {
      holographicMemory.store('mem-1', 'First memory', {});
      holographicMemory.store('mem-2', 'Second memory', {});
      holographicMemory.store('mem-3', 'Third memory', {});

      const stats = holographicMemory.getStats();
      expect(stats.totalMemories).toBe(3);
      expect(stats.totalFragments).toBeGreaterThan(3);
    });
  });

  describe('Query', () => {
    beforeEach(() => {
      holographicMemory.store(
        'ai-1',
        'AI agents can collaborate using role-based orchestration',
        { category: 'AI' }
      );
      holographicMemory.store(
        'ai-2',
        'Machine learning models require training data',
        { category: 'ML' }
      );
      holographicMemory.store(
        'mem-1',
        'Holographic memory uses vector embeddings',
        { category: 'memory' }
      );
      holographicMemory.store(
        'mem-2',
        'Distributed storage enables fault tolerance',
        { category: 'memory' }
      );
    });

    it('should query by semantic similarity', () => {
      const results = holographicMemory.query('AI agent collaboration', 5);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].memory.id).toBe('ai-1');
      expect(results[0].similarity).toBeGreaterThan(0);
    });

    it('should return top-K results', () => {
      const results = holographicMemory.query('memory storage', 2);
      expect(results.length).toBe(2);
    });

    it('should sort by similarity (descending)', () => {
      const results = holographicMemory.query('AI and machine learning', 4);

      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].similarity).toBeGreaterThanOrEqual(results[i + 1].similarity);
      }
    });
  });

  describe('Reconstruction', () => {
    it('should reconstruct memory from partial fragments', () => {
      const memory = holographicMemory.store(
        'reconstruct-test',
        'This is a test memory for reconstruction',
        {}
      );

      const reconstruction = holographicMemory.reconstruct('reconstruct-test', 0.7);

      expect(reconstruction.success).toBe(true);
      expect(reconstruction.accuracy).toBeGreaterThan(0);
      expect(reconstruction.reconstructedContent).toBe(memory.content);
      expect(reconstruction.usedFragments).toBeLessThan(reconstruction.totalFragments);
    });

    it('should fail reconstruction for non-existent memory', () => {
      const reconstruction = holographicMemory.reconstruct('non-existent', 0.7);

      expect(reconstruction.success).toBe(false);
      expect(reconstruction.accuracy).toBe(0);
    });
  });

  describe('Management', () => {
    it('should get memory by ID', () => {
      holographicMemory.store('get-test', 'Test content', {});
      const memory = holographicMemory.get('get-test');

      expect(memory).toBeDefined();
      expect(memory?.id).toBe('get-test');
    });

    it('should remove memory', () => {
      holographicMemory.store('remove-test', 'Test content', {});
      const removed = holographicMemory.remove('remove-test');

      expect(removed).toBe(true);
      expect(holographicMemory.get('remove-test')).toBeUndefined();
    });

    it('should clear all memories', () => {
      holographicMemory.store('clear-1', 'Content 1', {});
      holographicMemory.store('clear-2', 'Content 2', {});

      holographicMemory.clear();

      const stats = holographicMemory.getStats();
      expect(stats.totalMemories).toBe(0);
      expect(stats.totalFragments).toBe(0);
    });

    it('should export and import', () => {
      holographicMemory.store('export-1', 'Content 1', { tag: 'test' });
      holographicMemory.store('export-2', 'Content 2', { tag: 'test' });

      const exported = holographicMemory.export();

      const newMemory = new HolographicMemory();
      newMemory.import(exported);

      const stats = newMemory.getStats();
      expect(stats.totalMemories).toBe(2);
    });
  });

  describe('Statistics', () => {
    it('should return correct statistics', () => {
      holographicMemory.store('stat-1', 'Content 1', {});
      holographicMemory.store('stat-2', 'Content 2', {});

      const stats = holographicMemory.getStats();

      expect(stats.totalMemories).toBe(2);
      expect(stats.totalFragments).toBeGreaterThan(0);
      expect(stats.averageFragmentsPerMemory).toBeGreaterThan(0);
      expect(stats.vectorDimensions).toBe(64);
      expect(stats.fragmentationRate).toBe(0.3);
    });
  });
});

describe('LongTermMemory with Holographic Storage', () => {
  let longTermMemory: LongTermMemory;

  beforeEach(() => {
    longTermMemory = new LongTermMemory({ persistenceEnabled: false });
  });

  describe('Holographic Query', () => {
    beforeEach(() => {
      longTermMemory.add({
        type: 'fact',
        content: 'AI agents use role-based orchestration for collaboration',
        importance: 0.8,
      });
      longTermMemory.add({
        type: 'fact',
        content: 'Machine learning models need training data',
        importance: 0.7,
      });
      longTermMemory.add({
        type: 'task',
        content: 'Implement holographic memory system',
        importance: 0.9,
      });
    });

    it('should query using holographic semantic search', () => {
      const results = longTermMemory.query({
        keywords: ['AI', 'collaboration'],
        limit: 5,
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].content).toContain('AI agents');
      expect(results[0].similarity).toBeDefined();
      expect(results[0].similarity).toBeGreaterThan(0);
    });

    it('should combine holographic search with type filter', () => {
      const results = longTermMemory.query({
        type: 'task',
        keywords: ['memory'],
        limit: 5,
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].type).toBe('task');
      expect(results[0].content).toContain('memory');
    });

    it('should fall back to traditional query without keywords', () => {
      const results = longTermMemory.query({
        type: 'fact',
        minImportance: 0.75,
      });

      expect(results.length).toBeGreaterThan(0);
      // Traditional query doesn't add similarity score
      expect(results[0].similarity).toBeUndefined();
    });
  });

  describe('Reconstruction', () => {
    it('should reconstruct memory from fragments', () => {
      const entry = longTermMemory.add({
        type: 'fact',
        content: 'Holographic memory enables partial reconstruction',
        importance: 0.8,
      });

      const reconstruction = longTermMemory.reconstruct(entry.id, 0.7);

      expect(reconstruction.success).toBe(true);
      expect(reconstruction.accuracy).toBeGreaterThan(0);
      expect(reconstruction.entry?.content).toBe(entry.content);
    });
  });

  describe('Holographic Stats', () => {
    it('should return holographic memory statistics', () => {
      longTermMemory.add({
        type: 'fact',
        content: 'Test fact 1',
        importance: 0.5,
      });
      longTermMemory.add({
        type: 'fact',
        content: 'Test fact 2',
        importance: 0.5,
      });

      const stats = longTermMemory.getHolographicStats();

      expect(stats.totalMemories).toBe(2);
      expect(stats.totalFragments).toBeGreaterThan(0);
      expect(stats.vectorDimensions).toBe(128);
    });
  });

  describe('Backward Compatibility', () => {
    it('should support traditional operations', () => {
      const entry = longTermMemory.add({
        type: 'decision',
        content: 'Use holographic memory for semantic search',
        importance: 0.9,
      });

      expect(entry.id).toBeDefined();
      expect(entry.type).toBe('decision');
      expect(entry.content).toContain('holographic');

      // Traditional query without keywords
      const results = longTermMemory.query({ type: 'decision' });
      expect(results.length).toBe(1);
      expect(results[0].id).toBe(entry.id);
    });

    it('should export and import with holographic data', () => {
      longTermMemory.add({
        type: 'fact',
        content: 'Export test fact',
        importance: 0.7,
      });

      const exported = longTermMemory.export();

      const newMemory = new LongTermMemory({ persistenceEnabled: false });
      newMemory.import(exported);

      const results = newMemory.query({
        keywords: ['export'],
        limit: 5,
      });

      expect(results.length).toBe(1);
      expect(results[0].content).toContain('Export');
    });
  });
});
