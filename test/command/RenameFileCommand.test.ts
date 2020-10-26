import { expect } from "chai";
import * as path from "path";
import { window } from "vscode";
import { RenameFileCommand } from "../../src/command";
import { MoveFileController } from "../../src/controller";
import * as helper from "../helper";

describe(RenameFileCommand.name, () => {
    const subject = new RenameFileCommand(new MoveFileController(helper.createExtensionContext()));

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

            it("should prompt for file destination", async () => {
                await subject.execute();
                const prompt = "New Name";
                const value = path.basename(helper.editorFile1.fsPath);
                const valueSelection = [value.length - 9, value.length - 3];
                expect(window.showInputBox).to.have.been.calledWithExactly({ prompt, value, valueSelection });
            });

            helper.protocol.it("should move current file to destination", subject);
            helper.protocol.describe("with target file in non-existent nested directory", subject);
            helper.protocol.it("should open target file as active editor", subject);
        });

        describe("without an open text document", () => {
            beforeEach(async () => {
                await helper.closeAllEditors();
                helper.createShowInputBoxStub();
            });

            afterEach(() => helper.restoreShowInputBox());

            it("should ignore the command call", async () => {
                try {
                    await subject.execute();
                    expect.fail("Must fail");
                } catch {
                    expect(window.showInputBox).to.have.not.been.called;
                }
            });
        });
    });
});
