import { describe, it } from "node:test"
import { expect } from 'chai'
import { TestUserModel } from "../users/test-user.model"

const assert = require('assert')

describe('int decorator', () => {
  describe('type validation', () => {
    it('should throw an error when string is passed', () => {
      const TUserModel = new TestUserModel
      expect(() => {
        // @ts-expect-error
        TUserModel.age = '2'
      }).to.throw()
    })
    it('should throw an error when boolean is passed', () => {
      const TUserModel = new TestUserModel
      expect(() => {
        // @ts-expect-error
        TUserModel.age = true
      }).to.throw()
    })
    it('should throw an error when object is passed', () => {
      const TUserModel = new TestUserModel
      expect(() => {
        // @ts-expect-error
        TUserModel.age = { isOver18: true }
      }).to.throw()
    })
    it('should accept number value', () => {
      const TUserModel = new TestUserModel
      TUserModel.age = 18
      expect(TUserModel.age).to.equal(18)
    })
  })
  describe('validator hooks', () => {
    it('should execute validator', () => {
      const TUserModel = new TestUserModel
      expect(() => {
        TUserModel.age = 14
      }).to.throw('age should be more than 18')
    })
  })
})