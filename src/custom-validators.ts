import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { ValidationService } from './validation.service';
@ValidatorConstraint({ async: false })
class DynamicConstraint implements ValidatorConstraintInterface {
  private regex: RegExp;
  private minLength: number;
  private maxLength: number;
  private description: string;
  private minValue?: number;
  private maxValue?: number;
  constructor(validationGroup: string, validationKey: string) {
    const validationService = new ValidationService();
    const validator = validationService.getDynamicValidator(validationGroup, validationKey);
    if (!validator) {
      throw new Error(`Validation key ${validationKey} not found in validation group ${validationGroup}.`);
    }
    this.regex = validator.regex;
    this.minLength = validator.minLength;
    this.maxLength = validator.maxLength;
    this.description = validator.description;
    this.minValue = validator.minValue;
    this.maxValue = validator.maxValue;
  }
  validate(value: any, args: ValidationArguments) {
    if (typeof value === 'number') {
      return (this.minValue === undefined || value >= this.minValue) &&
             (this.maxValue === undefined || value <= this.maxValue);
    }
    return (
      typeof value === 'string' &&
      value.length >= this.minLength &&
      value.length <= this.maxLength &&
      this.regex.test(value)
    );
  }
  defaultMessage(args: ValidationArguments) {
    return this.description;
  }
}
export function DynamicValidator(validationGroup: string, validationKey: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    const validationService = new ValidationService();
    const validator = validationService.getDynamicValidator(validationGroup, validationKey);
    if (!validator) {
      throw new Error(`Validation key ${validationKey} not found in validation group ${validationGroup}.`);
    }
    // Attach validation config to the property for use in decorators
    Reflect.defineMetadata(`validation:${propertyName}`, validator, object);
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: new DynamicConstraint(validationGroup, validationKey),
    });
  };
}