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
            console.log('init service subscribe');
            console.log(lastBlock);
            this.broadcast({
                type: WsType.PROCESS_BLOCKCHAIN,
                data: lastBlock
            }, this.stateManager.getSockets());
        });
    }

    initP2PConnection(port: number, initialPeers: string[]) {
        const server = new WebSocket.Server({port});
        this.connectToPeers(initialPeers);
        server.on('connection', (ws: WebSocket) => {
            const sockets = this.stateManager.getSockets();
            this.stateManager.setSockets([...sockets, ws]);
            console.log('Connection initiated');


            const closeWs = (ws) => {
                const sockets = this.closeConnection(ws, this.stateManager.getSockets());
                this.updateSocketState(sockets);
            };
            ws.on('close', () => closeWs(ws));
            ws.on('error', () => closeWs(ws));
            ws.on('message', (message: string) => {
                this.onMessage(ws, message);
            });
        });
    }

    connectToPeers(newPeers): WebSocket[] {
        console.log('connectToPeers');
        console.log(newPeers);
        return newPeers.map((peer) => {
            const ws = new WebSocket(peer);
            ws.on('open', () => {
                const closeWs = (ws) => {
                    const sockets = this.closeConnection(ws, this.stateManager.getSockets());
                    this.updateSocketState(sockets);
                };
                ws.on('close', () => closeWs(ws));
                ws.on('error', () => closeWs(ws));
                ws.on('message', (message: string) => {
                    this.onMessage(ws, message);
                });
                this.write(ws, {type: WsType.GET_ALL_BLOCKCHAIN});
            });
            this.updateSocketState(this.stateManager.getSockets().concat([ws]));

        });
    }

    private async onMessage(ws: WebSocket, message: string) {
        const responseMessage = await this.wsHandler.handleWsMessage(JSON.parse(message));
        console.log('onMessage');
        console.log(message);
        console.log(responseMessage);
        if (responseMessage && responseMessage.dest === WsDestination.SINGLE) {
            this.write(ws, {type: responseMessage.type, data: responseMessage.data });
        } else if (responseMessage && responseMessage.dest === WsDestination.ALL) {
            this.broadcast( {type: responseMessage.type, data: responseMessage.data }, this.stateManager.getSockets());
        }
    }

    private closeConnection (ws, sockets: WebSocket[]) {
        console.log('Connection to peer closed : ' + ws.url);
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

    write (ws: WebSocket, message: WsMessage) {ws.send(JSON.stringify(message));}
    broadcast (message: WsMessage, sockets: WebSocket[]) {sockets.forEach(socket => this.write(socket, message));}
}
