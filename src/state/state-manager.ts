import {Block} from '../blockchain/models/block.model';
import * as WebSocket from 'ws';
import {Subject} from 'rxjs/internal/Subject';
import {DataRecord} from '../interfaces/data.interfaces';
import {Blockchain} from '../blockchain/models/blockchain.model';

const state: {
  blockchains: Blockchain[];
  sockets: WebSocket[];
  idCurrentBlockchainMined: string;
  idsBlockchainsToValidate: string[];
} = {
  blockchains: [],
  sockets: [],
  idCurrentBlockchainMined: null,
  idsBlockchainsToValidate: [],
};

const blocksSubject: Subject<Pick<Blockchain, 'id' | 'blocks'>> = new Subject<
  Pick<Blockchain, 'id' | 'blocks'>
>();
const chainsSubject: Subject<Blockchain> = new Subject<Blockchain>();

export class StateManager {
  getSockets(): WebSocket[] {
    return [...state.sockets];
  }

  setSockets(data: WebSocket[]): void {
    state.sockets = data;
  }

  getData(chainId: string): DataRecord[] | null {
    const blockchain = state.blockchains.find(x => x.id === chainId);
    if (!blockchain) {
      return null;
    } else {
      return blockchain.dataToProcess.map(x => ({...x}));
    }
  }

  setData(data: DataRecord[], chainId: string): void {
    const blockchain = state.blockchains.find(x => x.id === chainId);
    if (blockchain) {
      blockchain.dataToProcess = data.map(x => ({...x}));
    }
  }

  addData(data: DataRecord[], chainId: string): void {
    const blockchain = state.blockchains.find(x => x.id === chainId);
    if (blockchain) {
      blockchain.dataToProcess = blockchain.dataToProcess.concat(data.map(x => ({...x})));
    }
  }

  getIdCurrentChainMined(): string {
    return state.idCurrentBlockchainMined;
  }

  setIdCurrentBlockChainMined(blockChainId: string): void {
    if (state.blockchains.some(x => x.id === blockChainId)) {
      state.idCurrentBlockchainMined;
    }
  }

  getChain(blockchainId?: string): Blockchain {
    const id = blockchainId || state.idCurrentBlockchainMined;
    const currentBlockchain = state.blockchains.find(x => x.id === id);
    return currentBlockchain ? {...currentBlockchain, blocks: [...currentBlockchain.blocks]} : null;
  }

  getAllChains(): Blockchain[] {
    return state.blockchains.map(x => ({...x, blocks: [...x.blocks]}));
  }

  setNewChain(chain: Blockchain): void | Error {
    if (!state.blockchains.some(x => x.id === chain.id)) {
      state.blockchains = [...state.blockchains, {...chain}];
      chainsSubject.next({...chain});
    } else {
      throw new Error('A blockchain with the same id already exists');
    }
  }

  getBlocksFromChain(blockchainId?: string): Block[] {
    const id = blockchainId || state.idCurrentBlockchainMined;
    const currentBlockchain = state.blockchains.find(x => x.id === id);
    return currentBlockchain ? currentBlockchain.blocks.map(x => ({...x})) : null;
  }

  setBlocksInChain(data: Block[], blockchainId?: string): void {
    const id = blockchainId || state.idCurrentBlockchainMined;
    const currentBlockchain = state.blockchains.find(x => x.id === id);

    if (!currentBlockchain) {
      return;
    }

    const newBlocks = data.sort((a, b) => a.index - b.index).map(x => ({...x}));
    currentBlockchain.blocks = newBlocks;
    blocksSubject.next({id: id, blocks: newBlocks});
  }

  onBlockChainChange(): Subject<Pick<Blockchain, 'id' | 'blocks'>> {
    return blocksSubject;
  }

  onNewChain(): Subject<Blockchain> {
    return chainsSubject;
  }
}
