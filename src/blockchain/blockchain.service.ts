import {BlockFactory} from './factories/block.factory';
import {BlockValidityUtils} from './utils/block-validity.utils';
import {StateManager} from '../state/state-manager';
import {Block} from './models/block.model';

export class BlockchainService {

    constructor(private stateManager: StateManager, private blockFactory: BlockFactory, private blockChainUtils: BlockValidityUtils) {
        this.initBlockChain();
    }

    initBlockChain(): void {
        this.stateManager.setBlockChain([this.blockFactory.createGenesisBlock()]);
    }

    getAllBlockChain(): Block[] {
        return this.stateManager.getBlockChain();
    }

    getLatestBlock(): Block {
        const blockchain = this.stateManager.getBlockChain();
        return blockchain.length > 0 ? blockchain[blockchain.length - 1] : null;
    }

    private replaceChain(newBlocks: Block[], blockChain: Block[]): Promise<Block[] | any> {
        return new Promise((resolve, reject) => {
            if (newBlocks.length > blockChain.length) {
                this.blockChainUtils.isValidChain(newBlocks).subscribe((isValid: boolean) => {
                    isValid ? resolve(newBlocks) : reject('The received blockchain is invalid');
                });
            }
        });
    }

    generateNewBlock(data: any): Block[] {
        const newBlock = this.blockFactory.generateNextBlock(this.stateManager.getBlockChain(), data);
        const blockChain = this.stateManager.getBlockChain().concat([newBlock]);
        this.stateManager.setBlockChain(blockChain);
        return blockChain;
    }

    async processBlockChain(data: Block[]): Promise<void> {
        const blockChainState = this.stateManager.getBlockChain();
        if (!Array.isArray(data)) {
            throw new Error('Wrong format of data');
        }
        const receivedBlocks = data.sort((a, b) => (a.index - b.index));
        const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
        const latestBlockKnown = this.getLatestBlock();
        if (latestBlockReceived.index > latestBlockKnown.index) {
            if (latestBlockKnown.hash === latestBlockReceived.previousHash) {
                if (this.blockChainUtils.isValidNewBlock(latestBlockReceived, latestBlockKnown))
                {
                    const blockChain = this.stateManager.getBlockChain().concat([latestBlockReceived]);
                    this.stateManager.setBlockChain(blockChain);
                }
                return;
            } else if (receivedBlocks.length === 1) {
                throw new Error('Cannot process blockchain, additionnal info needed');
            } else {
                try {
                    const blockChain = await this.replaceChain(receivedBlocks, blockChainState);
                    if (blockChainState.length === blockChainState.length) {
                        // If the blockchain did not get any longer while processing we update
                        this.stateManager.setBlockChain(blockChain);
                    } else {
                        throw new Error('Cannot process blockchain, additionnal info needed');
                    }
                } catch (e) {
                    console.error('blockchain invalid');
                } finally {
                    return;
                }

            }
        } else {
            return null;
        }
    }
}
