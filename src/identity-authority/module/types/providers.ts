export type Identity = "fireauth" | "google" | "iauth";
export type Pick<T extends Identity> = T;
export type Disregard<T extends Identity> = Exclude<Identity, T>;
