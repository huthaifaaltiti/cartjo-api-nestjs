import { Injectable, PipeTransform } from '@nestjs/common';
import { getAppHostName } from 'src/common/utils/getAppHostName';

@Injectable()
export class LoggingPipe implements PipeTransform {
  transform(value: any) {
    console.log('getAppHostName(): ', getAppHostName());
    console.log('🔥 Incoming request body BEFORE validation:', value);
    return value;
  }
}
