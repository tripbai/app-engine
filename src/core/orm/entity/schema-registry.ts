export namespace EntitySchemaRegistry {
  export type FieldDefinition = {
    name: string
    type: 'char' | 'varchar' | 'int' | 'timestamp' | 'boolean' | 'json' 
    is_nullable: boolean
    length?: number
    unique?: boolean
    references?: {
      collection: string | null
      field: string
    }
  }
  const entities: Map<new (...args: any) => any, {
    collection: string
    created_at: string | null
    updated_at: string | null
    fields: Array<FieldDefinition>
  }> = new Map
  export namespace create {
    export const field = (name: string): FieldDefinition => {
      return {
        name: name,
        type: 'varchar',
        is_nullable: false
      }
    }
  }
  const getField = (classRef: new (...args: any) => any, fieldName: string) => {
    let entity = entities.get(classRef)
    if (!entity) {
      entity = {
        collection: '',
        created_at: null,
        updated_at: null,
        fields: []
      }
      entities.set(classRef, entity)
    }
    let fieldItem = entity.fields.find(field => field.name === fieldName)
    if (!fieldItem) {
      fieldItem = create.field(fieldName)
      entity.fields.push(fieldItem)
    }
    return fieldItem
  }
  export namespace register {
    export const nullableField = (classRef: new (...args: any) => any, fieldName: string) => {
      const fieldItem = getField(classRef, fieldName)
      fieldItem.is_nullable = true
    }
    export const fieldLength = (classRef: new (...args: any) => any, fieldName: string, fieldValue: number) => {
      const fieldItem = getField(classRef, fieldName)
      fieldItem.length = fieldValue
    }
    export const fieldType = (classRef: new (...args: any) => any, fieldName: string, fieldType: FieldDefinition['type']) => {
      const fieldItem = getField(classRef, fieldName)
      fieldItem.type = fieldType
    }
    export const asReferenceOf = (classRef: new (...args: any) => any, fieldName: string, reference: new (...args: any) => any, referenceField: string) => {
      const fieldItem = getField(classRef, fieldName)
      const referenceCollection = entities.get(reference)
      if (referenceCollection !== undefined) {
        fieldItem.references = {
          collection: referenceCollection.collection,
          field: referenceField
        }
      } else {
        fieldItem.references = {
          collection: null,
          field: referenceField
        }
      }
    }
    export const uniqueField = (classRef: new (...args: any) => any, fieldName: string) => {
      const fieldItem = getField(classRef, fieldName)
      fieldItem.unique = true
    }
    export const collection = (classRef: new (...args: any) => any, collectionName: string) => {
      let entity = entities.get(classRef)
      if (!entity) {
        entity = {
          collection: collectionName,
          created_at: null,
          updated_at: null,
          fields: []
        }
        entities.set(classRef, entity)
      }
      entity.collection = collectionName
    }
    
  }
  export const get = () => {
    const exports: Array<{
      created_at: string | null
      updated_at: string | null
      collection: string
      fields: Array<FieldDefinition>
    }> = []
    for (const [key, value] of entities) {
      exports.push({
        collection: value.collection,
        created_at: null,
        updated_at: null,
        fields: value.fields
      })
    }
    return exports
  }
}