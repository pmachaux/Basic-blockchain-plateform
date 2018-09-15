export enum WsType {
    GET_ALL_BLOCKS_FROM_CHAIN = 'getAllBlockChain',
    GET_ALL_CHAINS = 'getAllChains',
    GET_LATEST_BLOCK = 'getLatestBlock',
    PROCESS_BLOCKCHAIN = 'processBlockChain',
    PROCESS_MULTIPLE_CHAINS = 'processMultipleBlockChain',
    PUSH_NEW_DATA = 'newData',
    PUSH_NEW_CHAIN = 'newChain'
}

export enum WsDestination {
    SINGLE = 'single',
    ALL = 'all'
}
