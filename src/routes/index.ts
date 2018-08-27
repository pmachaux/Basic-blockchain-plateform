import {BlockFactory} from "../factories/block.factory";
import {HashUtils} from "../utils/hash.utils";
import {BlockchainHandler} from '../handlers/blockchain.handler';
import {BlockValidityUtils} from '../utils/block-validity.utils';

const express = require('express');
const router = express.Router();

const hashUtils = new HashUtils();
const blockFactory = new BlockFactory(hashUtils);
const blockValidityUtils = new BlockValidityUtils(blockFactory, hashUtils);
const blockChainHandler = new BlockchainHandler(blockFactory, blockValidityUtils);

router.get('/', function(req, res, next) {

});

module.exports = router;
