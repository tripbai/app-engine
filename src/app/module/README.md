## Relationship between TripBai’s Organization and IdentityAuthority’s Tenant

TripBai’s Organization and IdentityAuthority’s Tenant represent the same entity conceptually, but within different systems. When a tenant is created in IdentityAuthority, a corresponding organization can be created in TripBai to reflect this relationship.

To establish this link, the user must first create a tenant in IdentityAuthority. Once the tenant is successfully created, IdentityAuthority issues a certification token—a cryptographically signed token that proves ownership of the tenant. This token serves as a form of authorization and verification.

The certification token must then be submitted to TripBai’s Organization Create endpoint. Upon receiving the request, TripBai validates the token to ensure it is authentic and unexpired. It also checks the token’s payload to confirm that the user making the request is indeed the owner of the tenant. If all validations pass, TripBai proceeds to create the corresponding organization.

This mechanism ensures that only legitimate tenant owners in IdentityAuthority are able to create matching organizations in TripBai, maintaining consistency and security between the two systems.