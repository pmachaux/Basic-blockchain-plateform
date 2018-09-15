import {WsMessage} from './websocket-message.interface';
import {WsDestination, WsType} from './websocket.constant';
import {BlockchainService} from '../blockchain/services/blockchain.service';
import {Block} from '../blockchain/models/block.model';
import {DataRecord} from '../interfaces/data.interfaces';
import {DataService} from '../data/data.service';
import {Blockchain} from '../blockchain/models/blockchain.model';

export type WsMessageDest = WsMessage & {dest: WsDestination};

export class WebsocketMessageHandler {
  constructor(private blockchainService: BlockchainService, private dataService: DataService) {}

  getHandlers(): any {
    return {
      [WsType.GET_ALL_BLOCKS_FROM_CHAIN]: this.getAllBlockChain.bind(this),
      [WsType.GET_ALL_CHAINS]: this.getAllChains.bind(this),
      [WsType.PROCESS_MULTIPLE_CHAINS]: this.processMultipleChain.bind(this),
      [WsType.GET_LATEST_BLOCK]: this.getLatestBlock.bind(this),
      [WsType.PROCESS_BLOCKCHAIN]: this.processBlockChain.bind(this),
      [WsType.PUSH_NEW_DATA]: this.onNewData.bind(this),
      [WsType.PUSH_NEW_CHAIN]: this.onNewChain.bind(this),
    };
  }

  async handleWsMessage(message: WsMessage): Promise<WsMessageDest | WsMessageDest[] | null> {
    const exec = this.getHandlers()[message.type];
    if (!exec) {
      return null;
    }
    return exec(message.data);
  }

  private getAllBlockChain(id: string): WsMessageDest {
    return {
      type: WsType.PROCESS_BLOCKCHAIN,
      data: this.blockchainService.getAllBlocks(id),
      dest: WsDestination.SINGLE,
    };
  }

  private getAllChains(): WsMessageDest {
    return {
      type: WsType.PROCESS_MULTIPLE_CHAINS,
      data: this.blockchainService.getAllChains(),
      dest: WsDestination.SINGLE,
    };
  }

  private getLatestBlock(id: string): WsMessageDest {
    return {
      type: WsType.PROCESS_BLOCKCHAIN,
      data: this.blockchainService.getLatestBlock(id),
      dest: WsDestination.SINGLE,
    };
  }

  private onNewData(msg: {id: string; data: DataRecord[]}): void {
    if (this.blockchainService.doesBlockchainExists(msg.id)) {
      this.dataService.processNewData(msg.data, msg.id);
    }
  }

  private async onNewChain(data: Blockchain): Promise<void> {
    return this.blockchainService.processNewChain(data);
  }

  private async processMultipleChain(data: Array<Blockchain>): Promise<WsMessageDest[] | null> {
    const chainsProcess = data.map(x => this.processBlockChain(x));
    const result = await Promise.all(chainsProcess);
    const resultsWithWsMessageDest = result.filter(x => !!x);
    return resultsWithWsMessageDest.length > 0 ? resultsWithWsMessageDest : null;
  }

  private async processBlockChain(data: Pick<Blockchain, 'id' | 'blocks'>): Promise<WsMessageDest> {
    try {
      await this.blockchainService.processBlockChain(data.blocks, data.id);
      return null;
    } catch (e) {
      if (e === 'Cannot process blockchain, additionnal info needed') {
        return {
          type: WsType.GET_ALL_BLOCKS_FROM_CHAIN,
          data: data.id,
          dest: WsDestination.ALL,
        };
      } else {
        console.error('error on process blockchain');
        console.error(e);
        return null;
      }
    }
  }
}
