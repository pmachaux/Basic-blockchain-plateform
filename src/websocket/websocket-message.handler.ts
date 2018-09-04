import {WsMessage} from './websocket-message.interface';
import {WsDestination, WsType} from './websocket.constant';
import {BlockchainService} from '../blockchain/blockchain.service';
import {Block} from '../blockchain/models/block.model';

export type WsMessageDest = WsMessage & {dest: WsDestination};

export class WebsocketMessageHandler {

    constructor(private blockChainHandler: BlockchainService) {
    }

    getHandlers(): any {
        return {
            [WsType.GET_ALL_BLOCKCHAIN]: this.getAllBlockChain.bind(this),
            [WsType.GET_LATEST_BLOCK]: this.getLatestBlock.bind(this),
            [WsType.PROCESS_BLOCKCHAIN]: this.processBlockChain.bind(this)
        };
    }

    async handleWsMessage(message: WsMessage): Promise<WsMessageDest | null> {
        const exec = this.getHandlers()[message.type];
        if (!exec) {
            return null;
        }
        return exec(message.data);
    }

    getAllBlockChain(): WsMessageDest {
        return {
            type: WsType.PROCESS_BLOCKCHAIN,
            data: this.blockChainHandler.getAllBlockChain(),
            dest: WsDestination.SINGLE
        };
    }

    getLatestBlock(): WsMessageDest {
        return {
            type: WsType.PROCESS_BLOCKCHAIN,
            data: this.blockChainHandler.getLatestBlock(),
            dest: WsDestination.SINGLE
        };
    }

    async processBlockChain(data: Block[]): Promise<WsMessageDest> {
        try {
            const blocks = await this.blockChainHandler.processBlockChain(data);
            return null;
        } catch (e) {
            if (e === 'Cannot process blockchain, additionnal info needed') {
                return {
                    type: WsType.GET_ALL_BLOCKCHAIN,
                    dest: WsDestination.ALL
                };
            } else {
                console.error('error on process blockchain');
                console.error(e);
                return null;
            }

        }

    }
}
