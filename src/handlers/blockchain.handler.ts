import {BlockFactory} from '../factories/block.factory';
import {Block} from '../models/block.model';
import {BlockValidityUtils} from '../utils/block-validity.utils';

export class BlockchainHandler {
    blockChain:Block[] = null;
    constructor (private blockFactory: BlockFactory, private blockChainUtils: BlockValidityUtils) {
        this.blockChain =  [blockFactory.createGenesisBlock()]
    }


    private replaceChain(newBlocks: Block[], blockChain: Block[]): Block[] | Error {
        if (this.blockChainUtils.isValidChain(newBlocks) && newBlocks.length > blockChain.length) {
            return newBlocks;
        }
        throw new Error('The received blockchain is invalid');
    }
}