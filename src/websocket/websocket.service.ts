import * as WebSocket from 'ws';
import {WebsocketHandler} from './websocket.handler';
import {WsMessage} from './websocket-message.interface';
import {WsType} from './websocket.constant';
import {StateManager} from '../state/state-manager';

export class WebsocketService {

    constructor(private wsHandler: WebsocketHandler, private stateManager: StateManager) {
        this.stateManager.onBlockChainChange().subscribe(blocks => {
            // Todo implement
        });
    }

    connectToPeers(newPeers): WebSocket[] {
        return newPeers.map((peer) => {
            const ws = new WebSocket(peer);
            ws.on('open', () => {
                const closeWs = (ws) => {
                    const sockets = this.closeConnection(ws, this.stateManager.getSockets());
                    this.updateSocketState(sockets);
                };
                ws.on('close', () => closeWs(ws));
                ws.on('error', () => closeWs(ws));
                this.write(ws, {type: WsType.GET_ALL_BLOCKCHAIN});
            });
            ws.on('error', () => {
                console.log('Connection error')
            });
            ws.on('message', (message: WsMessage) => {
               const responseMessage = this.wsHandler.handleWsMessage(message);
               if (responseMessage) {
                   this.write(ws, responseMessage);
               }
            });
            this.updateSocketState(this.stateManager.getSockets().concat([ws]));

        });
    };

    private closeConnection (ws, sockets: WebSocket[]) {
        console.log('Connection to peer closed : ' + ws.url);
        return sockets.filter(s => s !== ws);
    };

    private updateSocketState(sockets: WebSocket[]): void {
        this.stateManager.setSockets(sockets);
    }

    write (ws: WebSocket, message: WsMessage) {ws.send(JSON.stringify(message))};
    broadcast (message: any, sockets: WebSocket[]) {sockets.forEach(socket => this.write(socket, message))};
}
