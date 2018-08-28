import {WsMessage} from './websocket-message.interface';
import {WsType} from './websocket.constant';

export class WebsocketHandler {

    getHandlers(): any {
        return {
            [WsType.GET_ALL_BLOCKCHAIN]: this.getAllBlockChain.bind(this)
        }
    }

    handleWsMessage(message: WsMessage): WsMessage | null {
        const exec = this.getHandlers()[message.type];
        if (!exec) {
            return null;
        }
        return exec(message.data)
    }

    getAllBlockChain(): any {

    }
}