import {blockchainHandler} from '../app-injectors';
import {websockethandler} from '../app-injectors';

export const indexRoutes = (app: any, env: any) => {
  // Blockchain handler
  app.get('/blocks/:blockchainId', blockchainHandler.getBlockChain.bind(blockchainHandler));
  app.get('/blockchains', blockchainHandler.getAllBlockchains.bind(blockchainHandler));
  app.post('/createblockchain', blockchainHandler.createBlockChain.bind(blockchainHandler));
  app.post(
    '/mineBlockchain/:blockchainId',
    blockchainHandler.mineBlockchain.bind(blockchainHandler),
  );

  // Websocket Handler
  app.post('/addPeers', websockethandler.addPeer.bind(websockethandler));
  app.get('/peers', websockethandler.getPeers.bind(websockethandler));

  app.post('/newData', websockethandler.pushNewDataToMiners.bind(websockethandler, env));
};
