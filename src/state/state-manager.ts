import {Block} from '../blockchain/models/block.model';
import * as WebSocket from 'ws';
import {Observable} from 'rxjs/internal/Observable';
import {Subject} from 'rxjs/internal/Subject';

const state: {
    blockchain: Block[],
    sockets: WebSocket[]
} = {
    blockchain: null,
    sockets: []
};

const blockchainSubject: Subject<Block[]> = new Subject<Block[]>();

export class StateManager {

    getSockets(): WebSocket[] {
        return [...state.sockets];
    }

    setSockets(data: WebSocket[]): void {
        state.sockets = data;
    }

    getBlockChain(): Block[]  {
        return state.blockchain ? state.blockchain.map(x => ({...x})) : null;
    }

    setBlockChain(data: Block[]): void {
        state.blockchain = data.sort(((a, b) => (a.index - b.index))).map(x => ({...x}));
        blockchainSubject.next(data);
    }

    onBlockChainChange(): Subject<Block[]> {
        return blockchainSubject;
    }
}

const stateManager = new StateManager();
