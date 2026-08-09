require('dotenv').config();
const http = require('http');
const { createApp } = require('./src/app');
const { attachWebSocket } = require('./src/utils/websocket');

const PORT = process.env.PORT || 3000;
const app = createApp();
const server = http.createServer(app);
attachWebSocket(server);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`TMS backend is running on port ${PORT}`);
});
