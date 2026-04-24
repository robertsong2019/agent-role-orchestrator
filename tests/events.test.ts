import { EventBus, EventName, AgentEvent } from '../src/events.js';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  test('should emit and receive events', async () => {
    const received: AgentEvent[] = [];
    bus.on('worker:task-completed', (e) => { received.push(e); });

    await bus.emit('worker:task-completed', { taskId: '1' }, 'worker');

    expect(received).toHaveLength(1);
    expect(received[0].payload).toEqual({ taskId: '1' });
    expect(received[0].source).toBe('worker');
  });

  test('should support multiple handlers', async () => {
    let count = 0;
    bus.on('ceo:project-created', () => { count++; });
    bus.on('ceo:project-created', () => { count++; });

    await bus.emit('ceo:project-created', {}, 'ceo');
    expect(count).toBe(2);
  });

  test('should support unsubscribe', async () => {
    let count = 0;
    const unsub = bus.on('manager:tasks-decomposed', () => { count++; });

    await bus.emit('manager:tasks-decomposed', {}, 'manager');
    expect(count).toBe(1);

    unsub();
    await bus.emit('manager:tasks-decomposed', {}, 'manager');
    expect(count).toBe(1);
  });

  test('should support once', async () => {
    let count = 0;
    bus.once('worker:task-started', () => { count++; });

    await bus.emit('worker:task-started', {}, 'worker');
    await bus.emit('worker:task-started', {}, 'worker');

    expect(count).toBe(1);
  });

  test('should store event history', async () => {
    await bus.emit('orchestrator:started', {}, 'system');
    await bus.emit('ceo:project-created', { name: 'test' }, 'ceo');

    const history = bus.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].name).toBe('orchestrator:started');
    expect(history[1].payload.name).toBe('test');
  });

  test('should filter event history', async () => {
    await bus.emit('worker:task-completed', { id: '1' }, 'worker');
    await bus.emit('ceo:project-created', {}, 'ceo');
    await bus.emit('worker:task-completed', { id: '2' }, 'worker');

    const workerEvents = bus.getHistory({ source: 'worker' });
    expect(workerEvents).toHaveLength(2);

    const completedEvents = bus.getHistory({ event: 'worker:task-completed' });
    expect(completedEvents).toHaveLength(2);
  });

  test('should handle errors in handlers gracefully', async () => {
    bus.on('system:error', () => { throw new Error('boom'); });
    let otherCalled = false;
    bus.on('system:error', () => { otherCalled = true; });

    await bus.emit('system:error', {}, 'system');
    expect(otherCalled).toBe(true);
  });

  test('should clear all handlers and history', async () => {
    bus.on('orchestrator:started', () => {});
    await bus.emit('orchestrator:started', {}, 'system');

    bus.clear();
    expect(bus.getHistory()).toHaveLength(0);
  });

  test('should limit history size', async () => {
    const smallBus = new EventBus(5);
    for (let i = 0; i < 10; i++) {
      await smallBus.emit('orchestrator:started', { i }, 'system');
    }
    expect(smallBus.getHistory()).toHaveLength(5);
    expect(smallBus.getHistory()[0].payload.i).toBe(5);
  });
});
