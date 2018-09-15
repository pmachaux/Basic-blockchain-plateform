import * as WebSocket from 'ws';
import {WebsocketMessageHandler, WsMessageDest} from './websocket-message.handler';
import {WsMessage} from './websocket-message.interface';
import {WsDestination, WsType} from './websocket.constant';
import {StateManager} from '../state/state-manager';
import {Blockchain} from '../blockchain/models/blockchain.model';

export class WebsocketService {
  constructor(private wsHandler: WebsocketMessageHandler, private stateManager: StateManager) {
    this.initService();
  }

  private initService() {
    this.stateManager.onBlockChainChange().subscribe((data: Pick<Blockchain, 'id' | 'blocks'>) => {
      const lastBlock = data.blocks.reverse()[0];
      this.broadcastToAll({
        type: WsType.PROCESS_BLOCKCHAIN,
        data: [lastBlock],
      });
    });
    this.stateManager.onNewChain().subscribe(chain => {
      this.broadcastToAll({
        type: WsType.PUSH_NEW_CHAIN,
        data: chain,
      });
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
        this.write(ws, {type: WsType.GET_ALL_CHAINS});
      });
      this.updateSocketState(this.stateManager.getSockets().concat([ws]));
    });
  }

  private async onMessage(ws: WebSocket | null, message: string) {
    const parsedMessage: WsMessage = JSON.parse(message);
    try {
      const result = await this.wsHandler.handleWsMessage(parsedMessage);

      if (!result) {
        return;
      }

      if (Array.isArray(result)) {
        result.forEach(responseMessage => {
          this.processResultMessage(responseMessage, ws);
        });
      } else {
        this.processResultMessage(result, ws);
      }
    } catch {}
  }

  private processResultMessage(responseMessage: WsMessageDest, ws: WebSocket): void {
    if (responseMessage.dest === WsDestination.SINGLE) {
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
