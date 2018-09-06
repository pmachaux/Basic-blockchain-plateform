import {BLOCK_GENERATION_INTERVAL, DIFFICULTY_ADJUSTMENT_INTERVAL} from '../blockchain.const';

export class BlockchainDifficultyUtils {
  private difficulty: number = 4;

  constructor() {}

  getDifficulty(): number {
    return this.difficulty;
  }

  setDifficulty(difficulty: number): void {
    this.difficulty = difficulty;
  }

  public adjustDifficulty(
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
