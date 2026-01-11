import { Injectable, PipeTransform } from '@nestjs/common';
<<<<<<< HEAD
=======
import { getAppHostName } from 'src/common/utils/getAppHostName';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

@Injectable()
export class LoggingPipe implements PipeTransform {
  transform(value: any) {
<<<<<<< HEAD
=======
    console.log('getAppHostName(): ', getAppHostName());
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
    console.log('🔥 Incoming request body BEFORE validation:', value);
    return value;
  }
}
