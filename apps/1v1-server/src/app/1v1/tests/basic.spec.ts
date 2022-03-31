import { WebSocket } from 'ws';

describe('testing connection', () => {
  it('should open socket', (done) => {
    const webSocket = new WebSocket('ws://localhost:3000/1v1');

    webSocket.onopen = () => {
      webSocket.close();
      done();
    };
  });
});
