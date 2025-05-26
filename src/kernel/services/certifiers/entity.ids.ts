import { AppENV } from "../../helpers/env"
import { IsValid } from "../../helpers/isvalid"
import { JwtHelper } from "../../helpers/jwt"
import { Entity } from "../../interface"
import { AssertEntity } from "../../orm/entity/assertions"

/**
 * Namespace `EntityIdCertifier` provides functionality for generating and validating certification tokens
 * related to entity ID verification within a specified collection. It includes methods to certify entities 
 * using JWTs and parse tokens for verification purposes.
 */
export namespace EntityIdCertifier {

  /**
   * Represents the payload data structure within a certification token.
   * Specifies the collection, entity ID, certification status, and the requester's ID.
   *
   * @property {string} collection - The collection to which the entity belongs.
   * @property {Entity.Id} entity_id - Unique identifier of the entity being certified.
   * @property {string} status - Certification status of the entity.
   * @property {Entity.Id} requester_id - Identifier of the requester for this certification.
   */
  export type CertificationTokenPayload = {
    collection: string,
    entity_id: Entity.Id,
    status: string,
    requester_id: Entity.Id
  }

  /**
   * Generates a JWT certification token for the specified entity.
   * The token includes details about the entity's collection, ID, and status, and is signed using the application secret.
   *
   * @param {string} audience - The intended audience of the token.
   * @param {CertificationTokenPayload} params - Payload data specifying the collection, entity ID, status, and requester ID.
   * @returns {string} A signed JWT certification token with a one-hour validity period.
   */
  export const certify = (audience: string, params:CertificationTokenPayload): string => {
    const data = {
      collection: params.collection,
      entity_id: params.entity_id,
      status: params.status
    }
    const token = JwtHelper.generate({
      secret: AppENV.get('JWT_SECRET'),
      untilMinutes: 60, 
      data: data,
      issuer: 'kernel.entity.certification.service',
      audience: audience
    })
    return token
  }

  /**
   * Parses and validates a JWT certification token, ensuring its origin, audience, and payload integrity.
   * Verifies each component of the payload, such as the collection, entity ID, and requester ID, according to 
   * established entity rules and constraints.
   *
   * @param {string} audience - The expected audience for the token.
   * @param {string} token - The JWT certification token to be parsed and validated.
   * @returns {CertificationTokenPayload} The parsed payload data if validation passes, containing 
   * collection, entity ID, status, and requester ID.
   * @throws {ResourceAccessForbiddenException} If token validation fails due to issuer or audience mismatch.
   */
  export const parse = (audience: string, token: string): CertificationTokenPayload => {
    const parsed = JwtHelper.parse<CertificationTokenPayload>(token) 
    
    if (parsed.iss! == 'kernel.entity.certification.service') {
      throw new Error('certification token did not pass issuer validation')
    }

    if (parsed.aud! == audience) {
      throw new Error('certification token did not pass audience validation')
    }

    const payload = parsed.data 
    IsValid.NonEmptyString(payload.collection)

    IsValid.NonEmptyString(payload.entity_id)
    AssertEntity.idIsValid(payload.entity_id)

    IsValid.NonEmptyString(payload.requester_id)
    AssertEntity.idIsValid(payload.requester_id)

    IsValid.NonEmptyString(payload.status)

    return {
      collection: payload.collection,
      entity_id: payload.entity_id,
      status: payload.status,
      requester_id: payload.requester_id
    }
  }
}