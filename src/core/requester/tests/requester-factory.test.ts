import { expect } from "chai";
import { Container } from "inversify";
import { RequesterIdentityFactory } from "../requester-identity.factory";
import { PublicRequester } from "../requester-public";
import { RequesterTokenService } from "../requester-token.service";
import { JsonWebToken } from "../../providers/jwt/jsonwebtoken/json-web-token.service";
import { BaseRequester } from "../requester-base";
import { AbstractJWTProvider } from "../../providers/jwt/jwt.provider";

describe("RequesterFactory", () => {
  describe("create()", () => {
    it("should create public requester if the token is null", () => {
      const container = new Container();
      container.bind(AbstractJWTProvider).to(JsonWebToken);
      container.bind(RequesterTokenService).toSelf();
      container.bind(RequesterIdentityFactory).toSelf();
      const requesterFactory = container.get(RequesterIdentityFactory);
      expect(
        requesterFactory.create({
          token: null,
          ipAddress: "0.0.0.0",
          userAgent: "test",
        })
      ).to.instanceOf(PublicRequester);
    });

    it("should create public requester if there is no payload data in the token", () => {
      const container = new Container();
      // @ts-expect-error
      const testPayload: { iss: unknown; aud: unknown; data: unknown } = {
        iss: "core/requester",
        aud: "test",
      };
      class RequesterTokenServiceTest extends RequesterTokenService {
        parse() {
          return { iss: this.issuer, aud: "", data: testPayload };
        }
      }
      container.bind(RequesterTokenService).to(RequesterTokenServiceTest);
      container.bind(RequesterIdentityFactory).toSelf();
      const requesterFactory = container.get(RequesterIdentityFactory);
      expect(
        requesterFactory.create({
          token: "mocktoken",
          ipAddress: "0.0.0.0",
          userAgent: "test",
        })
      ).to.instanceOf(PublicRequester);
    });

    it("should create public requester if there is no user data in the token", () => {
      const container = new Container();
      const testPayload: { iss: unknown; aud: unknown; data: unknown } = {
        iss: "core/requester",
        aud: "test",
        data: { permissions: ["users:1838127318271123"] },
      };
      class RequesterTokenServiceTest extends RequesterTokenService {
        parse() {
          return { iss: this.issuer, aud: "", data: testPayload };
        }
      }
      container.bind(RequesterTokenService).to(RequesterTokenServiceTest);
      container.bind(RequesterIdentityFactory).toSelf();
      const requesterFactory = container.get(RequesterIdentityFactory);
      expect(
        requesterFactory.create({
          token: "mocktoken",
          ipAddress: "0.0.0.0",
          userAgent: "test",
        })
      ).to.instanceOf(PublicRequester);
    });

    it("should create public requester if the user status is invalid in the token", () => {
      const container = new Container();
      const testPayload: { iss: unknown; aud: unknown; data: unknown } = {
        iss: "core/requester",
        aud: "test",
        data: {
          user: { id: "test", status: "invalid-status" },
          permissions: ["users:1838127318271123"],
        },
      };
      class RequesterTokenServiceTest extends RequesterTokenService {
        parse() {
          return { iss: this.issuer, aud: "", data: testPayload };
        }
      }
      container.bind(RequesterTokenService).to(RequesterTokenServiceTest);
      container.bind(RequesterIdentityFactory).toSelf();
      const requesterFactory = container.get(RequesterIdentityFactory);
      expect(
        requesterFactory.create({
          token: "mocktoken",
          ipAddress: "0.0.0.0",
          userAgent: "test",
        })
      ).to.instanceOf(PublicRequester);
    });

    it("should successfully create requester given all the validations passed", () => {
      const container = new Container();
      const testPayload: { iss: unknown; aud: unknown; data: unknown } = {
        iss: "core/requester",
        aud: "test",
        data: {
          user: { id: "test", status: "active" },
          permissions: ["users:1838127318271123"],
        },
      };
      class RequesterTokenServiceTest extends RequesterTokenService {
        parse() {
          return { iss: this.issuer, aud: "", data: testPayload };
        }
      }
      container.bind(RequesterTokenService).to(RequesterTokenServiceTest);
      container.bind(RequesterIdentityFactory).toSelf();
      const requesterFactory = container.get(RequesterIdentityFactory);
      expect(
        requesterFactory.create({
          token: "mocktoken",
          ipAddress: "0.0.0.0",
          userAgent: "test",
        })
      ).to.instanceOf(BaseRequester);
    });
  });
});
