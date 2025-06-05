import { Application } from "../../core/application";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { MockDatabaseProvider } from "../../core/providers/database/mock/mock-database.provider";

Application.container().bind(AbstractDatabaseProvider).to(MockDatabaseProvider)