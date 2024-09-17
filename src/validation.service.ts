import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class ValidationService {
  private validationConfig: any = {
    validationGroups: []
  };
  constructor() {
    const validationsDir = path.resolve(__dirname, '../src/Validations');
    const files = fs.readdirSync(validationsDir).filter(file => file.endsWith('.json'));
    files.forEach(file => {
      const validationFilePath = path.join(validationsDir, file);
      if (fs.existsSync(validationFilePath)) {
        const fileContent = JSON.parse(fs.readFileSync(validationFilePath, 'utf-8'));
        this.validationConfig.validationGroups.push(...fileContent.validationGroups);
      } else {
        throw new Error(`Validation file not found: ${validationFilePath}`);
      }
    });
  }
  getValidationConfig() {
    return this.validationConfig;
  }
  getDynamicValidator(group: string, subgroup: string) {
    for (const validationGroup of this.validationConfig.validationGroups) {
      if (validationGroup.group === group) {
        const validator = validationGroup.subgroups.find((sub: any) => sub.name === subgroup);
        if (validator) {
          return {
            regex: new RegExp(validator.regexPattern),
            minLength: validator.minLength,
            maxLength: validator.maxLength,
            description: validator.description,
            minValue: validator.minValue,
            maxValue: validator.maxValue
          };
        }
      }
    }
    return null;
  }
}