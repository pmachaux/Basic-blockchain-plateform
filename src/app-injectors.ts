import {WebsocketMessageHandler} from './websocket/websocket-message.handler';
import {HashUtils} from './blockchain/utils/hash.utils';
import {BlockFactory} from './blockchain/factories/block.factory';
import {BlockValidityUtils} from './blockchain/utils/block-validity.utils';
import {StateManager} from './state/state-manager';
import {BlockchainService} from './blockchain/blockchain.service';
import {BlockchainHandler} from './blockchain/blockchain.handler';
import {WebsocketService} from './websocket/websocket.service';
import {WebsocketHandler} from './websocket/websocket.handler';

const hashUtils = new HashUtils();
const blockFactory = new BlockFactory(hashUtils);
const blockValidityUtils = new BlockValidityUtils(blockFactory, hashUtils);
const stateManager = new StateManager();
const blockchainService = new BlockchainService(stateManager, blockFactory, blockValidityUtils);
const websocketMessageHandler = new WebsocketMessageHandler(blockchainService);
const websocketService = new WebsocketService(websocketMessageHandler, stateManager);




export const websockethandler = new WebsocketHandler(websocketService);
export const blockchainHandler = new BlockchainHandler(blockchainService);
