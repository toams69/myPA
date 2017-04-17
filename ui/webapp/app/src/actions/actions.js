export const CONNECTED = 'CONNECTED';
export const CONNECTING = 'CONNECTING';
export const DISCONNECTED = 'DISCONNECTED';
export const MESSAGE_RECEIVED = 'MESSAGE_RECEIVED';
export const CLEAR_MESSAGES = 'CLEAR_MESSAGES';

export const CONNECT = 'CONNECT';
export const DISCONNECT = 'DISCONNECT';

export function connectSocket() {
  return {
    type: CONNECT,
    url: "ws://localhost:15000"
  };
}

export function disconnectSocket() {
  return {
    type: DISCONNECT
  };
}

export function clearLogs() {
  return {
    type: CLEAR_MESSAGES
  };
}

export function connecting() {
  return {
    type: CONNECTING
  };
}

export function connected() {
  return {
    type: CONNECTED
  };
}

export function disconnected() {
  return {
    type: DISCONNECTED
  };
}

export function messageReceived(msg) {
  return {
    type: MESSAGE_RECEIVED,
    logs: msg
  };
}