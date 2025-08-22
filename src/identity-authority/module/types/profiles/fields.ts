import * as Core from "../../../../core/module/types";

/** The type of User first name */
export type FirstName = string & { minLen: 2; maxLen: 32; key: "first_name" };
/** The type of User last name */
export type LastName = string & { minLen: 2; maxLen: 32; key: "last_name" };
export type Image = Core.Uploads.FilePath;
