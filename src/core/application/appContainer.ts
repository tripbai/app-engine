import { Container } from "inversify";

const _c = new Container();
export const appContainer = () => {
  return _c;
};
