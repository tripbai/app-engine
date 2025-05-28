import { describe, it } from "node:test"
import { expect } from 'chai'
import { TestUserModel } from "../users/test-user.model"

const assert = require('assert')

describe('timestamp decorator', () => {
  describe('type validation', () => {
    it('should throw an error when number is passed', () => {
      const TUserModel = new TestUserModel
      expect(() => {
        // @ts-expect-error
        TUserModel.enrolled_at = 2
      }).to.throw()
    })
    it('should throw an error when boolean is passed', () => {
      const TUserModel = new TestUserModel
      expect(() => {
        // @ts-expect-error
        TUserModel.enrolled_at = true
      }).to.throw()
    })
    it('should throw an error when object is passed', () => {
      const TUserModel = new TestUserModel
      expect(() => {
        // @ts-expect-error
        TUserModel.enrolled_at = { prefix: 'Mr' }
      }).to.throw()
    })
    it('should throw an error when just any string is passed', () => {
      const TUserModel = new TestUserModel
      expect(() => {
        TUserModel.enrolled_at = '21-ajd-21'
      }).to.throw()
    })
    it('should throw an error incorrect timestamp string is passed', () => {
      const TUserModel = new TestUserModel
      expect(() => {
        TUserModel.enrolled_at = '2024-15-03 11:59:32'
      }).to.throw()
    })
    it('should accept valid timestamp value', () => {
      const TUserModel = new TestUserModel
      TUserModel.enrolled_at = '2024-12-03 11:59:32'
      expect(TUserModel.enrolled_at).to.equal('2024-12-03 11:59:32')
    })
  })
  describe('validator hooks', () => {
    it('should execute validator', () => {
      const TUserModel = new TestUserModel
      expect(() => {
        TUserModel.enrolled_at = '2022-12-03 11:59:32'
      }).to.throw('enrolled_at value should not be before 2024')
    })
  })
})