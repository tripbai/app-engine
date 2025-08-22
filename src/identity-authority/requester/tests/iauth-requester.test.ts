import { expect } from "chai";
import { BaseRequester } from "../../../core/requester/requester-base";
import { PublicRequester } from "../../../core/requester/requester-public";
import * as Core from "../../../core/module/types";
import { UserPermissionService } from "../../users/services/user-permission.service";
import { IAuthRequesterFactory } from "../iauth-requester.factory";
import { createMock } from "../../../core/utilities/mockup";
import { AppAuthService } from "../../../core/auth/services/app-auth-service";
import { IAuthRequester } from "../iauth-requester";
import { createEntityId } from "../../../core/utilities/entityToolkit";

describe("IAuthRequester", () => {
  describe("hasAllowedAccess()", () => {
    it("should return false for public requesters", () => {
      const publicRequester = new PublicRequester({
        ipAddress: "",
        userAgent: "",
      });
      const userPermissionService = createMock(UserPermissionService);
      const appAuthService = createMock(AppAuthService);
      const iAuthRequester = new IAuthRequester(
        publicRequester,
        userPermissionService,
        appAuthService
      );
      expect(iAuthRequester.hasAllowedAccess()).to.equal(false);
    });

    it("should return false for requesters with not allowed access", () => {
      const userId = createEntityId();
      const userPermissionService = createMock(UserPermissionService);
      const appAuthService = createMock(AppAuthService);
      const archivedRequester = new IAuthRequester(
        new BaseRequester({
          user: { entity_id: userId, status: "archived" },
          permissions: [],
          ipAddress: "",
          userAgent: "",
        }),
        userPermissionService,
        appAuthService
      );
      const bannedRequester = new IAuthRequester(
        new BaseRequester({
          user: { entity_id: userId, status: "banned" },
          permissions: [],
          ipAddress: "",
          userAgent: "",
        }),
        userPermissionService,
        appAuthService
      );
      const deactivatedRequester = new IAuthRequester(
        new BaseRequester({
          user: { entity_id: userId, status: "deactivated" },
          permissions: [],
          ipAddress: "",
          userAgent: "",
        }),
        userPermissionService,
        appAuthService
      );
      const suspendedRequester = new IAuthRequester(
        new BaseRequester({
          user: { entity_id: userId, status: "suspended" },
          permissions: [],
          ipAddress: "",
          userAgent: "",
        }),
        userPermissionService,
        appAuthService
      );
      expect(
        !archivedRequester.hasAllowedAccess() &&
          !bannedRequester.hasAllowedAccess() &&
          !deactivatedRequester.hasAllowedAccess() &&
          !suspendedRequester.hasAllowedAccess()
      ).to.equal(true);
    });

    it("should return true for requesters with allowed access", () => {
      const userId = createEntityId();
      const userPermissionService = createMock(UserPermissionService);
      const appAuthService = createMock(AppAuthService);
      const activeRequester = new IAuthRequester(
        new BaseRequester({
          user: { entity_id: userId, status: "active" },
          permissions: [],
          ipAddress: "",
          userAgent: "",
        }),
        userPermissionService,
        appAuthService
      );
      const unverifiedRequester = new IAuthRequester(
        new BaseRequester({
          user: { entity_id: userId, status: "unverified" },
          permissions: [],
          ipAddress: "",
          userAgent: "",
        }),
        userPermissionService,
        appAuthService
      );
      expect(
        activeRequester.hasAllowedAccess() &&
          unverifiedRequester.hasAllowedAccess()
      ).to.equal(true);
    });
  });

  describe("isRegularUser()", () => {
    it("should return false for public requester", () => {
      const userId = createEntityId();
      const userPermissionService = createMock(UserPermissionService);
      const appAuthService = createMock(AppAuthService);
      const publicRequester = new IAuthRequester(
        new PublicRequester({
          ipAddress: "",
          userAgent: "",
        }),
        userPermissionService,
        appAuthService
      );
      expect(publicRequester.isRegularUser()).to.equal(false);
    });

    // it("should return true for requester with basic user permission", () => {
    //   const container = new Container();
    //   bind(container);
    //   bind_provider(container);
    //   const iauthRequesterFactory = container.get(IAuthRequesterFactory);
    //   const userPermissionService = container.get(UserPermissionService);
    //   const userId = createEntityId();
    //   const permissions = [
    //     userPermissionService.getBasicUserPermission(userId),
    //   ];
    //   const someRequester = iauthRequesterFactory.create(
    //     new BaseRequester({
    //       user: { entity_id: userId, status: "active" },
    //       permissions: permissions,
    //       ipAddress: "",
    //       userAgent: "",
    //     })
    //   );
    //   expect(someRequester.isRegularUser()).to.equal(true);
    // });

    // it("should return true for requester with web admin permission", () => {
    //   const container = new Container();
    //   bind(container);
    //   bind_provider(container);
    //   const iauthRequesterFactory = container.get(IAuthRequesterFactory);
    //   const userPermissionService = container.get(UserPermissionService);
    //   const userId = createEntityId();
    //   const permissions = [userPermissionService.getWebAdminPermission()];
    //   const someRequester = iauthRequesterFactory.create(
    //     new BaseRequester({
    //       user: { entity_id: userId, status: "active" },
    //       permissions: permissions,
    //       ipAddress: "",
    //       userAgent: "",
    //     })
    //   );
    //   expect(someRequester.isRegularUser()).to.equal(true);
    // });
  });

  // describe("isWebAdmin", () => {
  //   it("should return false for public requester", () => {
  //     const container = new Container();
  //     bind(container);
  //     bind_provider(container);
  //     const iauthRequesterFactory = container.get(IAuthRequesterFactory);
  //     const publicRequester = iauthRequesterFactory.create(
  //       new PublicRequester({
  //         ipAddress: "",
  //         userAgent: "",
  //       })
  //     );
  //     expect(publicRequester.isWebAdmin()).to.equal(false);
  //   });

  //   it("should return false for requester with basic user permission", () => {
  //     const container = new Container();
  //     bind(container);
  //     bind_provider(container);
  //     const iauthRequesterFactory = container.get(IAuthRequesterFactory);
  //     const userPermissionService = container.get(UserPermissionService);
  //     const userId = createEntityId();
  //     const permissions = [
  //       userPermissionService.getBasicUserPermission(userId),
  //     ];
  //     const someRequester = iauthRequesterFactory.create(
  //       new BaseRequester({
  //         user: { entity_id: userId, status: "active" },
  //         permissions: permissions,
  //         ipAddress: "",
  //         userAgent: "",
  //       })
  //     );
  //     expect(someRequester.isWebAdmin()).to.equal(false);
  //   });

  //   it("should return true for requester with web admin permission", () => {
  //     const container = new Container();
  //     bind(container);
  //     bind_provider(container);
  //     const iauthRequesterFactory = container.get(IAuthRequesterFactory);
  //     const userPermissionService = container.get(UserPermissionService);
  //     const userId = createEntityId();
  //     const permissions = [userPermissionService.getWebAdminPermission()];
  //     const someRequester = iauthRequesterFactory.create(
  //       new BaseRequester({
  //         user: { entity_id: userId, status: "active" },
  //         permissions: permissions,
  //         ipAddress: "",
  //         userAgent: "",
  //       })
  //     );
  //     expect(someRequester.isWebAdmin()).to.equal(true);
  //   });
  // });

  // describe("canOperateThisUser", () => {
  //   it("should return false for public requester", () => {
  //     const container = new Container();
  //     bind(container);
  //     bind_provider(container);
  //     const userIdToOperate = createEntityId();
  //     const iauthRequesterFactory = container.get(IAuthRequesterFactory);
  //     const publicRequester = iauthRequesterFactory.create(
  //       new PublicRequester({
  //         ipAddress: "",
  //         userAgent: "",
  //       })
  //     );
  //     expect(publicRequester.canOperateThisUser(userIdToOperate)).to.equal(
  //       false
  //     );
  //   });

  //   it("should return true if the requester is the user himself", () => {
  //     const container = new Container();
  //     bind(container);
  //     bind_provider(container);
  //     const userIdOfTheRequester = createEntityId();
  //     const userIdToOperate = userIdOfTheRequester;
  //     const iauthRequesterFactory = container.get(IAuthRequesterFactory);
  //     const userPermissionService = container.get(UserPermissionService);
  //     const permissions = [
  //       userPermissionService.getBasicUserPermission(userIdOfTheRequester),
  //     ];
  //     const someRequester = iauthRequesterFactory.create(
  //       new BaseRequester({
  //         user: { entity_id: userIdOfTheRequester, status: "active" },
  //         permissions: permissions,
  //         ipAddress: "",
  //         userAgent: "",
  //       })
  //     );
  //     expect(someRequester.canOperateThisUser(userIdToOperate)).to.equal(true);
  //   });

  //   it("should return false if the requester is not the user he wants to operate", () => {
  //     const container = new Container();
  //     bind(container);
  //     bind_provider(container);
  //     const userIdOfTheRequester = createEntityId();
  //     const userIdToOperate = createEntityId();
  //     const iauthRequesterFactory = container.get(IAuthRequesterFactory);
  //     const userPermissionService = container.get(UserPermissionService);
  //     const permissions = [
  //       userPermissionService.getBasicUserPermission(userIdOfTheRequester),
  //     ];
  //     const someRequester = iauthRequesterFactory.create(
  //       new BaseRequester({
  //         user: { entity_id: userIdOfTheRequester, status: "active" },
  //         permissions: permissions,
  //         ipAddress: "",
  //         userAgent: "",
  //       })
  //     );
  //     expect(someRequester.canOperateThisUser(userIdToOperate)).to.equal(false);
  //   });

  //   it("should return false if the requester is not the user he wants to operate, even if he is a moderator", () => {
  //     const container = new Container();
  //     bind(container);
  //     bind_provider(container);
  //     const userIdOfTheRequester = createEntityId();
  //     const userIdToOperate = createEntityId();
  //     const iauthRequesterFactory = container.get(IAuthRequesterFactory);
  //     const userPermissionService = container.get(UserPermissionService);
  //     const permissions = [userPermissionService.getModeratorPermission()];
  //     const someRequester = iauthRequesterFactory.create(
  //       new BaseRequester({
  //         user: { entity_id: userIdOfTheRequester, status: "active" },
  //         permissions: permissions,
  //         ipAddress: "",
  //         userAgent: "",
  //       })
  //     );
  //     expect(someRequester.canOperateThisUser(userIdToOperate)).to.equal(false);
  //   });

  //   it("should return true if the requester is not the user he wants to operate, but he is the web admin", () => {
  //     const container = new Container();
  //     bind(container);
  //     bind_provider(container);
  //     const userIdOfTheRequester = createEntityId();
  //     const userIdToOperate = createEntityId();
  //     const iauthRequesterFactory = container.get(IAuthRequesterFactory);
  //     const userPermissionService = container.get(UserPermissionService);
  //     const permissions = [userPermissionService.getWebAdminPermission()];
  //     const someRequester = iauthRequesterFactory.create(
  //       new BaseRequester({
  //         user: { entity_id: userIdOfTheRequester, status: "active" },
  //         permissions: permissions,
  //         ipAddress: "",
  //         userAgent: "",
  //       })
  //     );
  //     expect(someRequester.canOperateThisUser(userIdToOperate)).to.equal(true);
  //   });
  // });
});
