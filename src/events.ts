import { Container } from "inversify";
import { IdentityAuthorityEvents } from "./identity-authority/module/module.events";
import { TripbaiEvents } from "./app/module/module.events";

/**
 * Register events for all modules in the application.
 * This function will be called in bootstrap.ts
 * @param container
 */
export const events = (container: Container) => {
  IdentityAuthorityEvents(container);
  TripbaiEvents(container);
};
