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
        let nonce = Math.floor(Math.random() * Math.floor(1000)); // Trick for testing purpose to simulate different mining processes between copy instances.
        while (true) {
            const hash: string = this.calculateHash(
                str + nonce.toString(),
            ).toString();
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
