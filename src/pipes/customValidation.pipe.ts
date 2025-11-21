import {
  Injectable,
  ValidationPipe,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class CustomValidationPipe
  extends ValidationPipe
  implements PipeTransform
{
  constructor() {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: errors => {
        const flatten = errors => {
          return errors.flatMap(err => {
            if (err.constraints) {
              return [
                {
                  property: err.property,
                  messages: Object.values(err.constraints),
                },
              ];
            }

            if (err.children && err.children.length) {
              return flatten(err.children);
            }

            return [{ property: err.property, messages: ['Invalid value'] }];
          });
        };

        const detailed = flatten(errors);

        return new BadRequestException({
          isSuccess: false,
          statusCode: 400,
          message: 'Validation Failed',
          details: detailed,
        });
      },
    });
  }
}
