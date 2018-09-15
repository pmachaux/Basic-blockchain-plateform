import {Block} from './block.model';
import {DataRecord} from '../../interfaces/data.interfaces';

export class Blockchain {
    id: string;
    name: string;
    dataToProcess: DataRecord[] = [];
    blocks: Block[];

    constructor(id: string, name: string, blocks: Block[]) {
        this.id = id;
        this.name = name;
        this.blocks = blocks;
    }
}