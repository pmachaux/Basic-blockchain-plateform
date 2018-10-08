import {WebsocketMessageHandler} from './websocket/websocket-message.handler';
import {HashUtils} from './blockchain/utils/hash.utils';
import {BlockFactory} from './blockchain/factories/block.factory';
import {BlockValidityUtils} from './blockchain/utils/block-validity.utils';
import {StateManager} from './state/state-manager';
import {BlockchainService} from './blockchain/services/blockchain.service';
import {BlockchainHandler} from './blockchain/blockchain.handler';
import {WebsocketService} from './websocket/websocket.service';
import {WebsocketHandler} from './websocket/websocket.handler';
import {DataUtils} from './data/data.utils';
import {DataService} from './data/data.service';
import {BlockchainFactory} from './blockchain/factories/blockchain.factory';
import {MinerService} from './miner/miner.service';

const hashUtils = new HashUtils();
const stateManager = new StateManager();

const dataUtils = new DataUtils();
const dataService = new DataService(dataUtils, stateManager);

const blockValidityUtils = new BlockValidityUtils(hashUtils);
const blockFactory = new BlockFactory(hashUtils, blockValidityUtils);
const blockchainFactory = new BlockchainFactory(blockFactory, dataService);
const minerService = new MinerService(stateManager);
const blockchainService = new BlockchainService(
  stateManager,
  blockFactory,
  blockchainFactory,
  blockValidityUtils,
  minerService,
);
const websocketMessageHandler = new WebsocketMessageHandler(blockchainService, dataService);

export const websocketService = new WebsocketService(websocketMessageHandler, stateManager);
export const websockethandler = new WebsocketHandler(
  websocketService,
  dataService,
  blockchainService,
);
export const blockchainHandler = new BlockchainHandler(blockchainService);
