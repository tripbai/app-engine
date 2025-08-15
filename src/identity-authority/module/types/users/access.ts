import * as Status from "./status";

/** User status that are allowed to communicate with your application */
export type Allowed = Status.Pick<"active" | "unverified">;
/** User status that are allowed, but LIMITED to communicate with your application */
export type Limited = Status.Pick<"deactivated" | "archived">;
/** User status that are PROHIBITED to communicate with your application */
export type Prohibited = Status.Pick<"banned" | "suspended">;
export type Report =
  | {
      is_user_registered: true;
      user_status: Allowed;
      token: string;
      user_id: string;
      access_type: "allowed";
    }
  | {
      is_user_registered: true;
      user_status: Limited;
      token: string;
      user_id: string;
      access_type: "limited";
    }
  | {
      is_user_registered: true;
      user_id: string;
      user_status: Prohibited;
      access_type: "prohibited";
    }
  | {
      is_user_registered: false;
    };
