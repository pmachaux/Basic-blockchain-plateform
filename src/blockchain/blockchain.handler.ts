import {BlockchainService} from './blockchain.service';

export class BlockchainHandler {
    constructor(private blockchainService: BlockchainService) {}

    mineBlock(req, res) {
        console.log('mineBlock');
        console.log(req.body.data);
        console.log(this.blockchainService.generateNewBlock(req.body.data));
        return res.status(204).end();
    }

    getBlockChain(req, res) {
        console.log('getBlockChain');
        const blockchain = this.blockchainService.getAllBlockChain();
        console.log(blockchain);
        return res.send(JSON.stringify(blockchain));
    }
}
