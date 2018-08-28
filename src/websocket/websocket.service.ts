import * as WebSocket from 'ws';
import {WebsocketHandler} from './websocket.handler';
import {WsMessage} from './websocket-message.interface';
import {WsType} from './websocket.constant';

class WebsocketService {

    constructor(private wsHandler: WebsocketHandler) {}

    sockets: WebSocket[] = [];

    connectToPeers(newPeers): WebSocket[] {
        return newPeers.map((peer) => {
            const ws = new WebSocket(peer);
            ws.on('open', () => {
                const closeWs = (ws) => {
                    this.sockets = this.closeConnection(ws, this.sockets);
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

            this.sockets = this.sockets.concat([ws]);
        });
    };

    private closeConnection (ws, sockets: WebSocket[]) {
        console.log('Connection to peer closed : ' + ws.url);
        return sockets.filter(s => s !== ws);
    };

    write (ws: WebSocket, message: WsMessage) {ws.send(JSON.stringify(message))};
    broadcast (message: any, sockets: WebSocket[]) {sockets.forEach(socket => this.write(socket, message))};
}

const wsService = new WebsocketService(new WebsocketHandler());
export default wsService;