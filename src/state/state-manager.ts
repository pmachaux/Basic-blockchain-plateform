import {Block} from '../blockchain/models/block.model';
import * as WebSocket from 'ws';
import {Subject} from 'rxjs/internal/Subject';
import {DataRecord} from '../interfaces/data.interfaces';
import {Blockchain} from '../blockchain/models/blockchain.model';

const state: {
  blockchains: Blockchain[];
  sockets: WebSocket[];
  data: DataRecord[];
  currentBlockchainMined: string;
  blockchainsToValidate: string[];
} = {
  blockchains: [],
  sockets: [],
  data: [],
  currentBlockchainMined: null,
  blockchainsToValidate: [],
};

const blockchainSubject: Subject<Block[]> = new Subject<Block[]>();

export class StateManager {
  getSockets(): WebSocket[] {
    return [...state.sockets];
  }

  setSockets(data: WebSocket[]): void {
    state.sockets = data;
  }

  getData(): DataRecord[] {
    return state.data.map(x => ({...x}));
  }

  setData(data: DataRecord[]): void {
    state.data = data.map(x => ({...x}));
  }

  getBlockChain(blockchainId?: string): Block[] {
    const id = blockchainId || state.currentBlockchainMined;
    const currentBlockchain = state.blockchains.find(x => x.id === id);
    return currentBlockchain ? currentBlockchain.blocks.map(x => ({...x})) : null;
  }

  setBlockChain(data: Block[], blockchainId?: string): void {
    const id = blockchainId || state.currentBlockchainMined;
    const currentBlockchain = state.blockchains.find(x => x.id === id);
    const newBlocks = data.sort((a, b) => a.index - b.index).map(x => ({...x}));
    currentBlockchain.blocks = newBlocks;
    blockchainSubject.next(data);
  }

  onBlockChainChange(): Subject<Block[]> {
    return blockchainSubject;
  }
}
