import { inject, injectable } from "inversify";
import { Core } from "../../core.types";
import { JWTProviderInterface } from "../../providers/jwt/jwt.provider";
import { JsonWebToken } from "../../providers/jwt/jsonwebtoken/json-web-token.service";
import { AppENV } from "../../helpers/env";
import { IsValid } from "../../helpers/isvalid";
import { EntityToolkit } from "../../orm/entity/entity-toolkit";

/**
 * Namespace `EntityCertifier` provides functionality for generating and validating certification tokens
 * related to entity ID verification within a specified collection. It includes methods to certify entities 
 * using JWTs and parse tokens for verification purposes.
 */
@injectable()
export class EntityCertifier {

  constructor(
    @inject(JsonWebToken) public readonly JWTProvider: JWTProviderInterface
  ){}

  /**
   * Generates a JWT certification token for the specified entity.
   * The token includes details about the entity's collection, ID, and status, and is signed using the application secret.
   *
   * @param {string} audience - The intended audience of the token.
   * @param {CertificationTokenPayload} params - Payload data specifying the collection, entity ID, status, and requester ID.
   * @returns {string} A signed JWT certification token with a one-hour validity period.
   */
  certify(audience: string, params: CertificationTokenPayload): string {
    const data = {
      collection: params.collection,
      entity_id: params.entity_id,
      status: params.status
    }
    const token = this.JWTProvider.generate({
      secret: AppENV.get('JWT_SECRET'),
      untilMinutes: 60, 
      data: data,
      issuer: 'core.entity.certification.service',
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
  parse(audience: string, token: string): CertificationTokenPayload {

    const parsed = this.JWTProvider.parse(AppENV.get('JWT_SECRET'), token) 

    if (parsed.iss !== 'core.entity.certification.service') {
      throw new Error('issuer must be: core.entity.certification.service')
    }

    if (parsed.aud !== audience) {
      throw new Error('audience mismatch')
    }

    const payload = parsed.data 

    if (typeof payload !== 'object' || payload === null) {
      throw new Error('payload must be key-value pair')
    }

    if (!('collection' in payload)) {
      throw new Error('missing collection in payload')
    }
    IsValid.NonEmptyString(payload.collection)

    if (!('entity_id' in payload)) {
      throw new Error('missing entity_id in payload')
    }
    IsValid.NonEmptyString(payload.entity_id)
    EntityToolkit.Assert.idIsValid(payload.entity_id)

    if (!('requester_id' in payload)) {
      throw new Error('missing requester_id in payload')
    }
    IsValid.NonEmptyString(payload.requester_id)
    EntityToolkit.Assert.idIsValid(payload.requester_id)

    if (!('status' in payload)) {
      throw new Error('missing requester_id in payload')
    }
    IsValid.NonEmptyString(payload.status)

    return {
      collection: payload.collection,
      entity_id: payload.entity_id,
      status: payload.status,
      requester_id: payload.requester_id
    }
  }

}

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
  entity_id: Core.Entity.Id,
  status: string,
  requester_id: Core.Entity.Id
}