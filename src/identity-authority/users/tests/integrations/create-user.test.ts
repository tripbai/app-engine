import { describe, it } from "node:test";
import { expect } from "chai";
import { Container } from "inversify";
import { bindDummyProviders } from "./dummy-providers";
import { CreateUserCommand } from "../../commands/create-user.command";
import { bind } from "../../../../bindings";
import {
  AbstractDatabaseProvider,
  DatabaseTransactionStep,
} from "../../../../core/providers/database/database.provider";
import { Pseudorandom } from "../../../../core/helpers/pseudorandom";
import { UserModel } from "../../user.model";
import { getJohnUserModel } from "./dummy-users";
import * as IdentityAuthority from "../../../module/types";

const container = new Container();
bindDummyProviders(container);
bind(container);
const createUserCommand = container.get(CreateUserCommand);

const seedDatabase = async () => {
  const database = container.get(AbstractDatabaseProvider);
  const John = await getJohnUserModel();
  await database.useQuery({
    type: "create",
    query: "users",
    // @ts-expect-error
    data: John,
  });
};

describe("Create User Integration", async () => {
  await seedDatabase();
  it("should not create with invalid parameter combinations", async () => {
    try {
      // @ts-expect-error
      await createUserCommand.execute({
        provider: "iauth",
        type: "concrete",
        creation_context: "external",
        role: "webadmin",
        status: "unverified",
      });
      throw new Error("the above did not throw an error");
    } catch (error) {
      expect(error.message).to.equal("unsupported create user workflow");
    }
  });
  it("should not create without password", async () => {
    try {
      // @ts-expect-error
      await createUserCommand.execute({
        provider: "iauth",
        type: "concrete",
        creation_context: "external",
        role: "user",
        status: "unverified",
        password: null,
      });
      throw new Error("the above did not throw an error");
    } catch (error) {
      expect(error.message).to.equal("create user params validation failed");
    }
  });
  it("should not create when email address already exists", async () => {
    const UserJohn = await getJohnUserModel();
    const existingEmail = UserJohn.email_address;
    try {
      // @ts-expect-error
      await createUserCommand.execute({
        provider: "iauth",
        type: "concrete",
        creation_context: "external",
        role: "user",
        status: "unverified",
        password:
          "helloworld143!" as IdentityAuthority.Users.Fields.RawPassword,
        // @ts-expect-error
        email_address:
          existingEmail as IdentityAuthority.Users.Fields.EmailAddress,
      });
      throw new Error("the above did not throw an error");
    } catch (error) {
      expect(error.message).to.equal(
        "user already exists with the same email address"
      );
    }
  });
  it("should not create when username already exists", async () => {
    const UserJohn = await getJohnUserModel();
    const existingUsername = UserJohn.username;
    try {
      // @ts-expect-error
      await createUserCommand.execute({
        provider: "iauth",
        type: "concrete",
        creation_context: "external",
        role: "user",
        status: "unverified",
        password:
          "helloworld143!" as IdentityAuthority.Users.Fields.RawPassword,
        email_address:
          "new-email-address@example.com" as IdentityAuthority.Users.Fields.EmailAddress,
        // @ts-expect-error
        username: existingUsername as IdentityAuthority.Users.Fields.Username,
      });
      throw new Error("the above did not throw an error");
    } catch (error) {
      expect(error.message).to.equal(
        "user already exists with the same username"
      );
    }
  });
  it("should successfully create user", async () => {
    await createUserCommand.execute({
      provider: "iauth",
      type: "concrete",
      creation_context: "external",
      role: "user",
      status: "unverified",
      password: "helloworld143!" as IdentityAuthority.Users.Fields.RawPassword,
      email_address:
        "ivanjade1995@example.com" as IdentityAuthority.Users.Fields.EmailAddress,
      username: "ivanjade1995" as IdentityAuthority.Users.Fields.Username,
      first_name: "Ivan" as IdentityAuthority.Profile.Fields.FirstName,
      last_name: "Jade" as IdentityAuthority.Profile.Fields.LastName,
    });
    const database = container.get(AbstractDatabaseProvider);
    const record = await database.whereFieldHasValue(
      "users",
      "email_address",
      "ivanjade1995@example.com"
    );
    expect(record[0].username).to.equal("ivanjade1995");
  });
});
