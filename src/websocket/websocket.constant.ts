export enum WsType {
    GET_ALL_BLOCKCHAIN = 'getAllBlockChain',
    GET_LATEST_BLOCK = 'getLatestBlock',
    PROCESS_BLOCKCHAIN = 'processBlockChain',
    PUSH_NEW_DATA = 'newData'
}

export enum WsDestination {
    SINGLE = 'single',
    ALL = 'all'
}
