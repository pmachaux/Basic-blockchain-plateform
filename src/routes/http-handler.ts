import {BlockchainHandler} from '../blockchain/blockchain.handler';

export class HttpHandler {

    constructor(private blockchainHandler: BlockchainHandler){}

    mineBlock(req, res) {
        this.blockchainHandler.generateNewBlock(req.body.data);
        return res.status(204).send();
    }
}