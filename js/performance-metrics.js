// KNUT XMD — Optional Performance Metrics
export class Metrics {
  constructor({ maxSamples = 1000 } = {}) {
    this.maxSamples = maxSamples;
    this.commands = new Map();
    this.events = [];
  }

  observe(name, durationMs, ok = true) {
    const key = String(name || 'unknown');
    const item = this.commands.get(key) || { calls: 0, success: 0, errors: 0, totalMs: 0, maxMs: 0 };
    item.calls += 1;
    item.success += ok ? 1 : 0;
    item.errors += ok ? 0 : 1;
    item.totalMs += Math.max(0, Number(durationMs) || 0);
    item.maxMs = Math.max(item.maxMs, Number(durationMs) || 0);
    this.commands.set(key, item);
  }

  event(type, data = {}) {
    this.events.push({ type: String(type), at: Date.now(), data: { ...data } });
    if (this.events.length > this.maxSamples) this.events.splice(0, this.events.length - this.maxSamples);
  }

  wrap(name, fn) {
    return async (...args) => {
      const started = Date.now();
      try {
        const result = await fn(...args);
        this.observe(name, Date.now() - started, true);
        return result;
      } catch (error) {
        this.observe(name, Date.now() - started, false);
        throw error;
      }
    };
  }

  snapshot() {
    const commands = Object.fromEntries([...this.commands].map(([name, item]) => [name, {
      ...item,
      averageMs: item.calls ? Math.round(item.totalMs / item.calls) : 0
    }]));
    return { commands, recentEvents: this.events.slice(-50) };
  }
}
