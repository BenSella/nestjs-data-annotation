The "validation-attributes-ts" project is a NestJS-based library designed to 
provide dynamic validation functionalities using decorators and custom validation 
logic. It includes a set of validation rules defined in JSON files and provides 
services and decorators that can be applied to DTOs to enforce these rules. 
The project aims to offer flexible and reusable validation mechanisms that can be 
easily integrated into other NestJS applications.

Key Features:
Custom Validators: Implements custom validation logic to handle various data 
validation scenarios.
Dynamic Validation Service: A service that applies validation rules dynamically, 
allowing for flexible and adaptable validation.
Decorator-based Validation: Uses TypeScript decorators to apply validation rules 
directly to class properties, simplifying the validation process.
Validation Rules in JSON: Includes a set of pre-defined validation rules stored in 
JSON files, which are used to validate common data formats such as emails, GUIDs, 
phone numbers, etc.
Integration Ready: Designed to be packaged and used in other NestJS projects for 
enhanced data validation.
This project is intended to streamline the validation process by providing reusable 
and configurable validation tools, making it easier to enforce data integrity and 
consistency across NestJS applications.


How to use the package on other project 
example:
root\main.ts:
"
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { writeFileSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import * as express from 'express';
async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
 
  const config = new DocumentBuilder()
  .setTitle('Employee API')
  .setDescription('API description. [Download Swagger JSON](http://localhost:3001/swagger-json)')
  .setVersion('1.0')
  .build();

  const document = SwaggerModule.createDocument(app, config);
  // Serve Swagger UI

  SwaggerModule.setup('api', app, document);
  // Save Swagger JSON

  writeFileSync(join(__dirname, '../swagger.json'), JSON.stringify(document));
  // Serve the JSON file statically

  app.use('/swagger-json', express.static(join(__dirname, '../swagger.json')));
  // Serve validation JSON

  const validationJsonPath = join(__dirname, '../node_modules/validation-attributes-ts/src/Validations');
  const validationJson = readdirSync(validationJsonPath).reduce((acc, file) => {
    const content = JSON.parse(readFileSync(join(validationJsonPath, file), 'utf8'));
    acc[file] = content;
    return acc;
  }, {});
  // app.use('/validation/json', (req, res) => {
  //   res.json(validationJson);
  // });
  await app.listen(3001);
 
}
bootstrap();
"
root\src\dto\employee.dto.ts:
"
import { ValidatedApiProperty } from 'validation-attributes-ts';
export class EmployeeDto {

  @ValidatedApiProperty('StringHeb', 'Hebrew0_20', { message: 'First Name in Hebrew must be a short Hebrew string with special characters.' })
  username: string;

  @ValidatedApiProperty('Email', 'EmailStandard', { message: 'Email address must be a standard email format, between 5 and 254 characters.' })
  email: string;

  @ValidatedApiProperty('IdentityDocuments', 'ID', { message: 'PatientID must be between 1 and 9 digits' })
  readonly PatientID: string;

  @ValidatedApiProperty('StringMultiLang', 'Multilingual0_5000', { message: 'Description must be between 1 and 5000 characters' })
  readonly Description: string;

  @ValidatedApiProperty('Guid', 'GuidSimple', { message: 'GuidSimple must be a valid standard GUID' })
  readonly SimpleGUID: string;

  @ValidatedApiProperty('Token', 'TokenAes', { message: 'Aes Token must be a valid Aes 16-256 token' })
  readonly AesToken: string;
}
"
root\src\employee.controller.ts:
"
import { Body, Controller, Post, Logger, BadRequestException } from '@nestjs/common';
import { DynamicValidationService } from 'validation-attributes-ts';
import { EmployeeDto } from './dto/employee.dto';
@Controller('employee')
export class EmployeeController {
  private readonly logger = new Logger(EmployeeController.name);
  constructor(private readonly dynamicValidationService: DynamicValidationService) {}
  @Post()
  async createEmployee(@Body() employeeDto: EmployeeDto) {
    const errors = this.dynamicValidationService.validate(employeeDto);
    if (errors.length > 0) {
      this.logger.warn(`Validation errors: ${JSON.stringify(errors)}`);
      throw new BadRequestException(errors);
    }
    return {
      message: 'Employee created successfully',
      data: employeeDto,
    };
  }
}
"
root\src\app.modules.ts:
"
import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { NestjsDataAnnotationsModule } from 'validation-attributes-ts';

@Module({
  imports: [NestjsDataAnnotationsModule],
  controllers: [EmployeeController],
  providers: [],
})
export class AppModule {}
"
```bash
Project Architecture:
"
├── libs/annotation                           
│   ├── annotation.module.js
│   ├── annotation.service.js
│   ├── custom-validators.js
│   ├── dynamic-validation.service.js
│   ├── index.js
│   ├── validated-api-property.decorator.js
│   ├── validation.service.js
│   └── Validations/
│   └── ReadMe.md     
│       ├── emails.json
│       ├── guid_validations.json
│       ├── identity_documents_validations.json
│       ├── numeric_validations.json
│       ├── phone_validations.json
│       ├── string_validations.json
│       └── token_validations.json
"
