import * as dataModel from '@jupiterone/data-model';
import * as deepmerge from 'deepmerge';
import { Entity } from '@jupiterone/integration-sdk-core';

function createGraphObjectSchemaValidationError<T>(
  ajv: typeof dataModel.IntegrationSchema,
  data: T,
  index: number,
) {
  const serializedData = JSON.stringify(data, null, 2);
  const serializedErrors = JSON.stringify(ajv.errors, null, 2);

  return {
    message: () =>
      `Error validating graph object against schema (data=${serializedData}, errors=${serializedErrors}, index=${index})`,
    pass: false,
  };
}

function collectSchemasFromRef(
  dataModelIntegrationSchema: typeof dataModel.IntegrationSchema,
  classSchemaRef: string,
): GraphObjectSchema[] {
  const dataModelClassSchema = dataModelIntegrationSchema.getSchema(
    classSchemaRef,
  );

  if (!dataModelClassSchema || !dataModelClassSchema.schema) {
    throw new Error(
      `Invalid _class passed in schema for "toMatchGraphObjectSchema" (_classSchemaRef=${classSchemaRef})`,
    );
  }

  const dataModelValidationSchema = dataModelClassSchema.schema as dataModel.IntegrationEntitySchema;
  let schemas: GraphObjectSchema[] = [dataModelValidationSchema];

  if (!dataModelValidationSchema.allOf) {
    return schemas;
  }

  for (const allOfProps of dataModelValidationSchema.allOf) {
    const refProp = allOfProps.$ref;
    if (!refProp) {
      continue;
    }

    schemas = schemas.concat(
      collectSchemasFromRef(dataModelIntegrationSchema, refProp),
    );
  }

  return schemas;
}

function generateEntitySchemaFromDataModelSchemas(
  schemas: GraphObjectSchema[],
) {
  const newSchemas: GraphObjectSchema[] = [];

  for (let schema of schemas) {
    // Remove schema identifying properties
    schema = {
      ...schema,
      $schema: undefined,
      $id: undefined,
      description: undefined,
    };

    if (!schema.allOf) {
      newSchemas.push(schema);
      continue;
    }

    let newSchemaProperties = {};

    // Flatten so `properties` are at the top level
    for (const allOfProp of schema.allOf) {
      if (allOfProp.$ref) {
        continue;
      }

      // Merge the internal properties without $ref's
      newSchemaProperties = deepmerge.all([newSchemaProperties, allOfProp]);
    }

    schema = deepmerge.all([
      {
        ...schema,
        allOf: undefined,
      },
      newSchemaProperties,
    ]);

    newSchemas.push(schema);
  }

  return deepmerge.all(newSchemas);
}

function graphObjectClassToSchemaRef(_class: string) {
  return `#${_class}`;
}

export interface GraphObjectSchema extends dataModel.IntegrationEntitySchema {
  $schema?: string;
  $id?: string;
  description?: string;
  additionalProperties?: boolean;
}

export function toMatchGraphObjectSchema<T extends Entity>(
  received: T | T[],
  expectedMatchSchema: GraphObjectSchema,
) {
  // Copy this so that we do not interfere with globals.
  // NOTE: The data-model should actuall expose a function for generating
  // a new object of the `IntegrationSchema`.
  const dataModelIntegrationSchema = dataModel.IntegrationSchema;
  const classSchemaConst: string[] =
    expectedMatchSchema.properties?._class?.const;

  if (!classSchemaConst || !Array.isArray(classSchemaConst)) {
    return {
      message: () =>
        'Invalid schema passed to "toMatchGraphObjectSchema". "_class" must specify the const property and must be an array.',
      pass: false,
    };
  }

  let schemas: GraphObjectSchema[] = [];

  for (const _class of classSchemaConst) {
    try {
      schemas = schemas.concat(
        collectSchemasFromRef(
          dataModelIntegrationSchema,
          graphObjectClassToSchemaRef(_class),
        ),
      );
    } catch (err) {
      return {
        message: () => `Error loading schemas for class (err=${err.message})`,
        pass: false,
      };
    }
  }

  const newEntitySchema = generateEntitySchemaFromDataModelSchemas([
    // Merging should have the highest-level schemas at the end of the array
    // so that they can override the parent classes
    ...schemas.reverse(),
    expectedMatchSchema,
  ]);

  received = Array.isArray(received) ? received : [received];

  for (let i = 0; i < received.length; i++) {
    const data = received[i];

    if (dataModelIntegrationSchema.validate(newEntitySchema, data)) {
      continue;
    }

    return createGraphObjectSchemaValidationError(
      dataModelIntegrationSchema,
      data,
      i,
    );
  }

  return {
    message: () => 'Success!',
    pass: true,
  };
}
