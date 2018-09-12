import {DataRecord} from '../interfaces/data.interfaces';

export class DataUtils {
  formatData(data: any, prefixId: string): DataRecord {
    const randomNumber = Math.random() * Math.floor(100000);
    const idSuffix = new Date().getTime().toString() + randomNumber.toString();
    return {
      id: prefixId + idSuffix,
      record: data,
    };
  }

  isDataFormatValid(dataRecord: DataRecord): boolean {
    const isIdValid = typeof dataRecord === 'string';
    return isIdValid && dataRecord.record;
  }
}
