import {WebsocketMessageHandler} from './websocket/websocket-message.handler';
import {HashUtils} from './blockchain/utils/hash.utils';
import {BlockFactory} from './blockchain/factories/block.factory';
import {BlockValidityUtils} from './blockchain/utils/block-validity.utils';
import {StateManager} from './state/state-manager';
import {BlockchainService} from './blockchain/blockchain.service';
import {BlockchainHandler} from './blockchain/blockchain.handler';
import {WebsocketService} from './websocket/websocket.service';
import {WebsocketHandler} from './websocket/websocket.handler';
import {BlockchainDifficultyUtils} from './blockchain/utils/blockchain-difficulty.utils';

const hashUtils = new HashUtils();
const stateManager = new StateManager();

const blockchainDifficultyUtils = new BlockchainDifficultyUtils();
const blockValidityUtils = new BlockValidityUtils(hashUtils);

const blockFactory = new BlockFactory(hashUtils, blockValidityUtils, blockchainDifficultyUtils);

const blockchainService = new BlockchainService(
  stateManager,
  blockFactory,
  blockValidityUtils,
  blockchainDifficultyUtils,
);
const websocketMessageHandler = new WebsocketMessageHandler(blockchainService);

export const websocketService = new WebsocketService(websocketMessageHandler, stateManager);
export const websockethandler = new WebsocketHandler(websocketService);
export const blockchainHandler = new BlockchainHandler(blockchainService);
