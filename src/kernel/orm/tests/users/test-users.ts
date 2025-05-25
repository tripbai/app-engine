import { Entity } from "../../../interface";
import { TestUser } from "./test-user.model";

export const TestUsers: { [key: string]: TestUser} = {
  John: {
    first_name: 'John',
    age: 23,
    is_verified: true,
    enrolled_at: '2025-01-03 11:13:21',
    metadata: `{"citizenship":"American"}`,
    entity_id: 'b9b4494199694efeb66eaed03adbaf46' as Entity.Id,
    created_at: '2024-12-07 08:13:21',
    updated_at: '2024-12-07 08:13:21',
    archived_at: null
  },
  Alice: {
    first_name: 'Alice',
    age: 28,
    is_verified: false,
    enrolled_at: '2024-12-15 10:20:00',
    metadata: `{"citizenship":"Canadian"}`,
    entity_id: 'c1d2f3e4a5b6c7d8e9f0a1b2c3d4e5f6' as Entity.Id,
    created_at: '2024-12-10 09:00:00',
    updated_at: '2024-12-10 09:00:00',
    archived_at: null
  },
  Bob: {
    first_name: 'Bob',
    age: 35,
    is_verified: true,
    enrolled_at: '2025-01-05 14:30:10',
    metadata: `{"citizenship":"British"}`,
    entity_id: '1234567890abcdef1234567890abcdef' as Entity.Id,
    created_at: '2024-12-30 12:00:00',
    updated_at: '2024-12-30 12:00:00',
    archived_at: null
  },
  Carol: {
    first_name: 'Carol',
    age: 26,
    is_verified: false,
    enrolled_at: '2025-01-10 09:15:45',
    metadata: `{"citizenship":"Australian"}`,
    entity_id: 'abcdefabcdefabcdefabcdefabcdef12' as Entity.Id,
    created_at: '2025-01-01 08:45:00',
    updated_at: '2025-01-01 08:45:00',
    archived_at: null
  },
  Dave: {
    first_name: 'Dave',
    age: 30,
    is_verified: true,
    enrolled_at: '2025-01-12 16:50:00',
    metadata: `{"citizenship":"German"}`,
    entity_id: 'fedcba9876543210fedcba9876543210' as Entity.Id,
    created_at: '2025-01-10 13:30:00',
    updated_at: '2025-01-10 13:30:00',
    archived_at: null
  },
  Eve: {
    first_name: 'Eve',
    age: 24,
    is_verified: true,
    enrolled_at: '2025-01-18 11:00:00',
    metadata: `{"citizenship":"French"}`,
    entity_id: 'a1b2c3d4e5f60718293a4b5c6d7e8f90' as Entity.Id,
    created_at: '2025-01-17 10:00:00',
    updated_at: '2025-01-17 10:00:00',
    archived_at: null
  },
  Frank: {
    first_name: 'Frank',
    age: 40,
    is_verified: false,
    enrolled_at: '2025-01-25 18:30:00',
    metadata: `{"citizenship":"Japanese"}`,
    entity_id: '0f1e2d3c4b5a69788776655443322110' as Entity.Id,
    created_at: '2025-01-20 16:00:00',
    updated_at: '2025-01-20 16:00:00',
    archived_at: null
  },
  Grace: {
    first_name: 'Grace',
    age: 22,
    is_verified: true,
    enrolled_at: '2025-02-01 07:45:30',
    metadata: `{"citizenship":"Mexican"}`,
    entity_id: '1234abcd5678efgh1234abcd5678efgh' as Entity.Id,
    created_at: '2025-01-30 06:30:00',
    updated_at: '2025-01-30 06:30:00',
    archived_at: null
  },
  Heidi: {
    first_name: 'Heidi',
    age: 29,
    is_verified: false,
    enrolled_at: '2025-02-10 15:10:00',
    metadata: `{"citizenship":"Brazilian"}`,
    entity_id: '9f8e7d6c5b4a32109f8e7d6c5b4a3210' as Entity.Id,
    created_at: '2025-02-08 14:00:00',
    updated_at: '2025-02-08 14:00:00',
    archived_at: null
  },
  Ivan: {
    first_name: 'Ivan',
    age: 31,
    is_verified: true,
    enrolled_at: '2025-02-15 20:20:20',
    metadata: `{"citizenship":"Russian"}`,
    entity_id: 'ffeeddccbbaa99887766554433221100' as Entity.Id,
    created_at: '2025-02-14 19:00:00',
    updated_at: '2025-02-14 19:00:00',
    archived_at: null
  }
};

export const getTestUsers = (): {[key:string]: any} => {
  const mapped = {}
  for (const name in TestUsers) {
    mapped[TestUsers[name].entity_id] = TestUsers[name]
  }
  return JSON.parse(JSON.stringify(mapped))
}
