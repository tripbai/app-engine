export type Status =
  | "active"
  | "unverified"
  | "banned"
  | "archived"
  | "suspended"
  | "deactivated";
export type Data = { entity_id: string; status: Status };
