import { Module } from '@nestjs/common';
import { ValidationService  } from './validation.service';
import { DynamicValidationService } from './dynamic-validation.service';
@Module({
  providers: [ValidationService,  DynamicValidationService],
  exports: [ValidationService,  DynamicValidationService],
})
export class NestjsDataAnnotationsModule {}
