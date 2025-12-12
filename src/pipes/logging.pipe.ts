import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class LoggingPipe implements PipeTransform {
  transform(value: any) {
    console.log('process.env.HOST_NAME: ', process.env.HOST_NAME)
    console.log('🔥 Incoming request body BEFORE validation:', value);
    return value;
  }
}
