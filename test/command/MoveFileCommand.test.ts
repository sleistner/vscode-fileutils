import { MoveFileCommand } from "../../src/command";
import { MoveFileController } from "../../src/controller";
import * as helper from "../helper";

describe(MoveFileCommand.name, () => {
    const subject = new MoveFileCommand(new MoveFileController(helper.createExtensionContext()));

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

            helper.protocol.it("should prompt for file destination", subject, "New Location");
            helper.protocol.it("should move current file to destination", subject);
            helper.protocol.describe("with target file in non-existent nested directory", subject);
        });

        helper.protocol.describe("without an open text document", subject);
    });

    describe("as context menu", () => {
        beforeEach(async () => helper.createShowInputBoxStub().resolves(helper.targetFile.path));

        afterEach(async () => helper.restoreShowInputBox());

        helper.protocol.it("should prompt for file destination", subject, "New Location");
        helper.protocol.it("should move current file to destination", subject, helper.editorFile1);
    });
});
