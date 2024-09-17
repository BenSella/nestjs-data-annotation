import { Injectable } from '@nestjs/common';
import { ValidationService } from './validation.service';
import { ValidationError } from 'class-validator';
@Injectable()
export class DynamicValidationService {
  constructor(private readonly validationService: ValidationService) {}
  validate(data: any) {
    const errors: ValidationError[] = [];
    for (const key in data) {
      const value = data[key];
      const metadata = Reflect.getMetadata(`validation:${key}`, data);
      if (metadata) {
        const { group, subgroup } = metadata;
        const validator = this.validationService.getDynamicValidator(group, subgroup);
        let isValid = true;
        let description = '';
        if (validator) {
          const { regex, minLength, maxLength, description: desc, minValue, maxValue } = validator;
          description = desc;
          if (typeof value === 'string') {
            isValid = (minLength === undefined || value.length >= minLength) &&
                      (maxLength === undefined || value.length <= maxLength) &&
                      regex.test(value);
          } else if (typeof value === 'number') {
            isValid = (minValue === undefined || value >= minValue) &&
                      (maxValue === undefined || value <= maxValue);
          }
        } else {
          isValid = false;
          description = 'No validator found';
        }
        if (!isValid) {
          errors.push({
            property: key,
            constraints: {
              [key]: description,
            },
          });
        }
      }
    }
    return errors;
  }
}