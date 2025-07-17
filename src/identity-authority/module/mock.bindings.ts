import { Application } from "../../core/application";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { MockDatabaseProvider } from "../../core/providers/database/mock/mock-database.provider";
import { IAuthDatabaseProvider } from "../providers/iauth-database.provider";

Application.container().bind(AbstractDatabaseProvider).to(MockDatabaseProvider)
Application.container().bind(IAuthDatabaseProvider).to(MockDatabaseProvider)