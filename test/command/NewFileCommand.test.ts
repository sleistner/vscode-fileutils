import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import { Uri, window, workspace } from "vscode";
import { NewFileCommand } from "../../src/command";
import { NewFileController } from "../../src/controller";
import * as helper from "../helper";

describe(NewFileCommand.name, () => {
    beforeEach(async () => {
        await helper.beforeEach();
        helper.createGetConfigurationStub({ "newFile.typeahead.enabled": false, "inputBox.path": "root" });
    });

    afterEach(helper.afterEach);

    describe('when "relativeToRoot" is "false"', async () => {
        const subject = new NewFileCommand(new NewFileController(helper.createExtensionContext()));

        beforeEach(async () => {
            await helper.openDocument(helper.editorFile1);
            helper.createShowInputBoxStub().resolves(path.basename(helper.targetFile.path));
            helper.createShowQuickPickStub().resolves({ label: "/", description: "" });
        });

        afterEach(async () => {
            await helper.closeAllEditors();
        });

        it("should prompt for file destination", async () => {
            await subject.execute();
            const prompt = "File Name";
            const value = path.join(path.dirname(helper.editorFile1.path), path.sep);
            const valueSelection = [value.length, value.length];
            expect(window.showInputBox).to.have.been.calledWithExactly({
                prompt,
                value,
                valueSelection,
                ignoreFocusOut: true,
            });
        });

        helper.protocol.describe("typeahead configuration", subject, {
            command: "newFile",
            items: helper.quickPick.typeahead.items.currentFile,
        });

        helper.protocol.describe("inputBox configuration", subject, {
            editorFile: helper.editorFile1,
            expectedPath: "",
        });

        it("should create the file at destination", async () => {
            await subject.execute();
            const message = `${helper.targetFile.path} does not exist`;
            expect(fs.existsSync(helper.targetFile.fsPath), message).to.be.true;
        });

        describe("file path ends with path separator", () => {
            beforeEach(async () => {
                const fileName = path.basename(helper.targetFile.fsPath) + path.sep;
                helper.createShowInputBoxStub().resolves(fileName);
            });

            it("should create the directory at destination", async () => {
                await subject.execute();
                const message = `${helper.targetFile.path} must be a directory`;
                expect(fs.statSync(helper.targetFile.fsPath).isDirectory(), message).to.be.true;
            });
        });

        describe("file path contains dot and backslash path separator", () => {
            beforeEach(async () => {
                const fileName = helper.targetFileWithDot.fsPath.replace(/\//g, "\\");
                helper.createShowInputBoxStub().resolves(fileName);
            });

            it("should create the file at destination", async () => {
                await subject.execute();
                const message = `${helper.targetFileWithDot.path} does not exist`;
                expect(fs.existsSync(helper.targetFileWithDot.fsPath), message).to.be.true;
            });
        });

        helper.protocol.describe("with target file in non-existent nested directory", subject);
        helper.protocol.describe("when target destination exists", subject, { overwriteFileContent: "" });
        helper.protocol.it("should open target file as active editor", subject);
    });

    describe('when "relativeToRoot" is "true"', () => {
        const subject = new NewFileCommand(new NewFileController(helper.createExtensionContext()), {
            relativeToRoot: true,
        });

        beforeEach(async () => {
            helper.createShowInputBoxStub().callsFake(async (options) => {
                if (options.value) {
                    return path.join(options.value, "filename.txt");
                }
            });
            helper.createShowQuickPickStub().resolves({ label: "/", description: "" });
        });

        describe("with one workspace", () => {
            beforeEach(async () => {
                helper.createWorkspaceFoldersStub(helper.workspaceFolderA);
                helper.createGetWorkspaceFolderStub();
            });

            it("should select first workspace", async () => {
                await subject.execute();
                expect(workspace.getWorkspaceFolder).to.have.not.been.called;

                const prompt = "File Name";
                const value = path.join(helper.workspacePathA, path.sep);
                const valueSelection = [value.length, value.length];
                expect(window.showInputBox).to.have.been.calledWithExactly({
                    prompt,
                    value,
                    valueSelection,
                    ignoreFocusOut: true,
                });
            });

            helper.protocol.describe("typeahead configuration", subject, {
                command: "newFile",
                items: helper.quickPick.typeahead.items.workspace,
            });
        });

        describe("with multiple workspaces", () => {
            beforeEach(async () => {
                helper.createWorkspaceFoldersStub(helper.workspaceFolderA, helper.workspaceFolderB);
                helper.createStubObject(window, "showWorkspaceFolderPick").resolves(helper.workspaceFolderB);
            });

            afterEach(async () => {
                helper.restoreObject(window.showWorkspaceFolderPick);
            });

            it("should show workspace selector", async () => {
                await subject.execute();
                expect(window.showWorkspaceFolderPick).to.have.been.called;

                const prompt = "File Name";
                const value = path.join(helper.workspaceFolderB.uri.fsPath, path.sep);
                const valueSelection = [value.length, value.length];
                expect(window.showInputBox).to.have.been.calledWithExactly({
                    prompt,
                    value,
                    valueSelection,
                    ignoreFocusOut: true,
                });
            });

            describe("with open document", () => {
                beforeEach(async () => {
                    helper.createGetWorkspaceFolderStub().returns(helper.workspaceFolderB);
                    await helper.openDocument(helper.editorFile1);
                    await subject.execute();
                });

                afterEach(async () => {
                    await helper.closeAllEditors();
                });

                it("should show workspace selector", async () => {
                    expect(window.showWorkspaceFolderPick).to.have.been.called;
                });

                it("should select workspace for open file", async () => {
                    expect(workspace.getWorkspaceFolder).to.have.been.calledWith(Uri.file(helper.editorFile1.fsPath));
                });
            });

            helper.protocol.describe("typeahead configuration", subject, {
                command: "newFile",
                items: helper.quickPick.typeahead.items.workspace,
            });
        });
    });
});
