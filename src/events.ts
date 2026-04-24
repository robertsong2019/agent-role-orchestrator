/**
 * Event Bus - Decoupled communication between agents
 * 
 * Replaces direct method calls with pub/sub pattern.
 * Agents communicate through events without knowing about each other.
 */

import { AgentRole, Task, Project, Message } from './types.js';

export type EventName = string;

export interface AgentEvent {
  name: EventName;
  payload: any;
  timestamp: Date;
  source: AgentRole | 'system';
}

export type EventHandler = (event: AgentEvent) => void | Promise<void>;

export class EventBus {
  private handlers: Map<EventName, Set<EventHandler>> = new Map();
  private history: AgentEvent[] = [];
  private maxHistory: number;

  constructor(maxHistory: number = 1000) {
    this.maxHistory = maxHistory;
  }

  /**
   * Subscribe to an event
   */
  on(event: EventName, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  /**
   * Subscribe to an event once
   */
  once(event: EventName, handler: EventHandler): () => void {
    const wrapper: EventHandler = async (e) => {
      unsub();
      await handler(e);
    };
    const unsub = this.on(event, wrapper);
    return unsub;
  }

  /**
   * Emit an event to all subscribers
   */
  async emit(event: EventName, payload: any, source: AgentRole | 'system' = 'system'): Promise<void> {
    const agentEvent: AgentEvent = {
      name: event,
      payload,
      timestamp: new Date(),
      source,
    };

    // Store in history
    this.history.push(agentEvent);
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }

    // Notify all handlers
    const handlers = this.handlers.get(event);
    if (handlers) {
      const promises = Array.from(handlers).map(handler => {
        try {
          return Promise.resolve(handler(agentEvent)).catch(err => {
            console.error(`[EventBus] Error in handler for ${event}:`, err);
          });
        } catch (err) {
          console.error(`[EventBus] Error in handler for ${event}:`, err);
          return Promise.resolve();
        }
      });
      await Promise.all(promises);
    }
  }

  /**
   * Get event history
   */
  getHistory(filter?: { event?: EventName; since?: Date; source?: string }): AgentEvent[] {
    let results = this.history;
    if (filter?.event) results = results.filter(e => e.name === filter.event);
    if (filter?.since) results = results.filter(e => e.timestamp >= filter.since!);
    if (filter?.source) results = results.filter(e => e.source === filter.source);
    return results;
  }

  /**
   * Remove all handlers
   */
  clear(): void {
    this.handlers.clear();
    this.history = [];
  }
}
