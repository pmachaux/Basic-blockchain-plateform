import {BlockchainService} from './services/blockchain.service';
import {Request, Response} from 'express';

export class BlockchainHandler {
  constructor(private blockchainService: BlockchainService) {}

  getBlockChain(req: Request, res: Response) {
    const blockchainId = req.params.blockchainId;
    const blockchain = this.blockchainService.getAllBlocks(blockchainId);
    return res.send(JSON.stringify(blockchain));
  }

  getAllBlockchains(req: Request, res: Response) {
    return res.send({chains: this.blockchainService.getAllBlockchainsIdentifiers()});
  }

  mineBlockchain(req: Request, res: Response) {
    const blockchainId = req.body.blockchainId;
    return res.send(this.blockchainService.selectChainToMine(blockchainId));
  }

  createBlockChain(req: Request, res: Response) {
    const name = req.body.name;
    if (!name) {
      return res.status(400).send({msg: 'A name must be set'});
    }
    if (this.blockchainService.doesBlockchainNameAlreadyInUse(name)) {
      return res.status(400).send({msg: 'A blockchain with that name already exists'});
    }
    const id = this.blockchainService.initBlockChain(name);
    if (!id) {
      return res.status(500).send({msg: 'An error occured while trying to generate the new chain'});
    }
    return res.status(200).send({id, name});
  }
}
