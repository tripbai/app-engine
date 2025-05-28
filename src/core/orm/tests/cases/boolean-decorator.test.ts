import { describe, it } from "node:test"
import { expect } from 'chai'
import { TestUserModel } from "../users/test-user.model"

const assert = require('assert')

describe('boolean decorator', () => {
  describe('type validation', () => {
    it('should throw an error when string is passed', () => {
      const TUserModel = new TestUserModel
      expect(() => {
        // @ts-expect-error
        TUserModel.is_verified = '2'
      }).to.throw()
    })
    it('should throw an error when any number except 1 and 0 is passed', () => {
      const TUserModel = new TestUserModel
      expect(() => {
        // @ts-expect-error
        TUserModel.is_verified = 3
      }).to.throw()
    })
    it('should throw an error when object is passed', () => {
      const TUserModel = new TestUserModel
      expect(() => {
        // @ts-expect-error
        TUserModel.is_verified = { verified: true }
      }).to.throw()
    })
    it('should accept boolean value', () => {
      const TUserModel = new TestUserModel
      TUserModel.is_verified = true
      expect(TUserModel.is_verified).to.equal(true)
    })
    it('should accept 1 and 0 as value', () => {
      const TUserModel = new TestUserModel
      // @ts-expect-error
      TUserModel.is_verified = 0
      expect(TUserModel.is_verified).to.equal(false)
    })
  })
})