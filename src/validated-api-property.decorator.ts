import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { DynamicValidator } from './custom-validators';
import { ValidationService } from './validation.service';
interface CustomApiPropertyOptions extends ApiPropertyOptions {
  group?: string;
  subgroup?: string;
}
export function ValidatedApiProperty(group: string, subgroup: string, validationOptions?: any) {
  const validationService = new ValidationService();
  const validator = validationService.getDynamicValidator(group, subgroup);
  if (!validator) {
    throw new Error(`Validation key ${subgroup} not found in validation group ${group}.`);
  }
  // Extract the example from the description if present
  const exampleMatch = validator.description.match(/Example:\s*'([^']+)'/);
  const example = exampleMatch ? exampleMatch[1] : (
    validator.minValue !== undefined && validator.maxValue !== undefined
      ? Math.floor((validator.minValue + validator.maxValue) / 2).toString()
      : undefined
  );
  const enrichedDescription = `${validator.description} (Group: ${group}, Subgroup: ${subgroup})`;
  const apiPropertyOptions: CustomApiPropertyOptions = {
    example,
    description: enrichedDescription,
    minLength: validator.minLength,
    maxLength: validator.maxLength,
    pattern: validator.regex.source,
    group,
    subgroup,
    minimum: validator.minValue,
    maximum: validator.maxValue,
  };
  return applyDecorators(
    ApiProperty(apiPropertyOptions),
    DynamicValidator(group, subgroup, validationOptions),
  );
}