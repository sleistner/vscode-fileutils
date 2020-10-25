import { expect } from "chai";
import * as path from "path";
import * as fs from "fs";
import { Uri, window, workspace } from "vscode";
import { DuplicateFileCommand } from "../../src/command/DuplicateFileCommand";
import { DuplicateFileController } from "../../src/controller";
import * as helper from "../helper";
import { tmpDir } from "../helper";

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
        describe("with selected file", () => {
            beforeEach(async () => helper.createShowInputBoxStub().resolves(helper.targetFile.path));

            afterEach(async () => helper.restoreShowInputBox());

            helper.protocol.it("should prompt for file destination", subject, "Duplicate As");
            helper.protocol.it("should duplicate current file to destination", subject, helper.editorFile1);
            helper.protocol.it("should open target file as active editor", subject, helper.editorFile1);
        });

        describe("with selected directory", () => {
            const sourceDirectory = Uri.file(path.resolve(tmpDir.path, "duplicate-source-dir"));
            const targetDirectory = Uri.file(path.resolve(tmpDir.path, "duplicate-target-dir"));

            beforeEach(async () => {
                await workspace.fs.createDirectory(sourceDirectory);
                helper.createShowInputBoxStub().resolves(targetDirectory.path);
            });

            afterEach(async () => {
                await workspace.fs.delete(sourceDirectory, { recursive: true, useTrash: false });
                await workspace.fs.delete(targetDirectory, { recursive: true, useTrash: false });
                helper.restoreShowInputBox();
            });

            it("should prompt for file destination", async () => {
                await subject.execute(sourceDirectory);
                const value = sourceDirectory.path;
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const valueSelection = [value.length - value.split(path.sep).pop()!.length, value.length];
                const prompt = "Duplicate As";
                expect(window.showInputBox).to.have.been.calledWithExactly({ prompt, value, valueSelection });
            });

            it("should duplicate current file to destination", async () => {
                await subject.execute(sourceDirectory);
                const message = `${targetDirectory} does not exist`;
                expect(fs.existsSync(targetDirectory.fsPath), message).to.be.true;
            });

            it("should not open target file as active editor", async () => {
                await subject.execute(sourceDirectory);
                expect(window.activeTextEditor?.document?.fileName).not.to.equal(targetDirectory.path);
            });
        });
    });
});
