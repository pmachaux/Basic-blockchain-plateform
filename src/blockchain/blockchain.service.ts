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

    async processBlockChain(data: Block[]): Promise<Block[] | null> {
        if (!Array.isArray(data)) {
            throw new Error('Wrong format of data');
        }
        const receivedBlocks = data.sort((a, b) => (a.index - b.index));
        const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
        const latestBlockHeld = this.getLatestBlock();
        if (latestBlockReceived.index > latestBlockHeld.index) {
            console.log('index superior');
            if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
                console.log('hash match');
                const blockChain = this.stateManager.getBlockChain().concat([latestBlockReceived]);
                this.stateManager.setBlockChain(blockChain);
                return [latestBlockReceived];
            } else if (receivedBlocks.length === 1) {
                console.error('hash not match and length 1');
                throw new Error('Cannot process blockchain, additionnal info needed');
            } else {
                try {
                    console.error('try to replace chain');
                    const blockChain = await this.replaceChain(receivedBlocks, this.stateManager.getBlockChain());
                    console.error('chain replaced');
                    this.stateManager.setBlockChain(blockChain);
                } catch (e) {
                    console.error('blockchain invalid');
                } finally {
                    return null;
                }

            }
        } else {
            return null;
        }
    }
}
