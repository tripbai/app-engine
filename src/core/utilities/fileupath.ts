import * as Core from "../../core/module/types";
import { assertValidEntityId } from "./entityToolkit";

export function generateFileUploadPath(
  fileName: string,
  fileExtension: string
): Core.Uploads.FilePath {
  const date = new Date(Date.now());
  const fullYear = date.getFullYear();
  const month = date.getMonth();
  const path = `files/${fullYear}/${month}/${fileName}.${fileExtension}`;
  assertIsFileUploadPath(path);
  return path;
}

export function assertIsFileUploadPath(
  path: string
): asserts path is Core.Uploads.FilePath {
  const error =
    "the provided relative path comes up invalid " +
    "after validation process: ";
  function isWholeNumber(value: unknown): asserts value is number {
    const num = Number(value);
    if (Number.isInteger(num) && !isNaN(num)) {
      return;
    }
    throw new Error(error + "token is not an integer");
  }
  const tokens = path.split("/");
  if (tokens.length < 4 || tokens.length > 5) {
    throw new Error(error + "invalid number of tokens " + tokens.length);
  }
  if (tokens[0] !== "files") {
    throw new Error(error + "path must start with the word files");
  }
  isWholeNumber(tokens[1]);
  if (tokens[1] < 2020) {
    throw new Error(error + "path year must be more than 2020");
  }
  isWholeNumber(tokens[2]);
  if (tokens[2] > 11) {
    throw new Error(error + "path month must range from 0 - 11");
  }
  if (!tokens[3].includes(".")) {
    throw new Error(error + "path must contain file name");
  }
  const [id] = tokens[3].split(".");
  assertValidEntityId(id);
}

export function getId(path: Core.Uploads.FilePath) {
  const tokens = path.split("/");
  const [id] = tokens[3].split(".");
  assertValidEntityId(id);
  return id;
}
