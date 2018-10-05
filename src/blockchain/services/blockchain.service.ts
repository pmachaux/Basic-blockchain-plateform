import {BlockFactory} from '../factories/block.factory';
import {BlockValidityUtils} from '../utils/block-validity.utils';
import {StateManager} from '../../state/state-manager';
import {Block} from '../models/block.model';
import {BlockchainDifficultyUtils} from '../utils/blockchain-difficulty.utils';
import {DIFFICULTY_ADJUSTMENT_INTERVAL} from '../blockchain.const';
import {BlockchainFactory} from '../factories/blockchain.factory';
import {Blockchain} from '../models/blockchain.model';

export class BlockchainService {
  constructor(
    private stateManager: StateManager,
    private blockFactory: BlockFactory,
    private blockChainFactory: BlockchainFactory,
    private blockChainUtils: BlockValidityUtils,
  ) {}

  /*  onInit(): void {
    this.stateManager.onBlockChainChange().subscribe(() => {
      const blockChainWithNoGenesysBlock = this.stateManager
        .getBlocksFromChain()
        .filter(x => x.index.toString() !== '0');

      if (
        blockChainWithNoGenesysBlock.length % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 &&
        blockChainWithNoGenesysBlock.length > 2 * DIFFICULTY_ADJUSTMENT_INTERVAL
      ) {
        const lastestBlock = blockChainWithNoGenesysBlock[blockChainWithNoGenesysBlock.length - 1];
        const lastestBlockChecked =
          blockChainWithNoGenesysBlock[
            blockChainWithNoGenesysBlock.length - 1 - DIFFICULTY_ADJUSTMENT_INTERVAL
          ];
        const difficulty = this.blockchainDifficultyUtils.adjustDifficulty(
          lastestBlock.timestamp,
          lastestBlockChecked.timestamp,
          this.blockchainDifficultyUtils.getDifficulty(),
        );
        this.blockchainDifficultyUtils.setDifficulty(difficulty);
      }
    });
  }*/
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
    this.stateManager.setIdCurrentBlockChainMined(id);
    const chainMined = this.stateManager.getChain(this.stateManager.getIdCurrentChainMined());
    return {name: chainMined.name, id: chainMined.id};
  }

  private replaceChain(newBlocks: Block[], blocksAlreadyInChain: Block[]): Promise<Block[] | any> {
    return new Promise((resolve, reject) => {
      if (newBlocks.length > blocksAlreadyInChain.length) {
        this.blockChainUtils.isValidChain(newBlocks).subscribe((isValid: boolean) => {
          isValid ? resolve(newBlocks) : reject('The received blockchain is invalid');
        });
      }
    });
  }

  /*  generateNewBlock(data: any, id: string): Block[] {
    // Todo extract else where and update mining process

    const newBlock = this.blockFactory.generateNextBlock(
      this.stateManager.getBlocksFromChain(),
      data,
    );
    const blockChain = this.stateManager.getBlocksFromChain().concat([newBlock]);
    this.stateManager.setBlocksInChain(blockChain);
    return blockChain;
  }*/

  async processNewChain(chain: Blockchain): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.doesBlockchainExists(chain.id) || this.doesBlockchainNameAlreadyInUse(chain.name)) {
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

  async processBlockChain(data: Block[], chainId: string): Promise<void> {
    if (!this.doesBlockchainExists(chainId)) {
      throw new Error('Chain does not exists');
    }

    const blocksStateInChain = this.stateManager.getBlocksFromChain();
    if (!Array.isArray(data)) {
      throw new Error('Wrong format of data');
    }
    const receivedBlocks = data.sort((a, b) => a.index - b.index);
    const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    const latestBlockKnown = this.getLatestBlock();
    if (latestBlockReceived.index > latestBlockKnown.index) {
      if (latestBlockKnown.hash === latestBlockReceived.previousHash) {
        if (
          this.blockChainUtils.isDataValid(
            latestBlockReceived.data,
            this.stateManager.getData(chainId),
          ) &&
          this.blockChainUtils.isValidNewBlock(latestBlockReceived, latestBlockKnown)
        ) {
          const blockChain = this.stateManager.getBlocksFromChain().concat([latestBlockReceived]);
          this.stateManager.setBlocksInChain(blockChain, chainId);
        }
        return;
      } else if (receivedBlocks.length === 1) {
        throw new Error('Cannot process blockchain, additionnal info needed');
      } else {
        try {
          const blockChain = await this.replaceChain(receivedBlocks, blocksStateInChain);
          if (blocksStateInChain.length === blocksStateInChain.length) {
            // If the blockchain did not get any longer while processing we update
            this.stateManager.setBlocksInChain(blockChain, chainId);
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
