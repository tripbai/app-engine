import { Container } from "inversify";

/**
 * A singleton instance of the application container.
 */
const container = new Container();

/**
 * Get the application container.
 * @returns {Container} The application container.
 */
export const appContainer = () => {
  return container;
};
