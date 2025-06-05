import 'reflect-metadata';
import { EntityToolkit } from './entity-toolkit';
import { InvalidPropertyType } from './exceptions';
import { TimeStamp } from '../../helpers/timestamp';
import { thisJSON } from '../../helpers/thisjson';
import { EntitySchemaRegistry } from './schema-registry';
import { BaseEntity } from './base-entity';

export const fixedMetaData = Symbol('fixed')
export const nullableMetaData = Symbol('nullable')

/**
 * An Entity property decorator. This decorator asserts that 
 * once a value is given to the property, it can no more be modified. 
 */
export function fixed():any {
  return function(target,property,descriptor){
    Reflect.defineMetadata(fixedMetaData,true,target,property)
  }
}

/**
 * An Entity property decorator. This decorator asserts that 
 * a value can be null. 
 */
export function nullable(): any {
  return function(target,property,descriptor){
    EntitySchemaRegistry.register.nullableField(target.constructor, property)
    Reflect.defineMetadata(nullableMetaData,true,target,property)
  }
}

export function collection(name: string): any {
  return function(target,property,descriptor){
    EntitySchemaRegistry.register.collection(target, name)
  }
}

export function length(value: number): any {
  return function(target,property,descriptor){
    EntitySchemaRegistry.register.fieldLength(target.constructor, property, value)
  }
}

export function references<T extends new (...args: any) => any>(value: T, field: keyof InstanceType<T>): any {
  return function(target,property,descriptor){
    EntitySchemaRegistry.register.asReferenceOf(target.constructor, property, value, field as string)
  }
}

export function unique<T extends new (...args: any) => any>(): any {
  return function(target,property,descriptor){
    EntitySchemaRegistry.register.uniqueField(target.constructor, property)
  }
}


export function EntityId():any{
  return function(target,prop,descriptor){
    EntitySchemaRegistry.register.fieldType(target.constructor, prop, 'char')
    EntitySchemaRegistry.register.fieldLength(target.constructor, prop, 32)
    return {
      set: function (value: unknown) {

        /**
         * Checking whether a @fixed decorator has been applied to this 
         * property. If so, we do not allow modifying this property
         * after it has been first set 
         */
        let hasFixedMetaData = Reflect.getMetadata(fixedMetaData,target,prop)
        if (hasFixedMetaData) return 

        /**
         * Checking whether a @nullable decorator has been applied to this 
         * property. If so, we will just set the value as null and move on
         */
        let isNullableValue = Reflect.getMetadata(nullableMetaData,target,prop)
        if (isNullableValue && value===null) {
          this[EntityToolkit.PropAlias.create(prop)] = null
          return
        }

        if (typeof value !== 'string') {
          throw new InvalidPropertyType(prop,'string',value)
        }

        EntityToolkit.Assert.idIsValid(value)

        const alias = EntityToolkit.PropAlias.create(prop)
        this[alias] = value

      },
      get: function(){
        const alias = EntityToolkit.PropAlias.create(prop)
        return this[alias] ?? null
      },
      enumerable: true,
      configurable: true
    };
  }
}



/**
 * An Entity property decorator. This decorator asserts that 
 * only a value typeof string is given to this property, and that
 * the number of characters is within the min and max parameters given.
 * 
 * When no max value is given, it is by default assumes that the maximum
 * number of characters are the same with minimum (min = max)
 * 
 * @throws InvalidPropertyType when incorrect type is given to the property
 */
export function varchar(
  validator?: (value: string, params?: {[key:string]: any}) => void
):any{
  return function(target,prop,descriptor){
    EntitySchemaRegistry.register.fieldType(target.constructor, prop, 'varchar')
    return {
      set: function (value: unknown) {

        /**
         * Checking whether a @fixed decorator has been applied to this 
         * property. If so, we do not allow modifying this property
         * after it has been first set 
         */
        let hasFixedMetaData = Reflect.getMetadata(fixedMetaData,target,prop)
        if (hasFixedMetaData) return 

        /**
         * Checking whether a @nullable decorator has been applied to this 
         * property. If so, we will just set the value as null and move on
         */
        let isNullableValue = Reflect.getMetadata(nullableMetaData,target,prop)
        if (isNullableValue && value===null) {
          this[EntityToolkit.PropAlias.create(prop)] = null
          return
        }

        if (typeof value !== 'string') {
          throw new InvalidPropertyType(prop,'string',value)
        }

        if (validator !== undefined) validator(value, this)

        const alias = EntityToolkit.PropAlias.create(prop)
        this[alias] = value

      },
      get: function(){
        const alias = EntityToolkit.PropAlias.create(prop)
        return this[alias] ?? null
      },
      enumerable: true,
      configurable: true
    };
  }
}


/**
 * An Entity property decorator. This decorator asserts that only a value typeof
 * number can be given to this property.
 * 
 * @throws InvalidPropertyType - when value with type other than number is given to the property
 */
export function int(
  validator?: (value: number, params?: {[key:string]: any}) => void
): any {
  return function(target,prop,descriptor){
    EntitySchemaRegistry.register.fieldType(target.constructor, prop, 'int')
    return {
      set: function (value:number) {

        /**
         * Checking whether a @fixed decorator has been applied to this 
         * property. If so, we do not allow modifying this property
         * after it has been first set 
         */
        let hasFixedMetaData = Reflect.getMetadata(fixedMetaData,target,prop)
        if (hasFixedMetaData) return 


        /**
         * Checking whether a @nullable decorator has been applied to this 
         * property. If so, we will just set the value as null and move on
         */
        let isNullableValue = Reflect.getMetadata(nullableMetaData,target,prop)
        if (isNullableValue && value===null) {
          this[EntityToolkit.PropAlias.create(prop)] = null
          return
        }

        if (typeof value !== 'number') {
          throw new InvalidPropertyType(prop,'number',value)
        }

        if (validator !== undefined) validator(value, this)
        
        const alias = EntityToolkit.PropAlias.create(prop)
        this[alias] = value

      },
      get: function(){
        const alias = EntityToolkit.PropAlias.create(prop)
        return this[alias] ?? null
      },
      enumerable: true,
      configurable: true
    };
  }
}

/**
 * An Entity property decorator. This decorator asserts that only a value that is 
 * in the format of ISO string will be accepted
 * 
 * @throws InvalidPropertyType - when value with type other than number is given to the property
 * 
 */
export function timestamp(
  validator?: (value: string, params?: {[key:string]: any}) => void
): any{
  return function(target,prop,descriptor){
    EntitySchemaRegistry.register.fieldType(target.constructor, prop, 'timestamp')
    return {
      set: function (value: string) {

        /**
         * Checking whether a @fixed decorator has been applied to this 
         * property. If so, we do not allow modifying this property
         * after it has been first set 
         */
        let hasFixedMetaData = Reflect.getMetadata(fixedMetaData,target,prop)
        if (hasFixedMetaData) return 

        /**
         * Checking whether a @nullable decorator has been applied to this 
         * property. If so, we will just set the value as null and move on
         */
        let isNullableValue = Reflect.getMetadata(nullableMetaData,target,prop)
        if (isNullableValue && value===null) {
          this[EntityToolkit.PropAlias.create(prop)] = null
          return
        }

        if (typeof value !== 'string'){
          throw new InvalidPropertyType(prop,'string',value)
        }

        if (!TimeStamp.isValid(value)) {
          throw new InvalidPropertyType(prop,'date string in normalized format',value)
        }

        if (validator !== undefined) {
          validator(value, this)
        }

        const alias = EntityToolkit.PropAlias.create(prop)
        this[alias] = value
        

      },
      get: function(){
        const alias = EntityToolkit.PropAlias.create(prop)
        return this[alias] ?? null
      },
      enumerable: true,
      configurable: true
    };
  }
}


/**
 * An Entity property decorator. This decorator asserts that only a value typeof
 * boolean can be given to this property.
 * 
 * @throws InvalidPropertyType - when a value with type other than boolean is set to the property
 * 
 */
export function boolean(
  validator?: (value: boolean, params?: {[key:string]: any}) => void
):any{
  return function(target,prop,descriptor){
    EntitySchemaRegistry.register.fieldType(target.constructor, prop, 'boolean')
    return {
      set: function (value:boolean) {

        if (typeof value === 'number'){
          if (value < 0 || value > 1) {
            throw new InvalidPropertyType(prop,'boolean',value)
          }
          value = 1 === value
        }

        if (typeof value !== 'boolean') {
          throw new InvalidPropertyType(prop,'boolean',value)
        }

        /**
         * Checking whether a @fixed decorator has been applied to this 
         * property. If so, we do not allow modifying this property
         * after it has been first set 
         */
        let hasFixedMetaData = Reflect.getMetadata(fixedMetaData,target,prop)
        if (hasFixedMetaData) return 

        if (validator !== undefined) {
          validator(value, this)
        }

        const alias = EntityToolkit.PropAlias.create(prop)
        this[alias] = value

      },
      get: function(){
        const alias = EntityToolkit.PropAlias.create(prop)
        return this[alias] ?? null
      },
      enumerable: true,
      configurable: true
    }
  }
}


/**
 * An Entity property decorator. This decorator asserts that only a string value 
 * that can be parsed by JSON.parse can be given to this property.
 * 
 * @throws InvalidPropertyType - when a value with type other than boolean is set to the property
 * 
 */
export function json<T extends {[key:string]: any}>(
  validator?: (value: T, params?: {[key:string]: any}) => void
):any{
  return function(target,prop,descriptor){
    EntitySchemaRegistry.register.fieldType(target.constructor, prop, 'json')
    return {
      set: function (value: string) {

        if (typeof value !== 'string') {
          throw new InvalidPropertyType(prop,'string',value)
        }

        /**
         * Checking whether a @fixed decorator has been applied to this 
         * property. If so, we do not allow modifying this property
         * after it has been first set 
         */
        let hasFixedMetaData = Reflect.getMetadata(fixedMetaData,target,prop)
        if (hasFixedMetaData) return 

        if (!thisJSON.isParsable(value)) {
          throw new Error(`invalid JSON string given to property ${prop}`)
        }

        const parsed = JSON.parse(value)

        if (validator !== undefined) {
          validator(parsed, this)
        }

        const alias = EntityToolkit.PropAlias.create(prop)
        this[alias] = value

      },
      get: function(){
        const alias = EntityToolkit.PropAlias.create(prop)
        return this[alias] ?? null
      },
      enumerable: true,
      configurable: true
    }
  }
}
