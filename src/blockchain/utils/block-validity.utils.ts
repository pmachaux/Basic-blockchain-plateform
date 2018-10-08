import {HashUtils} from './hash.utils';
import {Block} from '../models/block.model';
import {Observable, combineLatest} from 'rxjs';
import {map} from 'rxjs/operators';
import {VALID_GAP_BETWEEN_TIMESTAMP} from '../blockchain.const';
import {DataRecord} from '../../interfaces/data.interfaces';

export class BlockValidityUtils {
    constructor(private hashUtils: HashUtils) {
        this.hashUtils = Object.freeze(hashUtils);
    }

    getBlockHashInput(block: Block | Partial<Block>): string {
        const blockKeys = Object.keys(block).filter(
            p =>
                p.toLowerCase() !== 'hash' &&
                p.toLowerCase() !== 'nonce' &&
                block[p] !== null &&
                block[p] !== undefined &&
                block[p] !== '',
        );
        const sortedKeys = blockKeys.sort();
        const completeKeys = [...sortedKeys, 'nonce'];
        return completeKeys.map(x => (block[x] ? block[x].toString() : '')).join('');
    }

    isDataValid(dataToCheck: DataRecord[], knownData: DataRecord[]): boolean {
        const sortedDataToCheck = this.sortDataRecord(dataToCheck);
        const matchingKnownData = knownData.filter(x => sortedDataToCheck.some(y => y.id === x.id));
        const sortedMatchingKnownData = this.sortDataRecord(matchingKnownData);
        return sortedDataToCheck.toString() === sortedMatchingKnownData.toString();
    }

    private sortDataRecord(list: DataRecord[]): DataRecord[] {
        return list.sort((a, b) => {
            if (a.id.toString() > b.id.toString()) {
                return 1;
            } else if (a.id.toString() < b.id.toString()) {
                return -1;
            } else {
                return 0;
            }
        });
    }

    isValidNewBlock(newBlock: Block, previousBlock: Block): boolean {
        const isIndexGreater = newBlock.index > previousBlock.index;
        const isPreviousHashMatching = newBlock.previousHash === previousBlock.hash;
        const isValidTimeStamp = this.isValidTimeStamp(newBlock.timestamp, previousBlock.timestamp);
        if (!isIndexGreater || !isPreviousHashMatching || !isValidTimeStamp) {
            return false;
        }
        const hashInput = this.getBlockHashInput(newBlock);
        const validHash = this.hashUtils.calculateHash(hashInput);
        const isNewHashValid = newBlock.hash === validHash;
        return isNewHashValid;
    }

    private isValidTimeStamp(currentTimestamp: number, previousTimestamp: number): boolean {
        const currentDate = new Date();
        return (
            previousTimestamp - VALID_GAP_BETWEEN_TIMESTAMP < currentTimestamp &&
            currentTimestamp - VALID_GAP_BETWEEN_TIMESTAMP < currentDate.getTime()
        );
    }

    isValidChain(blockChain: Block[]): Observable<boolean> {
        const blockToValidate = blockChain.map((block: Block, index: number) => {
            return Observable.create(observer => {
                const isValid =
                    index === 0 ? true : this.isValidNewBlock(block, blockChain[index - 1]);
                observer.next(isValid);
            });
        });

        return combineLatest(blockToValidate).pipe(
            map((isValidList: boolean[]) => {
                return !isValidList.some(item => !item);
            }),
        );
    }
}
