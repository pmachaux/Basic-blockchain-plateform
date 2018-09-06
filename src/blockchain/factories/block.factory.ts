import {Block} from '../models/block.model';
import {HashUtils} from '../utils/hash.utils';
import {BlockchainDifficultyUtils} from '../utils/blockchain-difficulty.utils';
import {BlockValidityUtils} from '../utils/block-validity.utils';

export class BlockFactory {
  constructor(
    private hashUtils: HashUtils,
    private blockValidityUtils: BlockValidityUtils,
    private blockchainDifficultyUtils: BlockchainDifficultyUtils,
  ) {}

  createGenesisBlock(): Block {
    const index = 0;
    const timestamp = 1536049495100;
    const data = 'My genesis block';
    const previousHash = '0';
    return this.generateBlock(index, previousHash, timestamp, data);
  }

  generateNextBlock(blockChain: Block[], data: any): Block {
    const previousBlock = blockChain[blockChain.length - 1];
    const previousHash = previousBlock.hash;
    const index = previousBlock.index + 1;
    const timestamp = new Date().getTime();
    return this.generateBlock(index, previousHash, timestamp, data);
  }

  private generateBlock(index: number, previousHash: string, timestamp: number, data: any): Block {
    const difficulty = this.blockchainDifficultyUtils.getDifficulty();
    const baseHash = this.blockValidityUtils.getBlockHashInput({
      index,
      previousHash,
      timestamp,
      data,
      difficulty,
    });
    const {hash, nonce} = this.hashUtils.getValidHash(baseHash, difficulty);
    return new Block(index, timestamp, data, hash, previousHash, difficulty, nonce);
  }
}
