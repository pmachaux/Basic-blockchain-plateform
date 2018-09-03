import {WebsocketService} from './websocket.service';

export class WebsocketHandler {

    constructor(private wsService: WebsocketService) {
    }

    addPeer(req, res) {
        this.wsService.connectToPeers([req.body.peers]);
        return res.status(204).end();
    }

    getPeers(req, res) {
        const peers = this.wsService.getPeers();
        return res.send(peers);
    }
}
