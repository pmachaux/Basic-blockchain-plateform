import {Block} from '../blockchain/models/block.model';
import * as WebSocket from 'ws';

const state: {
    blockchain: Block[],
    sockets: WebSocket[]
} = {
    blockchain: null,
    sockets: []
};

export class StateManager {

    getSockets(): WebSocket[] {
        return {...state.sockets};
    }

    setSockets(data: WebSocket[]): void {
        state.sockets = data;
    }

    getBlockChain(): Block[] {
        return {...state.blockchain};
    }

    setBlockChain(data: Block[]): void {
        state.blockchain = data;
    }
}

const stateManager = new StateManager();