import { DuplicateFileCommand } from "../../src/command/DuplicateFileCommand";
import { DuplicateFileController } from "../../src/controller";
import * as helper from "../helper";

describe("DuplicateFileCommand", () => {
    const subject = new DuplicateFileCommand(new DuplicateFileController(helper.createExtensionContext()));

    beforeEach(helper.beforeEach);

    afterEach(helper.afterEach);

    describe("as command", () => {
        describe("with open text document", () => {
            beforeEach(async () => {
                await helper.openDocument(helper.editorFile1);
                helper.createShowInputBoxStub().resolves(helper.targetFile.path);
            });

            afterEach(async () => {
                await helper.closeAllEditors();
                helper.restoreShowInputBox();
            });

            helper.protocol.it("should prompt for file destination", subject, "Duplicate As");
            helper.protocol.it("should duplicate current file to destination", subject);
            helper.protocol.describe("target file in non existing nested directories", subject);
            helper.protocol.describe("when target destination exists", subject);
            helper.protocol.it("should open target file as active editor", subject);
        });

        helper.protocol.describe("without open text document", subject);
    });

    describe("as context menu", () => {
        beforeEach(async () => helper.createShowInputBoxStub().resolves(helper.targetFile.path));

        afterEach(async () => helper.restoreShowInputBox());

        helper.protocol.it("should prompt for file destination", subject, "Duplicate As");
        helper.protocol.it("should duplicate current file to destination", subject, helper.editorFile1);
        helper.protocol.it("should open target file as active editor", subject, helper.editorFile1);
    });
});
