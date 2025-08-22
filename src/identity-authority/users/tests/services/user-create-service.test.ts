import { expect } from "chai";
import { UserCreateService } from "../../services/user-create.service";
import { UserConstraintService } from "../../services/user-constraint.service";
import { RecordAlreadyExistsException } from "../../../../core/exceptions/exceptions";
import { UserPasswordService } from "../../services/user-password.service";
import { UserOTPService } from "../../services/user-otp.service";
import * as IdentityAuthority from "../../../module/types";
import { createMock } from "../../../../core/utilities/mockup";
import { UserRepository } from "../../user.repository";
import { UnitOfWork } from "../../../../core/workflow/unit-of-work";

describe("UserCreateService", () => {
  describe("createUser()", () => {
    it("should throw an error when isUniqueEmailAddress throws an error", async () => {
      const alreadyExistEmail = "existingemail@example.com";
      const userConstraintService = createMock(UserConstraintService, {
        isUniqueEmailAddress: async () => {
          throw new RecordAlreadyExistsException({
            message: "user already exists with the same email address",
            data: { email_address: alreadyExistEmail },
          });
        },
        isUniqueUsername: async () => {
          return "<unique_username>" as IdentityAuthority.Users.Fields.UniqueUsername;
        },
      });
      const userRepository = createMock(UserRepository);
      const service = new UserCreateService(
        new UserPasswordService(),
        new UserOTPService(),
        userConstraintService,
        userRepository
      );
      try {
        await service.createUser(
          "iauth",
          "sampleusername" as IdentityAuthority.Users.Fields.Username,
          alreadyExistEmail as IdentityAuthority.Users.Fields.EmailAddress,
          "helloworld" as IdentityAuthority.Users.Fields.RawPassword,
          "concrete",
          "external",
          "user",
          "active",
          createMock(UnitOfWork)
        );
        throw new Error("Expected service.create() to throw");
      } catch (err) {
        expect(err).to.be.instanceOf(RecordAlreadyExistsException);
        expect((err as RecordAlreadyExistsException).message).to.equal(
          "user already exists with the same email address"
        );
      }
    });

    it("should throw an error when isUniqueUsername throws an error", async () => {
      const alreadyExistUsername = "existingusername";
      const userConstraintService = createMock(UserConstraintService, {
        isUniqueEmailAddress: async () => {
          return "<unique_email>" as IdentityAuthority.Users.Fields.UniqueEmailAddress;
        },
        isUniqueUsername: async () => {
          throw new RecordAlreadyExistsException({
            message: "user already exists with the same username",
            data: { username: alreadyExistUsername },
          });
        },
      });
      const userRepository = createMock(UserRepository);
      const service = new UserCreateService(
        new UserPasswordService(),
        new UserOTPService(),
        userConstraintService,
        userRepository
      );
      try {
        await service.createUser(
          "iauth",
          alreadyExistUsername as IdentityAuthority.Users.Fields.Username,
          "sampleemail@gmail.com" as IdentityAuthority.Users.Fields.EmailAddress,
          "helloworld" as IdentityAuthority.Users.Fields.RawPassword,
          "concrete",
          "external",
          "user",
          "active",
          createMock(UnitOfWork)
        );
        throw new Error("Expected service.create() to throw");
      } catch (err) {
        expect(err).to.be.instanceOf(RecordAlreadyExistsException);
        expect((err as RecordAlreadyExistsException).message).to.equal(
          "user already exists with the same username"
        );
      }
    });
  });
});
