import {WsMessage} from './websocket-message.interface';
import {WsDestination, WsType} from './websocket.constant';
import {BlockchainService} from '../blockchain/services/blockchain.service';
import {Block} from '../blockchain/models/block.model';
import {DataRecord} from '../interfaces/data.interfaces';
import {DataService} from '../data/data.service';

export type WsMessageDest = WsMessage & {dest: WsDestination};

export class WebsocketMessageHandler {
  constructor(private blockChainHandler: BlockchainService, private dataService: DataService) {}

  getHandlers(): any {
    return {
      [WsType.GET_ALL_BLOCKCHAIN]: this.getAllBlockChain.bind(this),
      [WsType.GET_LATEST_BLOCK]: this.getLatestBlock.bind(this),
      [WsType.PROCESS_BLOCKCHAIN]: this.processBlockChain.bind(this),
      [WsType.PUSH_NEW_DATA]: this.onNewData.bind(this),
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
      data: this.blockChainHandler.getAllBlocks(),
      dest: WsDestination.SINGLE,
    };
  }

  getLatestBlock(): WsMessageDest {
    return {
      type: WsType.PROCESS_BLOCKCHAIN,
      data: this.blockChainHandler.getLatestBlock(),
      dest: WsDestination.SINGLE,
    };
  }

  private onNewData(data: DataRecord[]): void {
    this.dataService.processNewData(data);
  }

  async processBlockChain(data: Block[]): Promise<WsMessageDest> {
    try {
      const blocks = await this.blockChainHandler.processBlockChain(data);
      return null;
    } catch (e) {
      if (e === 'Cannot process blockchain, additionnal info needed') {
        return {
          type: WsType.GET_ALL_BLOCKCHAIN,
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
