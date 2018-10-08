import {DataUtils} from './data.utils';
import {StateManager} from '../state/state-manager';
import {DataRecord} from '../interfaces/data.interfaces';

export class DataService {
  constructor(private dataUtils: DataUtils, private stateManager: StateManager) {}

  processNewData(data: DataRecord[], chainId: string): void {
    try {
      const validData = data.filter(x => this.dataUtils.isDataFormatValid(x));
      if (validData.length > 0) {
        this.stateManager.addData([...validData], chainId);
      }
    } catch (e) {
      console.error('Invalid format of data');
    }
  }

  formatData(data: any, prefixId: string): DataRecord[] {
    if (Array.isArray(data)) {
      return data.map(x => this.dataUtils.formatData(x, prefixId));
    } else {
      return [this.dataUtils.formatData(data, prefixId)];
    }
  }
}
