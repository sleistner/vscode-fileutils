import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import sinon from "sinon";
import { Uri, window, workspace } from "vscode";
import { DuplicateFileCommand } from "../../src/command/DuplicateFileCommand";
import { DuplicateFileController } from "../../src/controller";
import * as helper from "../helper";

describe(DuplicateFileCommand.name, () => {
    const subject = new DuplicateFileCommand(new DuplicateFileController(helper.createExtensionContext()));

    beforeEach(async () => {
        await helper.beforeEach();
        helper.createGetConfigurationStub({ "duplicateFile.typeahead.enabled": false, "inputBox.path": "root" });
    });

    afterEach(helper.afterEach);

    describe("as command", () => {
        describe("with open text document", () => {
            beforeEach(async () => {
                await helper.openDocument(helper.editorFile1);
                helper.createShowInputBoxStub().resolves(helper.targetFile.path);
                helper.createShowQuickPickStub().resolves({ label: "/", description: "" });
            });

            afterEach(async () => {
                await helper.closeAllEditors();
            });

            helper.protocol.it("should prompt for file destination", subject, "Duplicate As");
            helper.protocol.it("should duplicate current file to destination", subject);
            helper.protocol.describe("with target file in non-existent nested directory", subject);
            helper.protocol.describe("when target destination exists", subject);
            helper.protocol.it("should open target file as active editor", subject);

            describe("configuration", () => {
                describe('when "newFile.typeahead.enabled" is "true"', () => {
                    beforeEach(async () => {
                        helper.createGetConfigurationStub({ "duplicateFile.typeahead.enabled": true });
                        helper.createWorkspaceFoldersStub(helper.workspaceFolderA);
                    });

                    it("should show the quick pick dialog", async () => {
                        await subject.execute();
                        expect(window.showQuickPick).to.have.been.calledOnceWith(
                            sinon.match(helper.quickPick.typeahead.items.workspace),
                            sinon.match(helper.quickPick.typeahead.options)
                        );
                    });
                });

                describe('when "newFile.typeahead.enabled" is "false"', () => {
                    beforeEach(async () => {
                        helper.createGetConfigurationStub({ "duplicateFile.typeahead.enabled": false });
                    });

                    it("should not show the quick pick dialog", async () => {
                        await subject.execute();
                        expect(window.showQuickPick).to.have.not.been.called;
                    });
                });
            });
        });

        helper.protocol.describe("without an open text document", subject);
    });

    describe("as context menu", () => {
        describe("with selected file", () => {
            beforeEach(async () => helper.createShowInputBoxStub().resolves(helper.targetFile.path));

            helper.protocol.it("should prompt for file destination", subject, "Duplicate As");
            helper.protocol.it("should duplicate current file to destination", subject, helper.editorFile1);
            helper.protocol.it("should open target file as active editor", subject, helper.editorFile1);
        });

        describe("with selected directory", () => {
            const sourceDirectory = Uri.file(path.resolve(helper.tmpDir.path, "duplicate-source-dir"));
            const targetDirectory = Uri.file(path.resolve(helper.tmpDir.path, "duplicate-target-dir"));

            beforeEach(async () => {
                await workspace.fs.createDirectory(sourceDirectory);
                helper.createShowInputBoxStub().resolves(targetDirectory.path);
            });

            afterEach(async () => {
                await workspace.fs.delete(sourceDirectory, { recursive: true, useTrash: false });
                await workspace.fs.delete(targetDirectory, { recursive: true, useTrash: false });
            });

            it("should prompt for file destination", async () => {
                await subject.execute(sourceDirectory);
                const value = sourceDirectory.path;
                const valueSelection = [value.length - (value.split(path.sep).pop() as string).length, value.length];
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
