import {DataRecord} from '../../interfaces/data.interfaces';

export class Block {
  constructor(
    public index: number,
    public timestamp: number,
    public blockChainId: string,
    public data: DataRecord[],
    public hash: string,
    public previousHash: string = '0',
    public difficulty: number,
    public nonce: number,
  ) {
    this.index = index;
    this.blockChainId = blockChainId;
    this.timestamp = timestamp;
    this.data = data;
    this.hash = hash.toString();
    this.previousHash = previousHash.toString();
    this.difficulty = difficulty;
    this.nonce = nonce;
  }
}
