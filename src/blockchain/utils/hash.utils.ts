import {SHA256} from 'crypto-js';
import * as hexToBinary from 'hex-to-binary';
export class HashUtils {

  calculateHash(str: string): string {
    return SHA256(str).toString();
  }

  hashMatchesDifficulty(hash: string, difficulty: number): boolean {
    const hashInBinary: string = hexToBinary(hash);
    const requiredPrefix: string = '0'.repeat(difficulty);
    return hashInBinary.startsWith(requiredPrefix);
  }

  getValidHash(str: string, difficulty: number): {hash: string; nonce: number} {
    let nonce = 0;
    while (true) {
      const hash: string = this.calculateHash(str + difficulty + nonce).toString();
      if (this.hashMatchesDifficulty(hash, difficulty)) {
        return {
          hash,
          nonce,
        };
      }
      nonce++;
    }
  }
}
