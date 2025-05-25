import { describe, it } from "node:test"
import { expect } from 'chai'
import { TestUserRepository } from "../users/test-user.repository"
import { TestUser } from "../users/test-user.model"

const assert = require('assert')

describe('json decorator', () => {
  describe('type validation', () => {
    it('should throw an error when number is passed', () => {
      const TestUserModel = new TestUser
      TestUserModel.age = 27
      expect(() => {
        // @ts-expect-error
        TestUserModel.metadata = 2
      }).to.throw()
    })
    it('should throw an error when boolean is passed', () => {
      const TestUserModel = new TestUser
      TestUserModel.age = 27
      expect(() => {
        // @ts-expect-error
        TestUserModel.metadata = true
      }).to.throw()
    })
    it('should throw an error when object is passed', () => {
      const TestUserModel = new TestUser
      TestUserModel.age = 27
      expect(() => {
        // @ts-expect-error
        TestUserModel.metadata = { prefix: 'Mr' }
      }).to.throw()
    })
    it('should throw an error when invalid json is passed', () => {
      const TestUserModel = new TestUser
      TestUserModel.age = 27
      expect(() => {
        TestUserModel.metadata = `{"citizenship:"American"}`
      }).to.throw()
    })
    it('should accept valid json string value', () => {
      const TestUserModel = new TestUser
      TestUserModel.age = 27
      TestUserModel.metadata = `{"citizenship":"American"}`
      expect(TestUserModel.metadata).to.equal(`{"citizenship":"American"}`)
    })
  })
  describe('satifies hooks', () => {
    it('should execute validator', () => {
      const TestUserModel = new TestUser
      TestUserModel.age = 20
      expect(() => {
        TestUserModel.metadata = `{"citizenship":"American"}`
      }).to.throw('American citizens cannot drink beer when under 21 years old')
    })
  })
})