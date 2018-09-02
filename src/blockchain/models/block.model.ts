export class Block {

    constructor(public index: number, public timestamp: number, public data: any, public hash: string, public previousHash: string = '0') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash.toString();
        this.previousHash = previousHash.toString();
    }
}