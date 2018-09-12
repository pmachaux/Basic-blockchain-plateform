import * as WebSocket from 'ws';
import {WebsocketMessageHandler} from './websocket-message.handler';
import {WsMessage} from './websocket-message.interface';
import {WsDestination, WsType} from './websocket.constant';
import {StateManager} from '../state/state-manager';

export class WebsocketService {
  constructor(private wsHandler: WebsocketMessageHandler, private stateManager: StateManager) {
    this.initService();
  }

  private initService() {
    this.stateManager.onBlockChainChange().subscribe(blocks => {
      const lastBlock = blocks.reverse()[0];
      this.broadcastToAll(
        {
          type: WsType.PROCESS_BLOCKCHAIN,
          data: [lastBlock],
        }
      );
    });
  }

  initP2PConnection(port: number, initialPeers: string[]) {
    const server = new WebSocket.Server({port});
    this.connectToPeers(initialPeers);
    server.on('connection', (ws: WebSocket) => {
      const sockets = this.stateManager.getSockets();
      this.stateManager.setSockets([...sockets, ws]);
      this.attachEventHandlersToSocket(ws);
    });
  }

  connectToPeers(newPeers): WebSocket[] {
    return newPeers.map(peer => {
      const ws = new WebSocket(peer);
      ws.on('open', () => {
        this.attachEventHandlersToSocket(ws);
        this.write(ws, {type: WsType.GET_ALL_BLOCKCHAIN});
      });
      this.updateSocketState(this.stateManager.getSockets().concat([ws]));
    });
  }

  private async onMessage(ws: WebSocket | null, message: string) {
    const parsedMessage: WsMessage = JSON.parse(message);
    const responseMessage = await this.wsHandler.handleWsMessage(parsedMessage);

    if (responseMessage && responseMessage.dest === WsDestination.SINGLE) {
      this.write(ws, {type: responseMessage.type, data: responseMessage.data});
    } else if (responseMessage && responseMessage.dest === WsDestination.ALL) {
      this.broadcastToAll({type: responseMessage.type, data: responseMessage.data});
    }
  }

  processOwnMessage(message: WsMessage): void {
    this.wsHandler.handleWsMessage(message);
  }

  private attachEventHandlersToSocket(ws: WebSocket): void {
    const closeWs = ws => {
      const sockets = this.closeConnection(ws, this.stateManager.getSockets());
      this.updateSocketState(sockets);
    };
    ws.on('close', () => closeWs(ws));
    ws.on('error', () => closeWs(ws));
    ws.on('message', (message: string) => {
      this.onMessage(ws, message);
    });
  }

  private closeConnection(ws, sockets: WebSocket[]) {
    return sockets.filter(s => s !== ws);
  }

  private updateSocketState(sockets: WebSocket[]): void {
    this.stateManager.setSockets(sockets);
  }

  getPeers(): string[] {
    return this.stateManager.getSockets().map((x: WebSocket) => {
      return x.url;
    });
  }

  write(ws: WebSocket, message: WsMessage) {
    ws.send(JSON.stringify(message));
  }
  broadcast(message: WsMessage, sockets: WebSocket[]) {
    sockets.forEach(socket => this.write(socket, message));
  }
  broadcastToAll(message: WsMessage): void {
    const peers = this.stateManager.getSockets();
    this.broadcast(message, peers);
  }
}
