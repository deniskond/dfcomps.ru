import { WebSocket } from 'ws';

describe('testing connection', () => {
  it('should open socket', (done) => {
    const webSocket = new WebSocket('ws://localhost:4002/1v1');

    webSocket.onopen = () => {
      webSocket.close();
      done();
    };
  });
});
