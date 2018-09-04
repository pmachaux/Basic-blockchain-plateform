import {SHA256} from 'crypto-js';
export class HashUtils {
    calculateHash(str: string): string {
        return SHA256(str).toString();
    }
}
