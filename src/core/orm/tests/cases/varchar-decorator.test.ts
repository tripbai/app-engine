import { describe, it } from "node:test"
import { expect } from 'chai'
import { TestUserModel } from "../users/test-user.model"

const assert = require('assert')

describe('varchar decorator', () => {
  describe('type validation', () => {
    it('should throw an error when number is passed', () => {
      const TUserModel = new TestUserModel
      expect(() => {
        // @ts-expect-error
        TUserModel.first_name = 2
      }).to.throw()
    })
    it('should throw an error when boolean is passed', () => {
      const TUserModel = new TestUserModel
      expect(() => {
        // @ts-expect-error
        TUserModel.first_name = true
      }).to.throw()
    })
    it('should throw an error when object is passed', () => {
      const TUserModel = new TestUserModel
      expect(() => {
        // @ts-expect-error
        TUserModel.first_name = { prefix: 'Mr' }
      }).to.throw()
    })
    it('should accept string value', () => {
      const TUserModel = new TestUserModel
      TUserModel.first_name = 'John'
      expect(TUserModel.first_name).to.equal('John')
    })
  })
  describe('validator hooks', () => {
    it('should execute validator', () => {
      const TUserModel = new TestUserModel
      expect(() => {
        TUserModel.first_name = 'Ty'
      }).to.throw('first name should be more than 3 characters')
    })
  })
})