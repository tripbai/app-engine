require('../../dist/models')
const SReg    = require('../../dist/core/orm/entity/schema-registry')
const fs      = require('fs')
const path    = require('path')
const rootdir = path.resolve(__dirname, "../../")
const schema_path = `${rootdir}/migrations/schema.json`
const current_date = (new Date(Date.now())).toISOString()
const migration_v = current_date.replace(/:/g, '-')

const has_new_tables = (existing_schema, updated_schema) => {
  return updated_schema.length > existing_schema.length
}

const find_new_tables = (existing_schema, updated_schema) => {
  const existing_tables = existing_schema.map(item => item.collection)
  const tables_from_update = updated_schema.map(item => item.collection)
  return tables_from_update.filter(item => !existing_tables.includes(item))
}

const create_table_query = (table_name, updated_schema) => {
  const updated_schema_table_data = updated_schema.filter(item => item.collection === table_name)[0]

  let query = `CREATE TABLE IF NOT EXISTS ${updated_schema_table_data.collection} (\n`
  query += `  \`id\` INT NOT NULL AUTO_INCREMENT,\n`
  query += `  \`entity_id\` CHAR(32) NOT NULL UNIQUE,\n`

  const foreignKeys = []
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
    query += is_nullable ? '' : ' NOT NULL'
    if (unique) query += ' UNIQUE'
    query += ',\n'

    if ('references' in field && 'collection' && field.references.collection) {
      if (field.references.collection === null) {
        throw new Error(`failed to create foreign reference ${field.name} in table ${updated_schema_table_data.collection}`)
      } 
      foreignKeys.push({
        fieldName: field.name,
        referenceCollection: field.references.collection,
        referenceField: field.references.field
      })
    }

  }
  query += `  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`
  query += `  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n`
  query += `  \`archived_at\` TIMESTAMP,\n`

  for (let k = 0; k < foreignKeys.length; k++) {
    const foreignKey = foreignKeys[k]
    query += `  FOREIGN KEY (${foreignKey.fieldName}) REFERENCES ${foreignKey.referenceCollection}(${foreignKey.referenceField})\n`
    query += `    ON DELETE SET NULL\n`
    query += `    ON UPDATE CASCADE,\n`
  }

  query += `  PRIMARY KEY (id)\n`
  query += `);`
  return query
}

const add_new_table_existing = (table_name, existing_schema, updated_schema) => {
  const updated_schema_table_data = updated_schema.filter(item => item.collection === table_name)[0]
  updated_schema_table_data.created_at = (new Date(Date.now())).toISOString()
  updated_schema_table_data.updated_at = (new Date(Date.now())).toISOString()
  existing_schema.push(JSON.parse(JSON.stringify(updated_schema_table_data)))
}


const run = async () => {
  let queries = [] 
  try {
    let existing_schema = []
    if (fs.existsSync(schema_path)) {
      existing_schema = JSON.parse(fs.readFileSync(schema_path).toString())
    }
    const updated_schema = SReg.EntitySchemaRegistry.get()
    let HAS_UPDATES = false
    if (has_new_tables(existing_schema, updated_schema)) {
      HAS_UPDATES = true
      const new_tables = find_new_tables(existing_schema, updated_schema)
      new_tables.forEach(new_table => {
        queries.push(create_table_query(new_table, updated_schema))
        add_new_table_existing(new_table, existing_schema, updated_schema)
      })
    }
    if (HAS_UPDATES) {
      const pretty_json = JSON.stringify(existing_schema, null, 2)
      fs.writeFileSync(schema_path, pretty_json, 'utf8')
      fs.writeFileSync(`${rootdir}/migrations/${migration_v}.sql`, queries.join("\n\n"), 'utf8')
    } 
    
  } catch (error) {
    console.log(error)
  }
}

run()
