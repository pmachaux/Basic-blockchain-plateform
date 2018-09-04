import {blockchainHandler} from '../app-injectors';
import {websockethandler} from '../app-injectors';
const express = require('express');
const router = express.Router();

// Blockchain handler
router.get('/mineBlock', blockchainHandler.mineBlock);
router.get('/blocks', blockchainHandler.getBlockChain);

// Websocket Handler
router.post('/addPeers', websockethandler.addPeer);
router.get('/peers', websockethandler.getPeers);

module.exports = router;
