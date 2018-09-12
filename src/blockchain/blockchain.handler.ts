import {BlockchainService} from './services/blockchain.service';

export class BlockchainHandler {
    constructor(private blockchainService: BlockchainService) {}

    getBlockChain(req, res) {
        const blockchain = this.blockchainService.getAllBlocks();
        return res.send(JSON.stringify(blockchain));
    }
}
