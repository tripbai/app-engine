import { describe, it } from "node:test"
import { expect } from 'chai'
import { TestUserRepository } from "../users/test-user.repository"
import { TestUser } from "../users/test-user.model"

const assert = require('assert')

describe('int decorator', () => {
  describe('type validation', () => {
    it('should throw an error when string is passed', () => {
      const TestUserModel = new TestUser
      expect(() => {
        // @ts-expect-error
        TestUserModel.age = '2'
      }).to.throw()
    })
    it('should throw an error when boolean is passed', () => {
      const TestUserModel = new TestUser
      expect(() => {
        // @ts-expect-error
        TestUserModel.age = true
      }).to.throw()
    })
    it('should throw an error when object is passed', () => {
      const TestUserModel = new TestUser
      expect(() => {
        // @ts-expect-error
        TestUserModel.age = { isOver18: true }
      }).to.throw()
    })
    it('should accept number value', () => {
      const TestUserModel = new TestUser
      TestUserModel.age = 18
      expect(TestUserModel.age).to.equal(18)
    })
  })
  describe('validator hooks', () => {
    it('should execute validator', () => {
      const TestUserModel = new TestUser
      expect(() => {
        TestUserModel.age = 14
      }).to.throw('age should be more than 18')
    })
  })
})