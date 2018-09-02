import {WebsocketHandler} from './websocket/websocket.handler';
import {HashUtils} from './blockchain/utils/hash.utils';
import {BlockFactory} from './blockchain/factories/block.factory';
import {BlockValidityUtils} from './blockchain/utils/block-validity.utils';
import {StateManager} from './state/state-manager';
import {WebsocketService} from './websocket/websocket.service';
import {BlockchainHandler} from './blockchain/blockchain.handler';

const hashUtils = new HashUtils();
const blockFactory = new BlockFactory(hashUtils);
const blockValidityUtils = new BlockValidityUtils(blockFactory, hashUtils);
const stateManager = new StateManager();

const blockChainHandler = new BlockchainHandler(stateManager, blockFactory, blockValidityUtils);

const websocketHandler = new WebsocketHandler(blockChainHandler);
export const websocketService = new WebsocketService(websocketHandler, stateManager);