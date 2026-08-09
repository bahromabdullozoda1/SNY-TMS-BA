const { WebSocketServer } = require('ws');

let wss;

function attachWebSocket(server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (socket) => {
    socket.send(JSON.stringify({ type: 'system.connected' }));
  });

  return wss;
}

function notifyClients(message) {
  if (!wss) {
    return;
  }

  const payload = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
}

module.exports = {
  attachWebSocket,
  notifyClients
};
