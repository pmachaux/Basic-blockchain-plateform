import {BlockFactory} from '../factories/block.factory';
import {BlockValidityUtils} from '../utils/block-validity.utils';
import {StateManager} from '../../state/state-manager';
import {Block} from '../models/block.model';
import {BlockchainFactory} from '../factories/blockchain.factory';
import {Blockchain} from '../models/blockchain.model';
import {MinerService} from '../../miner/miner.service';

export class BlockchainService {
    constructor(
        private stateManager: StateManager,
        private blockFactory: BlockFactory,
        private blockChainFactory: BlockchainFactory,
        private blockChainUtils: BlockValidityUtils,
        private minerService: MinerService,
    ) {}

    doesBlockchainExists(id: string): boolean {
        const allChains = this.getAllBlockchainsIdentifiers();
        return allChains.some(x => x.id === id);
    }

    doesBlockchainNameAlreadyInUse(name: string): boolean {
        const allChains = this.getAllBlockchainsIdentifiers();
        return allChains.some(x => x.name === name);
    }

    getAllChains(): Array<Blockchain> {
        return this.stateManager.getAllChains();
    }

    getAllBlockchainsIdentifiers(): Array<Pick<Blockchain, 'id' | 'name'>> {
        return this.getAllChains().map(x => ({id: x.id, name: x.name}));
    }

    initBlockChain(name: string): string | null {
        const blockchain = this.blockChainFactory.createNewBlockChain(name);
        try {
            this.stateManager.setNewChain(blockchain);
            return blockchain.id;
        } catch {
            return null;
        }
    }

    getAllBlocks(blockchainId?: string): Block[] {
        return this.stateManager.getBlocksFromChain(blockchainId);
    }

    getLatestBlock(blockchainId?: string): Block {
        const blockchain = this.stateManager.getBlocksFromChain(blockchainId);
        return blockchain.length > 0 ? blockchain[blockchain.length - 1] : null;
    }

    selectChainToMine(id: string): Pick<Blockchain, 'id' | 'name'> {
        let currentIdMined = this.stateManager.getIdCurrentChainMined();
        if (currentIdMined !== id && this.doesBlockchainExists(id)) {
            this.minerService.stopMining();
            this.stateManager.setIdCurrentBlockChainMined(id);
            const chainToMine = this.stateManager.getChain();
            this.minerService.initMining(chainToMine);
        }
        const chainMined = this.stateManager.getChain(currentIdMined);
        return chainMined ? {name: chainMined.name, id: chainMined.id} : null;
    }

    private replaceChain(
        newBlocks: Block[],
        blocksAlreadyInChain: Block[],
    ): Promise<Block[] | any> {
        return new Promise((resolve, reject) => {
            if (newBlocks.length > blocksAlreadyInChain.length) {
                this.blockChainUtils.isValidChain(newBlocks).subscribe((isValid: boolean) => {
                    isValid ? resolve(newBlocks) : reject('The received blockchain is invalid');
                });
            }
        });
    }

    async processNewChain(chain: Blockchain): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (
                this.doesBlockchainExists(chain.id) ||
                this.doesBlockchainNameAlreadyInUse(chain.name)
            ) {
                reject('Chain already exists');
            }
            this.blockChainUtils.isValidChain(chain.blocks).subscribe((isValid: boolean) => {
                if (isValid) {
                    try {
                        this.stateManager.setNewChain(chain);
                        resolve();
                    } catch (e) {
                        reject('BlockChain with same id already exists');
                    }
                } else {
                    reject('The received blockchain is invalid');
                }
            });
        });
    }

    private handleNewConsecutiveBlock(
        latestBlockKnown: Block,
        latestBlockReceived: Block,
        chainId: string,
    ): void {
        const isDataValid = this.blockChainUtils.isDataValid(
            latestBlockReceived.data,
            this.stateManager.getData(chainId),
        );
        const isValidNewBlock = this.blockChainUtils.isValidNewBlock(
            latestBlockReceived,
            latestBlockKnown,
        );
        if (isDataValid && isValidNewBlock) {
            const blocks = [...this.stateManager.getBlocksFromChain(chainId), latestBlockReceived];
            this.stateManager.setBlocksInChain(blocks, chainId);
        }
    }

    private async handleReplaceChain(receivedBlocks: Block[], chainId: string): Promise<void> {
        try {
            const blocksStateInChain = this.stateManager.getBlocksFromChain();
            const blockChain = await this.replaceChain(receivedBlocks, blocksStateInChain);
            if (blocksStateInChain.length === blocksStateInChain.length) {
                // If the blockchain did not get any longer while processing we update
                this.stateManager.setBlocksInChain(blockChain, chainId);
            } else {
                throw new Error('Cannot process blockchain, additionnal info needed');
            }
        } catch (e) {
            console.error('blockchain invalid');
        }
    }

    async processBlockChain(data: Block[], chainId: string): Promise<void> {
        if (!this.doesBlockchainExists(chainId)) {
            throw new Error('Chain does not exists');
        }

        if (!Array.isArray(data)) {
            throw new Error('Wrong format of data');
        }
        const receivedBlocks = data.sort((a, b) => a.index - b.index);
        const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
        const latestBlockKnown = this.getLatestBlock(chainId);
        if (latestBlockReceived.index > latestBlockKnown.index) {
            if (latestBlockKnown.hash === latestBlockReceived.previousHash) {
                this.handleNewConsecutiveBlock(latestBlockKnown, latestBlockReceived, chainId);
            } else if (receivedBlocks.length === 1) {
                throw new Error('Cannot process blockchain, additionnal info needed');
            } else {
                await this.handleReplaceChain(receivedBlocks, chainId);
            }
        }
    }
}
