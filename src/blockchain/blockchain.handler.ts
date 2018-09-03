import {BlockchainService} from './blockchain.service';

export class BlockchainHandler {
    constructor(private blockchainService: BlockchainService) {}

    mineBlock(req, res) {
        this.blockchainService.generateNewBlock(req.body.data);
        return res.status(204).end();
    }

    getBlockChain(req, res) {
        const blockchain = this.blockchainService.getAllBlockChain();
        return res.send(JSON.stringify(blockchain))
    }
}