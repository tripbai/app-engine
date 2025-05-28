import { describe, it } from "node:test"
import { expect } from 'chai'
import { TestUserModel } from "../users/test-user.model"

const assert = require('assert')

describe('json decorator', () => {
  describe('type validation', () => {
    it('should throw an error when number is passed', () => {
      const TUserModel = new TestUserModel
      TUserModel.age = 27
      expect(() => {
        // @ts-expect-error
        TUserModel.metadata = 2
      }).to.throw()
    })
    it('should throw an error when boolean is passed', () => {
      const TUserModel = new TestUserModel
      TUserModel.age = 27
      expect(() => {
        // @ts-expect-error
        TUserModel.metadata = true
      }).to.throw()
    })
    it('should throw an error when object is passed', () => {
      const TUserModel = new TestUserModel
      TUserModel.age = 27
      expect(() => {
        // @ts-expect-error
        TUserModel.metadata = { prefix: 'Mr' }
      }).to.throw()
    })
    it('should throw an error when invalid json is passed', () => {
      const TUserModel = new TestUserModel
      TUserModel.age = 27
      expect(() => {
        TUserModel.metadata = `{"citizenship:"American"}`
      }).to.throw()
    })
    it('should accept valid json string value', () => {
      const TUserModel = new TestUserModel
      TUserModel.age = 27
      TUserModel.metadata = `{"citizenship":"American"}`
      expect(TUserModel.metadata).to.equal(`{"citizenship":"American"}`)
    })
  })
  describe('satifies hooks', () => {
    it('should execute validator', () => {
      const TUserModel = new TestUserModel
      TUserModel.age = 20
      expect(() => {
        TUserModel.metadata = `{"citizenship":"American"}`
      }).to.throw('American citizens cannot drink beer when under 21 years old')
    })
  })
})