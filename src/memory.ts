/**
 * Memory System for AI Agents
 * 
 * Implements a three-tier memory architecture:
 * - Working Memory: Current task context (limited capacity)
 * - Short-term Memory: Recent interactions (session-based)
 * - Long-term Memory: Persistent knowledge with holographic storage (vector embeddings + pattern matching)
 */

import { HolographicMemory } from './holographic-memory.js';

export interface MemoryEntry {
  id: string;
  type: 'fact' | 'task' | 'decision' | 'context' | 'feedback';
  content: string;
  importance: number; // 0-1, higher = more important
  timestamp: Date;
  expiresAt?: Date; // Optional expiration for short-term memory
  metadata?: Record<string, any>;
  embedding?: number[]; // Vector embedding for semantic search
  similarity?: number; // Similarity score from holographic query
}

export interface MemoryQuery {
  type?: MemoryEntry['type'];
  minImportance?: number;
  limit?: number;
  timeRange?: {
    start: Date;
    end: Date;
  };
  keywords?: string[];
}

export interface WorkingMemoryConfig {
  capacity: number; // Max entries
}

export interface ShortTermMemoryConfig {
  maxAgeMs: number; // Time before expiration
  maxEntries: number; // Max entries before pruning
}

export interface LongTermMemoryConfig {
  persistenceEnabled: boolean;
  storagePath?: string; // For file-based persistence
}

/**
 * Working Memory - Current task context
 * Limited capacity, high relevance
 */
export class WorkingMemory {
  private entries: MemoryEntry[] = [];
  private capacity: number;

  constructor(config: WorkingMemoryConfig = { capacity: 5 }) {
    this.capacity = config.capacity;
  }

  /**
   * Add entry to working memory
   * Evicts least important entries if at capacity
   */
  add(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): MemoryEntry {
    const newEntry: MemoryEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
    };

    this.entries.push(newEntry);

    // Evict if at capacity
    if (this.entries.length > this.capacity) {
      this.evictLeastImportant();
    }

    return newEntry;
  }

  /**
   * Get all entries in working memory
   */
  getAll(): MemoryEntry[] {
    return [...this.entries].sort((a, b) => b.importance - a.importance);
  }

  /**
   * Query working memory
   */
  query(query: MemoryQuery): MemoryEntry[] {
    let results = this.entries;

    if (query.type) {
      results = results.filter(e => e.type === query.type);
    }

    if (query.minImportance !== undefined) {
      results = results.filter(e => e.importance >= query.minImportance!);
    }

    if (query.keywords && query.keywords.length > 0) {
      results = results.filter(e => 
        query.keywords!.some(kw => 
          e.content.toLowerCase().includes(kw.toLowerCase())
        )
      );
    }

    results.sort((a, b) => b.importance - a.importance);

    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  /**
   * Clear working memory
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * Get current size
   */
  size(): number {
    return this.entries.length;
  }

  private evictLeastImportant(): void {
    this.entries.sort((a, b) => b.importance - a.importance);
    this.entries = this.entries.slice(0, this.capacity);
  }

  private generateId(): string {
    return `wm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Short-term Memory - Recent interactions
 * Time-based expiration, moderate capacity
 */
export class ShortTermMemory {
  private entries: MemoryEntry[] = [];
  private maxAgeMs: number;
  private maxEntries: number;

  constructor(config: ShortTermMemoryConfig = { maxAgeMs: 3600000, maxEntries: 50 }) {
    this.maxAgeMs = config.maxAgeMs;
    this.maxEntries = config.maxEntries;
  }

  /**
   * Add entry to short-term memory
   */
  add(entry: Omit<MemoryEntry, 'id' | 'timestamp' | 'expiresAt'>): MemoryEntry {
    const now = new Date();
    const newEntry: MemoryEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: now,
      expiresAt: new Date(now.getTime() + this.maxAgeMs),
    };

    this.entries.push(newEntry);
    this.prune();

    return newEntry;
  }

  /**
   * Get all non-expired entries
   */
  getAll(): MemoryEntry[] {
    this.cleanup();
    return [...this.entries].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Query short-term memory
   */
  query(query: MemoryQuery): MemoryEntry[] {
    this.cleanup();
    let results = this.entries;

    if (query.type) {
      results = results.filter(e => e.type === query.type);
    }

    if (query.minImportance !== undefined) {
      results = results.filter(e => e.importance >= query.minImportance!);
    }

    if (query.timeRange) {
      results = results.filter(e => 
        e.timestamp >= query.timeRange!.start && 
        e.timestamp <= query.timeRange!.end
      );
    }

    if (query.keywords && query.keywords.length > 0) {
      results = results.filter(e => 
        query.keywords!.some(kw => 
          e.content.toLowerCase().includes(kw.toLowerCase())
        )
      );
    }

    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  /**
   * Clear short-term memory
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * Get current size
   */
  size(): number {
    this.cleanup();
    return this.entries.length;
  }

  /**
   * Export for persistence
   */
  export(): MemoryEntry[] {
    this.cleanup();
    return [...this.entries];
  }

  /**
   * Import from persistence
   */
  import(entries: MemoryEntry[]): void {
    this.entries = entries;
    this.cleanup();
  }

  private cleanup(): void {
    const now = new Date();
    this.entries = this.entries.filter(e => !e.expiresAt || e.expiresAt > now);
  }

  private prune(): void {
    this.cleanup();
    if (this.entries.length > this.maxEntries) {
      this.entries.sort((a, b) => b.importance - a.importance);
      this.entries = this.entries.slice(0, this.maxEntries);
    }
  }

  private generateId(): string {
    return `stm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Long-term Memory - Persistent knowledge with Holographic Storage
 * 
 * Features:
 * - Vector embeddings for semantic search
 * - Pattern matching via cosine similarity
 * - Distributed storage with overlapping fragments
 * - Partial reconstruction from incomplete data
 */
export class LongTermMemory {
  private holographicMemory: HolographicMemory;
  private entries: MemoryEntry[] = [];
  private persistenceEnabled: boolean;
  private storagePath?: string;

  constructor(config: LongTermMemoryConfig = { persistenceEnabled: false }) {
    this.persistenceEnabled = config.persistenceEnabled;
    this.storagePath = config.storagePath;
    this.holographicMemory = new HolographicMemory({
      vectorDimensions: 128,
      fragmentationRate: 0.3,
    });
  }

  /**
   * Add entry to long-term memory with holographic storage
   */
  add(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): MemoryEntry {
    const newEntry: MemoryEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
    };

    // Check for duplicates
    const isDuplicate = this.entries.some(
      (e) => e.content === newEntry.content && e.type === newEntry.type
    );

    if (!isDuplicate) {
      // Store in traditional list for backwards compatibility
      this.entries.push(newEntry);

      // Store in holographic memory for semantic search
      this.holographicMemory.store(newEntry.id, newEntry.content, {
        type: newEntry.type,
        importance: newEntry.importance,
        metadata: newEntry.metadata,
      });

      this.persist();
    }

    return newEntry;
  }

  /**
   * Get all entries
   */
  getAll(): MemoryEntry[] {
    return [...this.entries].sort((a, b) => b.importance - a.importance);
  }

  /**
   * Query long-term memory using holographic pattern matching
   * 
   * If keywords are provided, uses holographic semantic search
   * Otherwise, uses traditional filtering
   */
  query(query: MemoryQuery): MemoryEntry[] {
    // Use holographic search if keywords provided
    if (query.keywords && query.keywords.length > 0) {
      return this.holographicQuery(query);
    }

    // Traditional query for other filters
    let results = this.entries;

    if (query.type) {
      results = results.filter((e) => e.type === query.type);
    }

    if (query.minImportance !== undefined) {
      results = results.filter((e) => e.importance >= query.minImportance!);
    }

    if (query.timeRange) {
      results = results.filter(
        (e) =>
          e.timestamp >= query.timeRange!.start &&
          e.timestamp <= query.timeRange!.end
      );
    }

    results.sort((a, b) => b.importance - a.importance);

    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  /**
   * Holographic semantic search using pattern matching
   */
  private holographicQuery(query: MemoryQuery): MemoryEntry[] {
    // Combine keywords into query string
    const queryString = query.keywords!.join(' ');

    // Use holographic memory for semantic search
    const topK = query.limit || 10;
    const holographicResults = this.holographicMemory.query(queryString, topK);

    // Convert holographic results to MemoryEntry
    const results: MemoryEntry[] = holographicResults
      .map((result) => {
        const entry = this.entries.find((e) => e.id === result.memory.id);
        if (!entry) return null;

        // Apply additional filters
        if (query.type && entry.type !== query.type) return null;
        if (query.minImportance !== undefined && entry.importance < query.minImportance) {
          return null;
        }
        if (query.timeRange) {
          if (entry.timestamp < query.timeRange.start || entry.timestamp > query.timeRange.end) {
            return null;
          }
        }

        // Add similarity score to entry
        const enrichedEntry: MemoryEntry = {
          ...entry,
          similarity: result.similarity,
        };
        return enrichedEntry;
      })
      .filter((e): e is MemoryEntry => e !== null);

    // Sort by similarity (if available) or importance
    results.sort((a, b) => {
      if (a.similarity !== undefined && b.similarity !== undefined) {
        return b.similarity - a.similarity;
      }
      return b.importance - a.importance;
    });

    return results.slice(0, query.limit || results.length);
  }

  /**
   * Reconstruct memory from partial fragments
   * Demonstrates holographic property (each piece contains the whole)
   */
  reconstruct(entryId: string, fragmentPercentage: number = 0.7): {
    success: boolean;
    accuracy: number;
    entry: MemoryEntry | null;
  } {
    const entry = this.entries.find((e) => e.id === entryId);
    if (!entry) {
      return {
        success: false,
        accuracy: 0,
        entry: null,
      };
    }

    const reconstruction = this.holographicMemory.reconstruct(
      entryId,
      fragmentPercentage
    );

    return {
      success: reconstruction.success,
      accuracy: reconstruction.accuracy,
      entry,
    };
  }

  /**
   * Get holographic memory statistics
   */
  getHolographicStats(): {
    totalMemories: number;
    totalFragments: number;
    averageFragmentsPerMemory: number;
    vectorDimensions: number;
    fragmentationRate: number;
  } {
    return this.holographicMemory.getStats();
  }

  /**
   * Update entry importance
   */
  updateImportance(id: string, importance: number): boolean {
    const entry = this.entries.find((e) => e.id === id);
    if (entry) {
      entry.importance = Math.max(0, Math.min(1, importance));
      this.persist();
      return true;
    }
    return false;
  }

  /**
   * Remove entry
   */
  remove(id: string): boolean {
    const index = this.entries.findIndex((e) => e.id === id);
    if (index !== -1) {
      this.entries.splice(index, 1);
      this.holographicMemory.remove(id);
      this.persist();
      return true;
    }
    return false;
  }

  /**
   * Clear long-term memory
   */
  clear(): void {
    this.entries = [];
    this.holographicMemory.clear();
    this.persist();
  }

  /**
   * Get current size
   */
  size(): number {
    return this.entries.length;
  }

  /**
   * Export for persistence
   */
  export(): MemoryEntry[] {
    return [...this.entries];
  }

  /**
   * Import from persistence
   */
  import(entries: MemoryEntry[]): void {
    this.entries = entries;
    // Rebuild holographic memory from entries
    this.holographicMemory.clear();
    entries.forEach((entry) => {
      this.holographicMemory.store(entry.id, entry.content, {
        type: entry.type,
        importance: entry.importance,
        metadata: entry.metadata,
      });
    });
  }

  private persist(): void {
    if (this.persistenceEnabled && this.storagePath) {
      // Future: implement file-based persistence
      // For now, just log
      console.log(
        `[LongTermMemory] Would persist ${this.entries.length} entries to ${this.storagePath}`
      );
    }
  }

  private generateId(): string {
    return `ltm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Unified Memory System
 * Combines all three tiers
 */
export class MemorySystem {
  working: WorkingMemory;
  shortTerm: ShortTermMemory;
  longTerm: LongTermMemory;

  constructor(config?: {
    working?: WorkingMemoryConfig;
    shortTerm?: ShortTermMemoryConfig;
    longTerm?: LongTermMemoryConfig;
  }) {
    this.working = new WorkingMemory(config?.working);
    this.shortTerm = new ShortTermMemory(config?.shortTerm);
    this.longTerm = new LongTermMemory(config?.longTerm);
  }

  /**
   * Promote entry from working to short-term memory
   */
  promoteToShortTerm(entryId: string): boolean {
    const entry = this.working.getAll().find(e => e.id === entryId);
    if (entry) {
      this.shortTerm.add({
        type: entry.type,
        content: entry.content,
        importance: entry.importance,
        metadata: entry.metadata,
      });
      return true;
    }
    return false;
  }

  /**
   * Promote entry from short-term to long-term memory
   */
  promoteToLongTerm(entryId: string): boolean {
    const entry = this.shortTerm.getAll().find(e => e.id === entryId);
    if (entry) {
      this.longTerm.add({
        type: entry.type,
        content: entry.content,
        importance: entry.importance,
        metadata: entry.metadata,
      });
      return true;
    }
    return false;
  }

  /**
   * Search across all memory tiers
   */
  search(query: MemoryQuery): {
    working: MemoryEntry[];
    shortTerm: MemoryEntry[];
    longTerm: MemoryEntry[];
  } {
    return {
      working: this.working.query(query),
      shortTerm: this.shortTerm.query(query),
      longTerm: this.longTerm.query(query),
    };
  }

  /**
   * Get statistics
   */
  getStats(): {
    working: number;
    shortTerm: number;
    longTerm: number;
    total: number;
  } {
    return {
      working: this.working.size(),
      shortTerm: this.shortTerm.size(),
      longTerm: this.longTerm.size(),
      total: this.working.size() + this.shortTerm.size() + this.longTerm.size(),
    };
  }

  /**
   * Clear all memories
   */
  clearAll(): void {
    this.working.clear();
    this.shortTerm.clear();
    this.longTerm.clear();
  }

  /**
   * Export all memories
   */
  export(): {
    working: MemoryEntry[];
    shortTerm: MemoryEntry[];
    longTerm: MemoryEntry[];
  } {
    return {
      working: this.working.getAll(),
      shortTerm: this.shortTerm.export(),
      longTerm: this.longTerm.export(),
    };
  }

  /**
   * Import memories
   */
  import(data: {
    working?: MemoryEntry[];
    shortTerm?: MemoryEntry[];
    longTerm?: MemoryEntry[];
  }): void {
    if (data.working) {
      data.working.forEach(e => this.working.add(e));
    }
    if (data.shortTerm) {
      this.shortTerm.import(data.shortTerm);
    }
    if (data.longTerm) {
      this.longTerm.import(data.longTerm);
    }
  }
}
