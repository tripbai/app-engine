export type FieldDefinition = {
  name: string | symbol;
  type: "char" | "varchar" | "int" | "timestamp" | "boolean" | "json";
  is_nullable: boolean;
  length?: number;
  unique?: boolean;
  references?: {
    collection: string | null;
    field: string;
  };
};

const entities: Map<
  new (...args: any) => any,
  {
    collection: string;
    created_at: string | null;
    updated_at: string | null;
    fields: Array<FieldDefinition>;
  }
> = new Map();

export const createField = (name: string | symbol): FieldDefinition => {
  return {
    name: name,
    type: "varchar",
    is_nullable: false,
  };
};

export const getField = (
  classRef: new (...args: any) => any,
  fieldName: string | symbol
) => {
  let entity = entities.get(classRef);
  if (!entity) {
    entity = {
      collection: "",
      created_at: null,
      updated_at: null,
      fields: [],
    };
    entities.set(classRef, entity);
  }
  let fieldItem = entity.fields.find((field) => field.name === fieldName);
  if (!fieldItem) {
    fieldItem = createField(fieldName);
    entity.fields.push(fieldItem);
  }
  return fieldItem;
};

export const registerNullableField = (
  classRef: new (...args: any) => any,
  fieldName: string | symbol
) => {
  const fieldItem = getField(classRef, fieldName);
  fieldItem.is_nullable = true;
};
export const registerFieldLength = (
  classRef: new (...args: any) => any,
  fieldName: string | symbol,
  fieldValue: number
) => {
  const fieldItem = getField(classRef, fieldName);
  fieldItem.length = fieldValue;
};
export const registerFieldType = (
  classRef: new (...args: any) => any,
  fieldName: string | symbol,
  fieldType: FieldDefinition["type"]
) => {
  const fieldItem = getField(classRef, fieldName);
  fieldItem.type = fieldType;
};
export const registerAsReferenceOf = (
  classRef: new (...args: any) => any,
  fieldName: string | symbol,
  reference: new (...args: any) => any,
  referenceField: string
) => {
  const fieldItem = getField(classRef, fieldName);
  const referenceCollection = entities.get(reference);
  if (referenceCollection !== undefined) {
    fieldItem.references = {
      collection: referenceCollection.collection,
      field: referenceField,
    };
  } else {
    fieldItem.references = {
      collection: null,
      field: referenceField,
    };
  }
};
export const registerAsUniqueField = (
  classRef: new (...args: any) => any,
  fieldName: string | symbol
) => {
  const fieldItem = getField(classRef, fieldName);
  fieldItem.unique = true;
};
export const registerCollection = (
  classRef: new (...args: any) => any,
  collectionName: string
) => {
  let entity = entities.get(classRef);
  if (!entity) {
    entity = {
      collection: collectionName,
      created_at: null,
      updated_at: null,
      fields: [],
    };
    entities.set(classRef, entity);
  }
  entity.collection = collectionName;
};

export const get = () => {
  const exports: Array<{
    created_at: string | null;
    updated_at: string | null;
    collection: string;
    fields: Array<FieldDefinition>;
  }> = [];
  for (const [key, value] of entities) {
    exports.push({
      collection: value.collection,
      created_at: null,
      updated_at: null,
      fields: value.fields,
    });
  }
  return exports;
};
