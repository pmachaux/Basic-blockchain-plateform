import {BlockFactory} from './block.factory';
import {Blockchain} from '../models/blockchain.model';
import {DataService} from '../../data/data.service';

export class BlockchainFactory {
  constructor(private blockFactory: BlockFactory, private dataService: DataService) {}

  createNewBlockChain(name: string): Blockchain {
    const id = this.getBlockChainId(name);
    const baseInfo = 'Initial block generated at: ' + new Date().getTime();
    const initialData = this.dataService.formatData(baseInfo, id);
    const blocks = [this.blockFactory.createGenesisBlock(initialData, id)];
    return new Blockchain(id, name, blocks);
  }

  private getBlockChainId(name: string): string {
    const concatName = name.split(' ').join('');
    const timestamp = new Date().getTime();
    const randomNumber = Math.floor(Math.random() * 100);
    return 'id-' + concatName + timestamp + randomNumber;
  }
}
