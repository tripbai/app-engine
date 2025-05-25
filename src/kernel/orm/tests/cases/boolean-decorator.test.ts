import { describe, it } from "node:test"
import { expect } from 'chai'
import { TestUserRepository } from "../users/test-user.repository"
import { TestUser } from "../users/test-user.model"

const assert = require('assert')

describe('boolean decorator', () => {
  describe('type validation', () => {
    it('should throw an error when string is passed', () => {
      const TestUserModel = new TestUser
      expect(() => {
        // @ts-expect-error
        TestUserModel.is_verified = '2'
      }).to.throw()
    })
    it('should throw an error when any number except 1 and 0 is passed', () => {
      const TestUserModel = new TestUser
      expect(() => {
        // @ts-expect-error
        TestUserModel.is_verified = 3
      }).to.throw()
    })
    it('should throw an error when object is passed', () => {
      const TestUserModel = new TestUser
      expect(() => {
        // @ts-expect-error
        TestUserModel.is_verified = { verified: true }
      }).to.throw()
    })
    it('should accept boolean value', () => {
      const TestUserModel = new TestUser
      TestUserModel.is_verified = true
      expect(TestUserModel.is_verified).to.equal(true)
    })
    it('should accept 1 and 0 as value', () => {
      const TestUserModel = new TestUser
      // @ts-expect-error
      TestUserModel.is_verified = 0
      expect(TestUserModel.is_verified).to.equal(false)
    })
  })
})