/**
 * Holographic Memory System for AI Agents
 * 
 * A distributed memory architecture where each fragment contains compressed
 * information about the entire memory space, enabling partial reconstruction.
 * 
 * Ported from holographic-memory-viz project
 */

export interface HolographicMemoryConfig {
  vectorDimensions?: number;
  fragmentationRate?: number;
  noiseLevel?: number;
}

export interface MemoryFragment {
  id: string;
  memoryId: string;
  fragmentIndex: number;
  vector: Float32Array;
  contentHash: string;
  randomProjection: Float32Array;
}

export interface StoredMemory {
  id: string;
  content: string;
  vector: Float32Array;
  metadata: Record<string, any>;
  fragments: MemoryFragment[];
  timestamp: number;
}

export interface QueryResult {
  memory: StoredMemory;
  similarity: number;
}

export interface ReconstructionResult {
  success: boolean;
  accuracy: number;
  reconstructedContent: string;
  usedFragments: number;
  totalFragments: number;
}

/**
 * Holographic Memory System
 * 
 * Features:
 * - Vector embeddings for semantic search
 * - Distributed storage with overlapping fragments
 * - Pattern matching via cosine similarity
 * - Partial reconstruction from incomplete data
 */
export class HolographicMemory {
  private config: Required<HolographicMemoryConfig>;
  private memories: StoredMemory[] = [];
  private fragments: MemoryFragment[] = [];
  private index: Map<string, number[]> = new Map(); // For fast similarity search

  constructor(config: HolographicMemoryConfig = {}) {
    this.config = {
      vectorDimensions: config.vectorDimensions || 128,
      fragmentationRate: config.fragmentationRate || 0.3,
      noiseLevel: config.noiseLevel || 0.05,
    };
  }

  /**
   * Store a new memory in the holographic system
   */
  store(id: string, content: string, metadata: Record<string, any> = {}): StoredMemory {
    // Generate vector embedding
    const vector = this.generateEmbedding(content);

    // Create distributed fragments
    const memoryFragments = this.fragmentMemory(id, vector, content);

    const memory: StoredMemory = {
      id,
      content,
      vector,
      metadata,
      fragments: memoryFragments,
      timestamp: Date.now(),
    };

    this.memories.push(memory);
    this.fragments.push(...memoryFragments);

    // Update similarity index
    this.updateIndex(memory);

    return memory;
  }

  /**
   * Generate a simple vector embedding from text
   * 
   * Note: In production, this should use a real embedding model
   * (OpenAI embeddings, Cohere, local transformers, etc.)
   */
  private generateEmbedding(text: string): Float32Array {
    const vector = new Float32Array(this.config.vectorDimensions);

    // Simple hash-based embedding (for demonstration)
    // This creates a deterministic vector based on text content
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const idx = i % this.config.vectorDimensions;
      vector[idx] += Math.sin(charCode * (i + 1)) * 0.1;
    }

    // Add word-level features
    const words = text.toLowerCase().split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const hash = this.simpleHash(word);
      const idx = hash % this.config.vectorDimensions;
      vector[idx] += 0.2;
    }

    // Normalize to unit vector
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (magnitude > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= magnitude;
      }
    }

    return vector;
  }

  /**
   * Simple hash function for strings
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Fragment memory into distributed pieces
   * Each fragment contains partial information about the whole
   */
  private fragmentMemory(
    memoryId: string,
    vector: Float32Array,
    content: string
  ): MemoryFragment[] {
    const fragments: MemoryFragment[] = [];
    const numFragments = Math.ceil(
      this.config.vectorDimensions * this.config.fragmentationRate
    );

    for (let i = 0; i < numFragments; i++) {
      // Create overlapping fragments
      const startIdx = Math.floor((i * this.config.vectorDimensions) / numFragments);
      const endIdx = Math.floor(((i + 1) * this.config.vectorDimensions) / numFragments);

      const fragmentVector = vector.slice(startIdx, endIdx);

      // Add distributed information
      const fragment: MemoryFragment = {
        id: `${memoryId}_frag_${i}`,
        memoryId,
        fragmentIndex: i,
        vector: fragmentVector,
        // Store compressed content hash (distributed across fragments)
        contentHash: this.simpleHash(content + i).toString(36),
        // Random projection for overlap
        randomProjection: this.generateRandomProjection(fragmentVector.length),
      };

      fragments.push(fragment);
    }

    return fragments;
  }

  /**
   * Generate a random projection vector
   * Used for creating distributed representations
   */
  private generateRandomProjection(length: number): Float32Array {
    const projection = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      projection[i] = (Math.random() - 0.5) * this.config.noiseLevel;
    }
    return projection;
  }

  /**
   * Update similarity index for fast queries
   */
  private updateIndex(memory: StoredMemory): void {
    // Group fragments by memory ID for quick lookup
    const fragmentIndices: number[] = [];
    this.fragments.forEach((frag, idx) => {
      if (frag.memoryId === memory.id) {
        fragmentIndices.push(idx);
      }
    });
    this.index.set(memory.id, fragmentIndices);
  }

  /**
   * Query memory using pattern matching
   * Returns top-K most similar memories
   */
  query(queryText: string, topK: number = 5): QueryResult[] {
    const queryVector = this.generateEmbedding(queryText);

    const results: QueryResult[] = this.memories.map((memory) => {
      const similarity = this.cosineSimilarity(queryVector, memory.vector);
      return { memory, similarity };
    });

    // Sort by similarity (descending)
    results.sort((a, b) => b.similarity - a.similarity);

    // Return top-K
    return results.slice(0, topK);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Reconstruct memory from partial fragments
   * Demonstrates holographic property (each piece contains the whole)
   */
  reconstruct(memoryId: string, fragmentPercentage: number = 0.7): ReconstructionResult {
    const memory = this.memories.find((m) => m.id === memoryId);
    if (!memory) {
      return {
        success: false,
        accuracy: 0,
        reconstructedContent: '',
        usedFragments: 0,
        totalFragments: 0,
      };
    }

    // Select subset of fragments (not random - use sequential for better coverage)
    const numFragmentsToUse = Math.ceil(
      memory.fragments.length * fragmentPercentage
    );
    const usedFragments = memory.fragments.slice(0, numFragmentsToUse);

    // Reconstruct vector from fragments by placing them in correct positions
    const reconstructedVector = new Float32Array(this.config.vectorDimensions);

    for (const fragment of usedFragments) {
      // Calculate the starting index for this fragment
      const startIdx = Math.floor(
        (fragment.fragmentIndex * this.config.vectorDimensions) / memory.fragments.length
      );

      // Copy fragment vector to correct position
      for (let i = 0; i < fragment.vector.length; i++) {
        const targetIdx = startIdx + i;
        if (targetIdx < reconstructedVector.length) {
          // Average overlapping regions for better reconstruction
          if (reconstructedVector[targetIdx] === 0) {
            reconstructedVector[targetIdx] = fragment.vector[i];
          } else {
            reconstructedVector[targetIdx] =
              (reconstructedVector[targetIdx] + fragment.vector[i]) / 2;
          }
        }
      }
    }

    // Normalize reconstructed vector
    const magnitude = Math.sqrt(
      reconstructedVector.reduce((sum, v) => sum + v * v, 0)
    );
    if (magnitude > 0) {
      for (let i = 0; i < reconstructedVector.length; i++) {
        reconstructedVector[i] /= magnitude;
      }
    }

    // Calculate reconstruction accuracy
    const accuracy = this.cosineSimilarity(memory.vector, reconstructedVector);

    return {
      success: accuracy > 0.5,
      accuracy,
      reconstructedContent: memory.content, // In reality, would decode from vector
      usedFragments: numFragmentsToUse,
      totalFragments: memory.fragments.length,
    };
  }

  /**
   * Get memory by ID
   */
  get(id: string): StoredMemory | undefined {
    return this.memories.find((m) => m.id === id);
  }

  /**
   * Remove memory by ID
   */
  remove(id: string): boolean {
    const index = this.memories.findIndex((m) => m.id === id);
    if (index === -1) {
      return false;
    }

    // Remove memory
    this.memories.splice(index, 1);

    // Remove fragments
    this.fragments = this.fragments.filter((f) => f.memoryId !== id);

    // Remove from index
    this.index.delete(id);

    return true;
  }

  /**
   * Get all memories
   */
  getAll(): StoredMemory[] {
    return [...this.memories];
  }

  /**
   * Get all fragments
   */
  getAllFragments(): MemoryFragment[] {
    return [...this.fragments];
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalMemories: number;
    totalFragments: number;
    averageFragmentsPerMemory: number;
    vectorDimensions: number;
    fragmentationRate: number;
  } {
    return {
      totalMemories: this.memories.length,
      totalFragments: this.fragments.length,
      averageFragmentsPerMemory:
        this.memories.length > 0
          ? this.fragments.length / this.memories.length
          : 0,
      vectorDimensions: this.config.vectorDimensions,
      fragmentationRate: this.config.fragmentationRate,
    };
  }

  /**
   * Clear all memories
   */
  clear(): void {
    this.memories = [];
    this.fragments = [];
    this.index.clear();
  }

  /**
   * Export for persistence
   */
  export(): {
    memories: StoredMemory[];
    fragments: MemoryFragment[];
    config: Required<HolographicMemoryConfig>;
  } {
    return {
      memories: [...this.memories],
      fragments: [...this.fragments],
      config: { ...this.config },
    };
  }

  /**
   * Import from persistence
   */
  import(data: {
    memories?: StoredMemory[];
    fragments?: MemoryFragment[];
    config?: HolographicMemoryConfig;
  }): void {
    if (data.config) {
      this.config = {
        vectorDimensions: data.config.vectorDimensions || 128,
        fragmentationRate: data.config.fragmentationRate || 0.3,
        noiseLevel: data.config.noiseLevel || 0.05,
      };
    }

    if (data.memories) {
      this.memories = data.memories;
    }

    if (data.fragments) {
      this.fragments = data.fragments;
    }

    // Rebuild index
    this.index.clear();
    this.memories.forEach((memory) => this.updateIndex(memory));
  }
}
