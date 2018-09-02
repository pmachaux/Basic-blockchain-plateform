import {HashUtils} from './hash.utils';
import {BlockFactory} from '../factories/block.factory';
import {Block} from '../models/block.model';
import { Observable, combineLatest} from 'rxjs';
import {map} from 'rxjs/operators';

export class BlockValidityUtils {

    constructor(private blockFactory: BlockFactory, private hashUtils: HashUtils) {
        this.blockFactory = blockFactory;
        this.hashUtils = Object.freeze(hashUtils);
    }

    isValidNewBlock (newBlock: Block, previousBlock: Block): boolean {
        const isIndexGreater = newBlock.index > previousBlock.index;
        const isPreviousHashMatching = newBlock.previousHash === previousBlock.hash;
        if (!isIndexGreater || !isPreviousHashMatching) {
            return false;
        }
        const isNewHashValid = newBlock.hash === this.hashUtils.calculateHash(newBlock.index + newBlock.previousHash + newBlock.timestamp + newBlock.data);
        return isNewHashValid;
    }


    isValidChain(blockChain: Block[]): Observable<boolean> {
        const blockToValidate = blockChain.map((block: Block, index: number) => {
            return Observable.create(observer => {
                const isValid = index === 0 ? true : this.isValidNewBlock(block, blockChain[index - 1]);
                observer.next(isValid);
            });
        });

        return combineLatest(blockToValidate).pipe(map((isValidList: boolean[] )=> {
            return !isValidList.some(item => !item);
        }));
    }
}