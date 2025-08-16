// import { describe, it } from "node:test";
// import { expect } from "chai";
// import { Container } from "inversify";
// import { bindTripBaiTestProviders } from "../../module/dummy-providers";
// import { bind } from "../../../bindings";
// import { AbstractDatabaseProvider } from "../../../core/providers/database/database.provider";
// import { MockDatabaseProvider } from "../../../core/providers/database/mock/mock-database.provider";
// import { AbstractCacheProvider } from "../../../core/providers/cache/cache.provider";
// import { MockCacheProvider } from "../../../core/providers/cache/mock/mock-cache.provider";
// import * as Core from "../../../core/module/types";
// import { OrganizationRequesterFactory } from "../organization-requester.factory";
// import { Pseudorandom } from "../../../core/helpers/pseudorandom";
// import { OrganizationPermissionService } from "../../organizations/services/organization-permission.service";

// const container = new Container();
// bindTripBaiTestProviders(container);
// bind(container);
// container.bind(AbstractDatabaseProvider).to(MockDatabaseProvider);
// container.bind(AbstractCacheProvider).to(MockCacheProvider);

// describe("OrganizationRequester", () => {
//   describe("isWebAdmin", () => {
//     it("should return false for regular users", () => {
//       const userId = createEntityId();
//       const regularUserPermission =
//         `iauth:users:${userId}` as Core.Authorization.ConcreteToken;
//       const requester: Core.Authorization.Requester = {
//         ipAddress: "0.0.0.0",
//         userAgent: "test-agent",
//         user: { entity_id: userId, status: "active" },
//         permissions: [regularUserPermission],
//       };
//       const organizationRequesterFactory = container.get(
//         OrganizationRequesterFactory
//       );
//       const organizationRequester =
//         organizationRequesterFactory.create(requester);
//       expect(organizationRequester.isWebAdmin()).to.be.false;
//     });

//     it("should return true for web admins", () => {
//       const userId = createEntityId();
//       const webAdminPermission = `iauth:*` as Core.Authorization.ConcreteToken;
//       const requester: Core.Authorization.Requester = {
//         ipAddress: "0.0.0.0",
//         userAgent: "test-agent",
//         user: { entity_id: userId, status: "active" },
//         permissions: [webAdminPermission],
//       };
//       const organizationRequesterFactory = container.get(
//         OrganizationRequesterFactory
//       );
//       const organizationRequester =
//         organizationRequesterFactory.create(requester);
//       expect(organizationRequester.isWebAdmin()).to.be.true;
//     });

//     it("should return false for organization admins", () => {
//       const userId = createEntityId();
//       const organizationPermissionService = container.get(
//         OrganizationPermissionService
//       );
//       const organizationId = createEntityId();
//       const organizationAdminPermission =
//         organizationPermissionService.createOrganizationLevelPermission(
//           organizationId
//         );
//       const requester: Core.Authorization.Requester = {
//         ipAddress: "0.0.0.0",
//         userAgent: "test-agent",
//         user: { entity_id: userId, status: "active" },
//         permissions: [organizationAdminPermission],
//       };
//       const organizationRequesterFactory = container.get(
//         OrganizationRequesterFactory
//       );
//       const organizationRequester =
//         organizationRequesterFactory.create(requester);
//       expect(organizationRequester.isWebAdmin()).to.be.false;
//     });
//   });

//   describe("isOrganizationAdminOf", () => {
//     it("should return true for organization admins", () => {
//       const userId = createEntityId();
//       const organizationPermissionService = container.get(
//         OrganizationPermissionService
//       );
//       const organizationId = createEntityId();
//       const organizationAdminPermission =
//         organizationPermissionService.createOrganizationLevelPermission(
//           organizationId
//         );
//       const requester: Core.Authorization.Requester = {
//         ipAddress: "0.0.0.0",
//         userAgent: "test-agent",
//         user: { entity_id: userId, status: "active" },
//         permissions: [organizationAdminPermission],
//       };
//       const organizationRequesterFactory = container.get(
//         OrganizationRequesterFactory
//       );
//       const organizationRequester =
//         organizationRequesterFactory.create(requester);
//       expect(organizationRequester.isOrganizationAdminOf(organizationId)).to.be
//         .true;
//     });

//     it("should return false if the organization ID does not match", () => {
//       const userId = createEntityId();
//       const organizationPermissionService = container.get(
//         OrganizationPermissionService
//       );
//       const organizationId = createEntityId();
//       const organizationAdminPermission =
//         organizationPermissionService.createOrganizationLevelPermission(
//           organizationId
//         );
//       const requester: Core.Authorization.Requester = {
//         ipAddress: "0.0.0.0",
//         userAgent: "test-agent",
//         user: { entity_id: userId, status: "active" },
//         permissions: [organizationAdminPermission],
//       };
//       const organizationId2 = createEntityId();
//       const organizationRequesterFactory = container.get(
//         OrganizationRequesterFactory
//       );
//       const organizationRequester =
//         organizationRequesterFactory.create(requester);
//       expect(organizationRequester.isOrganizationAdminOf(organizationId2)).to.be
//         .false;
//     });

//     it("should return false for regular users", () => {
//       const userId = createEntityId();
//       const regularUserPermission =
//         `iauth:users:${userId}` as Core.Authorization.ConcreteToken;
//       const requester: Core.Authorization.Requester = {
//         ipAddress: "0.0.0.0",
//         userAgent: "test-agent",
//         user: { entity_id: userId, status: "active" },
//         permissions: [regularUserPermission],
//       };
//       const organizationRequesterFactory = container.get(
//         OrganizationRequesterFactory
//       );
//       const organizationRequester =
//         organizationRequesterFactory.create(requester);
//       expect(organizationRequester.isOrganizationAdminOf(createEntityId())).to
//         .be.false;
//     });

//     it("should return true for web admins", () => {
//       // Web admins should be considered organization admins
//       const userId = createEntityId();
//       const webAdminPermission = `iauth:*` as Core.Authorization.ConcreteToken;
//       const requester: Core.Authorization.Requester = {
//         ipAddress: "0.0.0.0",
//         userAgent: "test-agent",
//         user: { entity_id: userId, status: "active" },
//         permissions: [webAdminPermission],
//       };
//       const organizationRequesterFactory = container.get(
//         OrganizationRequesterFactory
//       );
//       const organizationRequester =
//         organizationRequesterFactory.create(requester);
//       expect(organizationRequester.isOrganizationAdminOf(createEntityId())).to
//         .be.true;
//     });

//     it("should return false for requesters with store level permissions", () => {
//       const userId = createEntityId();
//       const organizationPermissionService = container.get(
//         OrganizationPermissionService
//       );
//       const organizationId = createEntityId();
//       const storeId = createEntityId();
//       const storePermission =
//         organizationPermissionService.createStoreLevelPermission({
//           storeId,
//           organizationId,
//         });
//       const requester: Core.Authorization.Requester = {
//         ipAddress: "0.0.0.0",
//         userAgent: "test-agent",
//         user: { entity_id: userId, status: "active" },
//         permissions: [storePermission],
//       };
//       const organizationRequesterFactory = container.get(
//         OrganizationRequesterFactory
//       );
//       const organizationRequester =
//         organizationRequesterFactory.create(requester);
//       // Even the organization id matches, store level permissions should not grant organization admin rights
//       expect(organizationRequester.isOrganizationAdminOf(organizationId)).to.be
//         .false;
//     });
//   });

//   describe("canOperateStore", () => {
//     it("should return true for organization admins", () => {
//       const userId = createEntityId();
//       const organizationPermissionService = container.get(
//         OrganizationPermissionService
//       );
//       const organizationId = createEntityId();
//       const organizationAdminPermission =
//         organizationPermissionService.createOrganizationLevelPermission(
//           organizationId
//         );
//       const requester: Core.Authorization.Requester = {
//         ipAddress: "0.0.0.0",
//         userAgent: "test-agent",
//         user: { entity_id: userId, status: "active" },
//         permissions: [organizationAdminPermission],
//       };
//       const organizationRequesterFactory = container.get(
//         OrganizationRequesterFactory
//       );
//       const organizationRequester =
//         organizationRequesterFactory.create(requester);
//       const storeId = createEntityId();
//       // This should return true as long as the organization ID matches
//       expect(organizationRequester.canOperateStore({ storeId, organizationId }))
//         .to.be.true;
//     });

//     it("should return false if the organization ID does not match", () => {
//       const userId = createEntityId();
//       const organizationPermissionService = container.get(
//         OrganizationPermissionService
//       );
//       const organizationId = createEntityId();
//       const organizationAdminPermission =
//         organizationPermissionService.createOrganizationLevelPermission(
//           organizationId
//         );
//       const requester: Core.Authorization.Requester = {
//         ipAddress: "0.0.0.0",
//         userAgent: "test-agent",
//         user: { entity_id: userId, status: "active" },
//         permissions: [organizationAdminPermission],
//       };
//       const organizationId2 = createEntityId();
//       const organizationRequesterFactory = container.get(
//         OrganizationRequesterFactory
//       );
//       const organizationRequester =
//         organizationRequesterFactory.create(requester);
//       const storeId = createEntityId();
//       // This should return false as the organization ID does not match
//       expect(
//         organizationRequester.canOperateStore({
//           storeId,
//           organizationId: organizationId2,
//         })
//       ).to.be.false;
//     });

//     it("should return true for web admins", () => {
//       const userId = createEntityId();
//       const webAdminPermission = `iauth:*` as Core.Authorization.ConcreteToken;
//       const requester: Core.Authorization.Requester = {
//         ipAddress: "0.0.0.0",
//         userAgent: "test-agent",
//         user: { entity_id: userId, status: "active" },
//         permissions: [webAdminPermission],
//       };
//       const organizationRequesterFactory = container.get(
//         OrganizationRequesterFactory
//       );
//       const organizationRequester =
//         organizationRequesterFactory.create(requester);
//       const storeId = createEntityId();
//       // Web admins should be able to operate any store
//       expect(
//         organizationRequester.canOperateStore({
//           storeId,
//           organizationId: createEntityId(),
//         })
//       ).to.be.true;
//     });

//     it("should return false for regular users", () => {
//       const userId = createEntityId();
//       const regularUserPermission =
//         `iauth:users:${userId}` as Core.Authorization.ConcreteToken;
//       const requester: Core.Authorization.Requester = {
//         ipAddress: "0.0.0.0",
//         userAgent: "test-agent",
//         user: { entity_id: userId, status: "active" },
//         permissions: [regularUserPermission],
//       };
//       const organizationRequesterFactory = container.get(
//         OrganizationRequesterFactory
//       );
//       const organizationRequester =
//         organizationRequesterFactory.create(requester);
//       const storeId = createEntityId();
//       // Regular users should not be able to operate any store
//       expect(
//         organizationRequester.canOperateStore({
//           storeId,
//           organizationId: createEntityId(),
//         })
//       ).to.be.false;
//     });

//     it("should return false if store ID does not match", () => {
//       const userId = createEntityId();
//       const organizationPermissionService = container.get(
//         OrganizationPermissionService
//       );
//       const organizationId = createEntityId();
//       const storeIdPermittedToAccess = createEntityId();
//       const storePermission =
//         organizationPermissionService.createStoreLevelPermission({
//           storeId: storeIdPermittedToAccess,
//           organizationId,
//         });
//       const requester: Core.Authorization.Requester = {
//         ipAddress: "0.0.0.0",
//         userAgent: "test-agent",
//         user: { entity_id: userId, status: "active" },
//         permissions: [storePermission],
//       };
//       const organizationRequesterFactory = container.get(
//         OrganizationRequesterFactory
//       );
//       const organizationRequester =
//         organizationRequesterFactory.create(requester);
//       const storeIdNotPermittedToAccess = createEntityId();
//       // This should return false as the store ID does not match
//       expect(
//         organizationRequester.canOperateStore({
//           storeId: storeIdNotPermittedToAccess,
//           organizationId,
//         })
//       ).to.be.false;
//     });
//   });
// });
