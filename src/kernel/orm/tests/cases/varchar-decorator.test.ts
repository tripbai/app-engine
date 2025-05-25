import { describe, it } from "node:test"
import { expect } from 'chai'
import { TestUserRepository } from "../users/test-user.repository"
import { TestUser } from "../users/test-user.model"
import { SessionDBClient } from "../../../services/database/sessiondb/sessiondb"

const assert = require('assert')

describe('varchar decorator', () => {
  describe('type validation', () => {
    it('should throw an error when number is passed', () => {
      const TestUserModel = new TestUser
      expect(() => {
        // @ts-expect-error
        TestUserModel.first_name = 2
      }).to.throw()
    })
    it('should throw an error when boolean is passed', () => {
      const TestUserModel = new TestUser
      expect(() => {
        // @ts-expect-error
        TestUserModel.first_name = true
      }).to.throw()
    })
    it('should throw an error when object is passed', () => {
      const TestUserModel = new TestUser
      expect(() => {
        // @ts-expect-error
        TestUserModel.first_name = { prefix: 'Mr' }
      }).to.throw()
    })
    it('should accept string value', () => {
      const TestUserModel = new TestUser
      TestUserModel.first_name = 'John'
      expect(TestUserModel.first_name).to.equal('John')
    })
  })
  describe('validator hooks', () => {
    it('should execute validator', () => {
      const TestUserModel = new TestUser
      expect(() => {
        TestUserModel.first_name = 'Ty'
      }).to.throw('first name should be more than 3 characters')
    })
  })
})