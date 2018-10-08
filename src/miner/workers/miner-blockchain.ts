import {BlockchainDifficultyUtils} from '../../blockchain/utils/blockchain-difficulty.utils';
import {BlockValidityUtils} from '../../blockchain/utils/block-validity.utils';
import {BlockFactory} from '../../blockchain/factories/block.factory';
import {HashUtils} from '../../blockchain/utils/hash.utils';
import {Blockchain} from '../../blockchain/models/blockchain.model';

const {parentPort, workerData} = require('worker_threads');
const blockchainDifficultyUtils = new BlockchainDifficultyUtils();
const hashUtils = new HashUtils();
const blockValidityUtils = new BlockValidityUtils(hashUtils);
const blockFactory = new BlockFactory(hashUtils, blockValidityUtils);

const difficulty = blockchainDifficultyUtils.getDifficulty((workerData as Blockchain).blocks);
const newBlock = blockFactory.generateNextBlock(
    (workerData as Blockchain).blocks,
    (workerData as Blockchain).dataToProcess,
    difficulty,
);

const result = {
    id: (workerData as Blockchain).id,
    blocks: [...(workerData as Blockchain).blocks, ...[newBlock]],
};
parentPort.postMessage(result);
