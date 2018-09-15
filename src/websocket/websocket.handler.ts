import {WebsocketService} from './websocket.service';
import {WsMessage} from './websocket-message.interface';
import {WsType} from './websocket.constant';
import {DataService} from '../data/data.service';
import {BlockchainService} from '../blockchain/services/blockchain.service';
export class WebsocketHandler {
  constructor(private wsService: WebsocketService, private dataService: DataService, private blockchainService: BlockchainService) {}

  addPeer(req, res) {
    try {
      this.wsService.connectToPeers([req.body.peers]);
      return res.status(204).end();
    } catch {
      return res.status(500).end();
    }
  }

  getPeers(req, res) {
    const peers = this.wsService.getPeers();
    return res.send(peers);
  }

  pushNewDataToMiners(env, req, res) {
    const blockchainId = req.body.blockchainId;

    if(!this.blockchainService.doesBlockchainExists(blockchainId)) {
        return res.status(400).send('The blockchain does not exist, please provide a valid to push data');
    }

    const data = {data: this.dataService.formatData(req.body.data, blockchainId), id: blockchainId};
    const message: WsMessage = {
      type: WsType.PUSH_NEW_DATA,
      data,
    };
    this.wsService.processOwnMessage(message);
    this.wsService.broadcastToAll(message);
    return res.status(204).end();
  }
}
