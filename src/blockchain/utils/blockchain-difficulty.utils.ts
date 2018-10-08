import {BLOCK_GENERATION_INTERVAL, DIFFICULTY_ADJUSTMENT_INTERVAL} from '../blockchain.const';
import {Block} from '../models/block.model';

export class BlockchainDifficultyUtils {
    constructor() {}

    public getDifficulty(chain: Block[]): number {
        const lastBlock = chain[chain.length - 1];
        if (chain.length % 5 === 0 && chain.length > 2 * DIFFICULTY_ADJUSTMENT_INTERVAL) {
            const previousTimeStampCheck =
                chain[chain.length - 1 - DIFFICULTY_ADJUSTMENT_INTERVAL].timestamp;
            return this.adjustDifficulty(
                lastBlock.timestamp,
                previousTimeStampCheck,
                lastBlock.difficulty,
            );
        }
        if (chain.length < DIFFICULTY_ADJUSTMENT_INTERVAL) {
            return 20;
        }
        return lastBlock.difficulty;
    }

    private adjustDifficulty(
        latestTimestamp: number,
        previousTimeStampCheck: number,
        previousDifficulty: number,
    ): number {
        const expectedDuration: number = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
        const actualDuration: number = latestTimestamp - previousTimeStampCheck;
        if (actualDuration < expectedDuration / 2) {
            return previousDifficulty + 1;
        } else if (actualDuration > expectedDuration * 2) {
            return previousDifficulty - 1;
        } else {
            return previousDifficulty;
        }
    }
}
