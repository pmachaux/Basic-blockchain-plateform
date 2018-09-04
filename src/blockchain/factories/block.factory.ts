import {Block} from '../models/block.model';
import {HashUtils} from '../utils/hash.utils';

export class BlockFactory {

    constructor(private hashUtils: HashUtils) {
    }

    createGenesisBlock(): Block {
        const index = 0;
        const timestamp = 1536049495100;
        const data = 'My genesis block';
        const previousHash = '0';
        const hash = this.hashUtils.calculateHash(index + previousHash + timestamp + data);
        return new Block(
            index, timestamp, data, hash, previousHash
        );
    }

    generateNextBlock(blockChain, data): Block {
        const previousBlock = blockChain[blockChain.length - 1];
        const nextIndex = previousBlock.index + 1;
        const nextTimeStamp = new Date().getTime();
        const nextHash = this.hashUtils.calculateHash(nextIndex + previousBlock.hash + nextTimeStamp + data);
        return new Block(nextIndex, previousBlock.hash, nextTimeStamp, data, nextHash);
    }

}
