import { assert, expect } from "chai";
import { assertIsFileUploadPath, generateFileUploadPath } from "../fileupath";
import { createEntityId } from "../entityToolkit";

describe("assertIsFileUploadPath", () => {
  it("should accept value generated from generateFileUploadPath", () => {
    const fileName = createEntityId();
    const validPath = generateFileUploadPath(fileName, "txt");
    expect(() => assertIsFileUploadPath(validPath)).to.not.throw();
  });
  it("should not accept invalid file upload path", () => {
    let invalidPath = "/invalid/path.txt";
    expect(() => assertIsFileUploadPath(invalidPath)).to.throw();
    invalidPath = "files/2015/10/invalid.txt";
    expect(() => assertIsFileUploadPath(invalidPath)).to.throw();
    invalidPath = "files/2025/17/invalid.txt";
    expect(() => assertIsFileUploadPath(invalidPath)).to.throw();
  });
});
