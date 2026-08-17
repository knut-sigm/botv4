// KNUT XMD — Session Health
const states = new Map();

export function getSessionHealth(id) {
  if (!states.has(id)) states.set(id, {
    id,
    status: 'starting',
    connectedAt: null,
    lastEventAt: Date.now(),
    lastHeartbeatAt: null,
    reconnects: 0,
    commandErrors: 0,
    apiErrors: 0,
    lastError: null
  });
  return states.get(id);
}

export function updateSessionHealth(id, patch = {}) {
  const state = getSessionHealth(id);
  Object.assign(state, patch, { lastEventAt: Date.now() });
  return { ...state };
}

export function markConnected(id) {
  return updateSessionHealth(id, { status: 'connected', connectedAt: Date.now(), lastHeartbeatAt: Date.now(), lastError: null });
}

export function markDisconnected(id, reason) {
  return updateSessionHealth(id, { status: 'reconnecting', lastError: String(reason || 'connection_closed').slice(0, 240) });
}

export function markReconnect(id) {
  const state = getSessionHealth(id);
  state.reconnects += 1;
  return updateSessionHealth(id, { status: 'reconnecting' });
}

export function markCommandError(id, error) {
  const state = getSessionHealth(id);
  state.commandErrors += 1;
  return updateSessionHealth(id, { lastError: String(error?.message || error).slice(0, 240) });
}

export function markApiError(id, error) {
  const state = getSessionHealth(id);
  state.apiErrors += 1;
  return updateSessionHealth(id, { lastError: String(error?.message || error).slice(0, 240) });
}

export function heartbeat(id) {
  return updateSessionHealth(id, { lastHeartbeatAt: Date.now() });
}

export function clearSessionHealth(id) { states.delete(id); }
export function listSessionHealth() { return [...states.values()].map(state => ({ ...state })); }
