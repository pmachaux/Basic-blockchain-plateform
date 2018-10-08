import {Block} from '../models/block.model';
import {HashUtils} from '../utils/hash.utils';
import {BlockchainDifficultyUtils} from '../utils/blockchain-difficulty.utils';
import {BlockValidityUtils} from '../utils/block-validity.utils';
import {DataRecord} from '../../interfaces/data.interfaces';

export class BlockFactory {
    constructor(private hashUtils: HashUtils, private blockValidityUtils: BlockValidityUtils) {}

    createGenesisBlock(data: DataRecord[], blockchainId: string): Block {
        const index = 0;
        const timestamp = new Date().getTime();
        const previousHash = '0';
        return this.generateBlock(index, blockchainId, previousHash, timestamp, data, 0);
    }

    generateNextBlock(blockChain: Block[], data: any, difficulty: number): Block {
        const previousBlock = blockChain[blockChain.length - 1];
        const previousHash = previousBlock.hash;
        const index = previousBlock.index + 1;
        const timestamp = new Date().getTime();
        return this.generateBlock(
            index,
            previousBlock.blockchainId,
            previousHash,
            timestamp,
            data,
            difficulty,
        );
    }

    private generateBlock(
        index: number,
        blockchainId: string,
        previousHash: string,
        timestamp: number,
        data: any,
        difficulty: number,
    ): Block {
        const baseHash = this.blockValidityUtils.getBlockHashInput({
            index,
            blockchainId,
            previousHash,
            timestamp,
            data,
            difficulty,
        });
        const {hash, nonce} = this.hashUtils.getValidHash(baseHash, difficulty);
        return new Block(
            index,
            blockchainId,
            timestamp,
            data,
            hash,
            previousHash,
            difficulty,
            nonce,
        );
    }
}
