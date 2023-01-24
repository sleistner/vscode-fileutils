import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import sinon from "sinon";
import { Uri, window, workspace } from "vscode";
import { DuplicateFileCommand } from "../../src/command/DuplicateFileCommand";
import { DuplicateFileController } from "../../src/controller";
import * as helper from "../helper";
import { tmpDir } from "../helper";

describe(DuplicateFileCommand.name, () => {
    const subject = new DuplicateFileCommand(new DuplicateFileController(helper.createExtensionContext()));

    beforeEach(async () => {
        await helper.beforeEach();
        helper.createGetConfigurationStub({ "duplicateFile.typeahead.enabled": false });
        helper.createGetConfigurationStub({ "inputBox.path": "root" });
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
                helper.restoreShowInputBox();
                helper.restoreShowQuickPick();
            });

            helper.protocol.it("should prompt for file destination", subject, "Duplicate As");
            helper.protocol.it("should duplicate current file to destination", subject);
            helper.protocol.describe("with target file in non-existent nested directory", subject);
            helper.protocol.describe("when target destination exists", subject);
            helper.protocol.it("should open target file as active editor", subject);

            describe("configuration", () => {
                describe('when "newFile.typeahead.enabled" is "true"', () => {
                    beforeEach(async () => {
                        await workspace.fs.createDirectory(Uri.file(path.resolve(helper.tmpDir.fsPath, "dir-1")));
                        await workspace.fs.createDirectory(Uri.file(path.resolve(helper.tmpDir.fsPath, "dir-2")));

                        helper.createGetConfigurationStub({ "duplicateFile.typeahead.enabled": true });
                        helper
                            .createStubObject(workspace, "workspaceFolders")
                            .get(() => [{ uri: Uri.file(helper.tmpDir.fsPath), name: "a", index: 0 }]);
                    });

                    it("should show the quick pick dialog", async () => {
                        await subject.execute();
                        expect(window.showQuickPick).to.have.been.calledOnceWith(
                            sinon.match([
                                { description: "- workspace root", label: "/" },
                                { description: undefined, label: "/dir-1" },
                                { description: undefined, label: "/dir-2" },
                            ]),
                            sinon.match({
                                placeHolder: helper.quickPick.typeahead.placeHolder,
                            })
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
