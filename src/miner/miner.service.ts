import {Blockchain} from '../blockchain/models/blockchain.model';
import {StateManager} from '../state/state-manager';
import {Block} from '../blockchain/models/block.model';
const {Worker} = require('worker_threads');

const workerName = './dist/miner/workers/miner-blockchain.js';

export class MinerService {
    private worker;
    private idChainMined: string;
    private isWorkerDone: boolean = true;
    constructor(private stateManager: StateManager) {
        this.stateManager.onBlockChainChange().subscribe(data => {
            if (data.id === this.idChainMined) {
                if (!this.isWorkerDone) {
                    this.stopMining();
                    console.log('mining restart');
                }
                this.initiateWorker(this.stateManager.getChain());
            }
        });
    }

    private initiateWorker(chain: Blockchain): void {
        this.isWorkerDone = false;
        this.worker = new Worker(workerName, {
            workerData: chain,
        });
        this.worker.on('message', (data: {id: string; block: Block}) => {
            this.isWorkerDone = true;
            console.log(
                'block mined: index: ' + data.block.index + ' difficulty: ' + data.block.difficulty,
            );
            this.stateManager.pushNewBlockInChain(data.block, data.id);
        });
        this.worker.on('error', error => {
            this.stopMining();
            this.initiateWorker(this.stateManager.getChain());
            console.error(error);
        });
    }

    initMining(chain: Blockchain): void {
        this.idChainMined = chain.id;
        this.initiateWorker(chain);
        this.worker.postMessage(chain);
    }

    stopMining(): void {
        if (this.worker) {
            this.worker.unref();
            this.worker.terminate();
        }
    }
}
