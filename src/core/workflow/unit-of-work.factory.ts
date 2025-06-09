import { inject, injectable } from "inversify";
import { AbstractDatabaseProvider } from "../providers/database/database.provider";
import { UnitOfWork } from "./unit-of-work";

@injectable()
export class UnitOfWorkFactory {

  constructor(
    @inject(AbstractDatabaseProvider) public readonly abstractDatabaseProvider: AbstractDatabaseProvider
  ){}

  create(){
    return new UnitOfWork(
      this.abstractDatabaseProvider
    )
  }

}