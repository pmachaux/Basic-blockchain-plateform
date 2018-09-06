const BLOCK_GENERATION_INTERVAL = 30; // In seconds
const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 5; // In blocks
export class BlockchainDifficultyUtils {
  private difficulty: number = 4;

  getDifficulty(): number {
    return this.difficulty;
  }
}
