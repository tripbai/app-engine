import * as fs from 'fs'
import { EntitySchemaRegistry } from '../../orm/entity/schema-registry'

type SchemaRegistryData = {
  collection: string;
  created_at: string | null 
  updated_at: string | null
  fields: EntitySchemaRegistry.FieldDefinition[];
}[]

type ForeignKeysDeclaration = {
  field_name: string
  reference_collection: string
  reference_field: string
  is_nullable: boolean
}

/**
 * Checks if there are new tables added in the schema
 * @param existing_schema 
 * @param updated_schema 
 * @returns 
 */
const has_new_tables = (existing_schema: SchemaRegistryData, updated_schema: SchemaRegistryData) => {
  return updated_schema.length > existing_schema.length
}

/**
 * List new tables
 * @param existing_schema 
 * @param updated_schema 
 * @returns 
 */
const list_new_tables = (existing_schema: SchemaRegistryData, updated_schema: SchemaRegistryData) => {
  const existing_tables    = existing_schema.map(item => item.collection)
  const tables_from_update = updated_schema.map(item => item.collection)
  return tables_from_update.filter(item => !existing_tables.includes(item))
}

/**
 * Generates a create table query
 * @param table_name 
 * @param updated_schema 
 * @returns 
 */
const generate_create_table_query = (table_name: string, updated_schema: SchemaRegistryData) => {

  const updated_schema_table_data = updated_schema.filter(item => item.collection === table_name)[0]

  let query = `CREATE TABLE IF NOT EXISTS ${updated_schema_table_data.collection} (\n`
  query += `  \`id\` INT NOT NULL AUTO_INCREMENT,\n`
  query += `  \`entity_id\` CHAR(32) NOT NULL UNIQUE,\n`

  const foriegn_keys: Array<ForeignKeysDeclaration> = []

  for (let i = 0; i < updated_schema_table_data.fields.length; i++) {
    const field = updated_schema_table_data.fields[i]
    const name = field.name
    const type = field.type
    let is_nullable = false 
    if ('is_nullable' in field) {
      is_nullable = field.is_nullable
    }
    const length = field.length
    const unique = field.unique
  
    let sql_type = ''
  
    switch (type) {
      case 'char':
        sql_type = `CHAR(${length || 255})`
        break
      case 'varchar':
        sql_type = `VARCHAR(${length || 255})`
        break
      case 'int':
        sql_type = 'INT'
        break
      case 'timestamp':
        sql_type = 'TIMESTAMP'
        break
      case 'boolean':
        sql_type = 'BOOLEAN'
        break
      case 'json':
        sql_type = 'JSON'
        break
      default:
        throw new Error(`Unsupported field type: ${type}`)
    }
  
    query += `  \`${name}\` ${sql_type}`
    if (sql_type === 'TIMESTAMP') {
      query += is_nullable ? ' NULL' : ' NOT NULL'
    } else {
      query += is_nullable ? '' : ' NOT NULL'
    }
    if (unique) query += ' UNIQUE'
    query += ',\n'

    if (
      'references' in field && 
      field.references !== undefined && 
      'collection' in field.references
    ) {
      if (field.references.collection === null) {
        throw new Error(`failed to create foreign reference ${field.name} in table ${updated_schema_table_data.collection}`)
      } 
      foriegn_keys.push({
        field_name: field.name,
        reference_collection: field.references.collection,
        reference_field: field.references.field,
        is_nullable: is_nullable
      })
    }

  }
  query += `  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`
  query += `  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n`
  query += `  \`archived_at\` TIMESTAMP NULL,\n`

  for (let k = 0; k < foriegn_keys.length; k++) {
    const foreignKey = foriegn_keys[k]
    query += `  FOREIGN KEY (${foreignKey.field_name}) REFERENCES ${foreignKey.reference_collection}(${foreignKey.reference_field})\n`
    if (foreignKey.is_nullable) {
      query += `    ON DELETE SET NULL\n`
    } else {
      query += `    ON DELETE CASCADE\n`
    }
    query += `    ON UPDATE CASCADE,\n`
  }

  query += `  PRIMARY KEY (id)\n`
  query += `);`
  return query
}

/**
 * 
 * @param table_name 
 * @param existing_schema 
 * @param updated_schema 
 */
const add_new_table_existing = (table_name: string, existing_schema: SchemaRegistryData, updated_schema: SchemaRegistryData) => {
  const updated_schema_table_data = updated_schema.filter(item => item.collection === table_name)[0]
  updated_schema_table_data.created_at = (new Date(Date.now())).toISOString()
  updated_schema_table_data.updated_at = (new Date(Date.now())).toISOString()
  existing_schema.push(JSON.parse(JSON.stringify(updated_schema_table_data)))
}

/**
 * Generates a drop table query
 * @param table_name 
 * @returns 
 */
const generate_drop_table_query = (table_name) => {
  return `DROP TABLE ${table_name};`
}

export const get_field_changes = (
  existing_field: EntitySchemaRegistry.FieldDefinition,
  current_schema_fields: Array<EntitySchemaRegistry.FieldDefinition>
): {
  is_deleted: boolean,
  is_new: boolean,
  type: { has_changed: boolean, old_value: EntitySchemaRegistry.FieldDefinition['type'], new_value: EntitySchemaRegistry.FieldDefinition['type'] },
  is_nullable: { has_changed: boolean, old_value: boolean, new_value: boolean },
  length: { is_new: boolean, has_changed: boolean, old_value: number, new_value: number },
  unique: { has_changed: boolean, old_value: boolean, new_value: boolean },
  references_exist: { has_changed: boolean, old_value: boolean, new_value: boolean },
  references_collection: { has_changed: boolean, old_value: string, new_value: string },
  references_field: { has_changed: boolean, old_value: string, new_value: string }
} => {
  const result = {
    is_deleted: false,
    is_new: false,
    type: { has_changed: false, old_value: 'varchar' as EntitySchemaRegistry.FieldDefinition['type'], new_value: 'varchar' as EntitySchemaRegistry.FieldDefinition['type']},
    is_nullable: { has_changed: false, old_value: false, new_value: false },
    length: { is_new: false, has_changed: false, old_value: 0, new_value: 0 },
    unique: { has_changed: false, old_value: false, new_value: false },
    references_exist: { has_changed: false, old_value: false, new_value: false },
    references_collection: { has_changed: false, old_value: '', new_value: '' },
    references_field: { has_changed: false, old_value: '', new_value: '' }
  }
  const existing_field_name = existing_field.name
  const current_field = current_schema_fields.find(item => item.name === existing_field_name) 
  if (current_field === undefined) {
    result.is_deleted = true
    return result
  }

  if (existing_field.type !== current_field.type) {
    result.type.has_changed = true 
    result.type.old_value = existing_field.type
    result.type.new_value = current_field.type
  }

  if (existing_field.is_nullable !== current_field.is_nullable) {
    result.is_nullable.has_changed = true 
    result.is_nullable.old_value = existing_field.is_nullable
    result.is_nullable.new_value = current_field.is_nullable
  }

  if (current_field.length !== undefined) {
    if (existing_field.length !== undefined) {
      if (existing_field.length !== current_field.length) {
        result.length.has_changed = true 
        result.length.old_value = existing_field.length
        result.length.new_value = current_field.length
      }
    } else {
      result.length.is_new = true
      result.length.has_changed = true 
      result.length.new_value = current_field.length
    }
  }


  return result
}

export const run = (params: {
  rootdir: string
}) => {
  const current_date = (new Date(Date.now())).toISOString()
  const migration_v = current_date.replace(/:/g, '-')
  const schema_path = `${params.rootdir}/migrations/schema.json`
  const up_queries: Array<string> = []
  const down_queries: Array<string> = []
  try {

    let existing_schema: SchemaRegistryData = []
    if (fs.existsSync(schema_path)) {
      existing_schema = JSON.parse(fs.readFileSync(schema_path).toString())
    }

    const updated_schema: SchemaRegistryData = EntitySchemaRegistry.get()

    let HAS_UPDATES = false

    /** Check whether there are new tables that needs to be added */
    if (has_new_tables(existing_schema, updated_schema)) {
      HAS_UPDATES = true
      const new_tables = list_new_tables(existing_schema, updated_schema)
      new_tables.forEach(new_table => {
        up_queries.push(generate_create_table_query(new_table, updated_schema))
        add_new_table_existing(new_table, existing_schema, updated_schema)
      })
      const reversed_table_names = new_tables.slice().reverse()
      reversed_table_names.forEach(table_name => {
        down_queries.push(generate_drop_table_query(table_name))
      })
    }

    /** If there are updates since the last schema generation */
    if (HAS_UPDATES) {
      
    } 
    const pretty_json = JSON.stringify(existing_schema, null, 2)
    fs.writeFileSync(schema_path, pretty_json, 'utf8')
    fs.writeFileSync(`${params.rootdir}/migrations/up/${migration_v}.sql`, up_queries.join("\n\n"), 'utf8')
    fs.writeFileSync(`${params.rootdir}/migrations/down/${migration_v}.sql`, down_queries.join("\n\n"), 'utf8')

  } catch (error) {
    console.log(error)
  }
}