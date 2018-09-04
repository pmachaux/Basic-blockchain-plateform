import {blockchainHandler} from '../app-injectors';
import {websockethandler} from '../app-injectors';

export const indexRoutes = (app: any) => {
    // Blockchain handler
    app.post('/mineBlock', blockchainHandler.mineBlock.bind(blockchainHandler));
    app.get('/blocks', blockchainHandler.getBlockChain.bind(blockchainHandler));

// Websocket Handler
    app.post('/addPeers', websockethandler.addPeer.bind(websockethandler));
    app.get('/peers', websockethandler.getPeers.bind(websockethandler));
};