/**
 * Tests for EventBus
 */

import { EventBus, AgentEvent } from '../src/events';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('on/emit basic event', () => {
    test('should subscribe and emit events', async () => {
      const mockHandler = jest.fn();
      
      eventBus.on('request:received', mockHandler);
      await eventBus.emit('request:received', { test: 'data' }, 'system');

      expect(mockHandler).toHaveBeenCalledTimes(1);
      const emittedEvent = mockHandler.mock.calls[0][0];
      expect(emittedEvent).toHaveProperty('name', 'request:received');
      expect(emittedEvent).toHaveProperty('payload', { test: 'data' });
      expect(emittedEvent).toHaveProperty('source', 'system');
      expect(emittedEvent).toHaveProperty('timestamp');
    });

    test('should support multiple subscribers', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventBus.on('request:received', handler1);
      eventBus.on('request:received', handler2);
      await eventBus.emit('request:received', {}, 'system');

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    test('should not call handlers for different events', async () => {
      const handler = jest.fn();
      
      eventBus.on('request:received', handler);
      await eventBus.emit('ceo:project-created', {}, 'ceo');

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('once', () => {
    test('should fire handler only once', async () => {
      const handler = jest.fn();
      
      eventBus.once('request:received', handler);
      
      await eventBus.emit('request:received', {}, 'system');
      await eventBus.emit('request:received', {}, 'system');
      await eventBus.emit('request:received', {}, 'system');

      expect(handler).toHaveBeenCalledTimes(1);
    });

    test('should return unsubscribe function', () => {
      const handler = jest.fn();
      const unsubscribe = eventBus.once('test', handler);
      
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });
  });

  describe('unsubscribe', () => {
    test('should unsubscribe when returned function is called', async () => {
      const handler = jest.fn();
      const unsubscribe = eventBus.on('test', handler);
      
      await eventBus.emit('test', {}, 'system');
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();
      await eventBus.emit('test', {}, 'system');
      expect(handler).toHaveBeenCalledTimes(1);
    });

    test('should handle multiple unsubscribes', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      const unsub1 = eventBus.on('test', handler1);
      const unsub2 = eventBus.on('test', handler2);
      
      unsub1();
      
      await eventBus.emit('test', {}, 'system');
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('event history and filtering', () => {
    test('should store event history', async () => {
      await eventBus.emit('event1', { data: 1 }, 'system');
      await eventBus.emit('event2', { data: 2 }, 'ceo');
      
      const history = eventBus.getHistory();
      expect(history.length).toBe(2);
      expect(history[0].name).toBe('event1');
      expect(history[1].name).toBe('event2');
    });

    test('should filter history by event name', async () => {
      await eventBus.emit('event1', {}, 'system');
      await eventBus.emit('event2', {}, 'system');
      await eventBus.emit('event1', {}, 'ceo');
      
      const filtered = eventBus.getHistory({ event: 'event1' });
      expect(filtered.length).toBe(2);
      expect(filtered.every(e => e.name === 'event1')).toBe(true);
    });

    test('should filter history by source', async () => {
      await eventBus.emit('event1', {}, 'system');
      await eventBus.emit('event2', {}, 'ceo');
      await eventBus.emit('event3', {}, 'manager');
      
      const filtered = eventBus.getHistory({ source: 'ceo' });
      expect(filtered.length).toBe(1);
      expect(filtered[0].source).toBe('ceo');
    });

    test('should filter history by timestamp', async () => {
      await eventBus.emit('event1', {}, 'system');
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const since = new Date();
      await eventBus.emit('event2', {}, 'system');
      
      const filtered = eventBus.getHistory({ since });
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('event2');
    });

    test('should combine multiple filters', async () => {
      await eventBus.emit('event1', {}, 'system');
      await eventBus.emit('event1', {}, 'ceo');
      await eventBus.emit('event2', {}, 'ceo');
      
      const filtered = eventBus.getHistory({ event: 'event1', source: 'ceo' });
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('event1');
      expect(filtered[0].source).toBe('ceo');
    });
  });

  describe('clear', () => {
    test('should clear all handlers', async () => {
      const handler = jest.fn();
      eventBus.on('test', handler);
      
      eventBus.clear();
      await eventBus.emit('test', {}, 'system');
      
      expect(handler).not.toHaveBeenCalled();
    });

    test('should clear event history', async () => {
      await eventBus.emit('event1', {}, 'system');
      await eventBus.emit('event2', {}, 'system');
      
      eventBus.clear();
      
      const history = eventBus.getHistory();
      expect(history.length).toBe(0);
    });

    test('should allow new subscriptions after clear', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventBus.on('test', handler1);
      eventBus.clear();
      
      eventBus.on('test', handler2);
      await eventBus.emit('test', {}, 'system');
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('maxHistory', () => {
    test('should limit history to maxHistory size', async () => {
      const bus = new EventBus(3);
      
      for (let i = 0; i < 5; i++) {
        await bus.emit(`event${i}`, {}, 'system');
      }
      
      const history = bus.getHistory();
      expect(history.length).toBe(3);
      expect(history[0].name).toBe('event2'); // Oldest should be dropped
      expect(history[2].name).toBe('event4');
    });
  });
});
