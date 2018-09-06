import {HashUtils} from './hash.utils';
import {Block} from '../models/block.model';
import {Observable, combineLatest} from 'rxjs';
import {map} from 'rxjs/operators';
import {VALID_GAP_BETWEEN_TIMESTAMP} from '../blockchain.const';

export class BlockValidityUtils {
  constructor(private hashUtils: HashUtils) {
    this.hashUtils = Object.freeze(hashUtils);
  }

  getBlockHashInput(block: Block | Partial<Block>): string {
    const blockKeys = Object.keys(block).filter(
      p =>
        p.toLowerCase() !== 'hash' &&
        block[p] !== null &&
        block[p] !== undefined &&
        block[p] !== '',
    );
    const sortedKeys = blockKeys.sort();
    return sortedKeys.map(x => block[x].toString()).join();
  }

  isValidNewBlock(newBlock: Block, previousBlock: Block): boolean {
    const isIndexGreater = newBlock.index > previousBlock.index;
    const isPreviousHashMatching = newBlock.previousHash === previousBlock.hash;
    const isDataFormatValid = this.isValidDataFormat(newBlock.data);
    const isValidTimeStamp = this.isValidTimeStamp(newBlock.timestamp, previousBlock.timestamp);
    if (!isIndexGreater || !isPreviousHashMatching || !isDataFormatValid || !isValidTimeStamp) {
      return false;
    }

    const isNewHashValid =
      newBlock.hash === this.hashUtils.calculateHash(this.getBlockHashInput(newBlock));
    return isNewHashValid;
  }

  private isValidDataFormat(data: any): boolean {
    // In our case it's set to true, but in general case it's worth checking integrity
    return true;
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
        const isValid = index === 0 ? true : this.isValidNewBlock(block, blockChain[index - 1]);
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
