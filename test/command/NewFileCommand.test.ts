import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import sinon from "sinon";
import { type QuickPickItem, Uri, window, workspace } from "vscode";
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

        describe("typeahead configuration", () => {
            describe('when "newFile.typeahead.enabled" is "true"', () => {
                beforeEach(async () => {
                    helper.createGetConfigurationStub({ "newFile.typeahead.enabled": true });
                    helper.createWorkspaceFoldersStub(helper.workspaceFolderA);
                });

                it("should show the quick pick dialog", async () => {
                    await subject.execute();
                    const items: QuickPickItem[] = [
                        { description: "- current file", label: "/" },
                        { description: undefined, label: "/dir-1" },
                        { description: undefined, label: "/dir-2" },
                        { description: undefined, label: "/workspaceA" },
                        { description: undefined, label: "/workspaceA/dir-1" },
                        { description: undefined, label: "/workspaceA/dir-2" },
                        { description: undefined, label: "/workspaceB" },
                        { description: undefined, label: "/workspaceB/dir-1" },
                        { description: undefined, label: "/workspaceB/dir-2" },
                    ];
                    expect(window.showQuickPick).to.have.been.calledOnceWith(
                        sinon.match(items),
                        sinon.match(helper.quickPick.typeahead.options)
                    );
                });
            });

            describe('when "newFile.typeahead.enabled" is "false"', () => {
                beforeEach(async () => {
                    helper.createGetConfigurationStub({ "newFile.typeahead.enabled": false });
                });

                it("should not show the quick pick dialog", async () => {
                    await subject.execute();
                    expect(window.showQuickPick).to.have.not.been.called;
                });
            });
        });

        describe("inputBox configuration", () => {
            const runs = [
                { pathType: "workspace", pathTypeIndicator: "@" },
                { pathType: "workspace", pathTypeIndicator: "" },
                { pathType: "workspace", pathTypeIndicator: ":" },
                { pathType: "workspace", pathTypeIndicator: " " },
            ];

            runs.forEach(({ pathType, pathTypeIndicator }) => {
                describe(`when "inputBox.pathType" is "${pathType}" and "inputBox.pathTypeIndicator" is "${pathTypeIndicator}"`, () => {
                    beforeEach(async () => {
                        helper.createGetConfigurationStub({
                            "inputBox.pathType": pathType,
                            "inputBox.pathTypeIndicator": pathTypeIndicator,
                        });

                        const workspaceFolder = path.dirname(helper.editorFile1.path);
                        helper.createWorkspaceFoldersStub({
                            uri: Uri.file(workspaceFolder),
                            name: "workspace-a",
                            index: 0,
                        });
                        helper.createGetWorkspaceFolderStub().returns(workspaceFolder);
                    });

                    it("should show the quick pick dialog", async () => {
                        await subject.execute();

                        const expectedValue = `${pathTypeIndicator}/`;

                        expect(window.showInputBox).to.have.been.calledOnceWith({
                            prompt: sinon.match.string,
                            value: sinon.match(expectedValue),
                            valueSelection: sinon.match.array,
                            ignoreFocusOut: true,
                        });
                    });
                });
            });
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

        describe("with target file in non-existent nested directory", () => {
            beforeEach(async () => {
                const targetDir = path.resolve(helper.tmpDir.fsPath, "level-1", "level-2", "level-3");
                helper.createShowInputBoxStub().resolves(path.resolve(targetDir, "file.rb"));
            });

            it("should create nested directories", async () => {
                await subject.execute();
                const textEditor = window.activeTextEditor;
                expect(textEditor);

                const dirname = path.dirname(textEditor?.document.fileName ?? "");
                const directories: string[] = dirname.split(path.sep);

                expect(directories.pop()).to.equal("level-3");
                expect(directories.pop()).to.equal("level-2");
                expect(directories.pop()).to.equal("level-1");
            });
        });

        describe("when target destination exists", () => {
            beforeEach(async () => {
                await workspace.fs.copy(helper.editorFile2, helper.targetFile, { overwrite: true });
                helper.createShowInformationMessageStub().resolves({ title: "placeholder" });
            });

            it("should prompt with confirmation dialog to overwrite destination file", async () => {
                await subject.execute();
                const message = `File '${helper.targetFile.path}' already exists.`;
                const action = "Overwrite";
                const options = { modal: true };
                expect(window.showInformationMessage).to.have.been.calledWith(message, options, action);
            });

            describe('when answered with "Overwrite"', () => {
                it("should overwrite the existing file", async () => {
                    await subject.execute();
                    const fileContent = await helper.readFile(helper.targetFile);
                    expect(fileContent).to.equal("");
                });
            });

            describe('when answered with "Cancel"', () => {
                beforeEach(async () => helper.createShowInformationMessageStub().resolves(false));

                it("should leave existing file untouched", async () => {
                    try {
                        await subject.execute();
                        expect.fail("must fail");
                    } catch (_e) {
                        const fileContent = await helper.readFile(helper.targetFile);
                        expect(fileContent).to.equal("class FileTwo; end");
                    }
                });
            });
        });

        it("should open target file as active editor", async () => {
            await subject.execute();
            expect(window.activeTextEditor?.document.fileName).to.equal(helper.targetFile.path);
        });
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

            describe("typeahead configuration", () => {
                describe('when "newFile.typeahead.enabled" is "true"', () => {
                    beforeEach(async () => {
                        helper.createGetConfigurationStub({ "newFile.typeahead.enabled": true });
                        helper.createWorkspaceFoldersStub(helper.workspaceFolderA);
                    });

                    it("should show the quick pick dialog", async () => {
                        await subject.execute();
                        const items: QuickPickItem[] = [
                            { description: "- workspace root", label: "/" },
                            { description: undefined, label: "/dir-1" },
                            { description: undefined, label: "/dir-2" },
                        ];
                        expect(window.showQuickPick).to.have.been.calledOnceWith(
                            sinon.match(items),
                            sinon.match(helper.quickPick.typeahead.options)
                        );
                    });
                });

                describe('when "newFile.typeahead.enabled" is "false"', () => {
                    beforeEach(async () => {
                        helper.createGetConfigurationStub({ "newFile.typeahead.enabled": false });
                    });

                    it("should not show the quick pick dialog", async () => {
                        await subject.execute();
                        expect(window.showQuickPick).to.have.not.been.called;
                    });
                });
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

            describe("typeahead configuration", () => {
                describe('when "newFile.typeahead.enabled" is "true"', () => {
                    beforeEach(async () => {
                        helper.createGetConfigurationStub({ "newFile.typeahead.enabled": true });
                        helper.createWorkspaceFoldersStub(helper.workspaceFolderA);
                    });

                    it("should show the quick pick dialog", async () => {
                        await subject.execute();
                        const items: QuickPickItem[] = [
                            { description: "- workspace root", label: "/" },
                            { description: undefined, label: "/dir-1" },
                            { description: undefined, label: "/dir-2" },
                        ];
                        expect(window.showQuickPick).to.have.been.calledOnceWith(
                            sinon.match(items),
                            sinon.match(helper.quickPick.typeahead.options)
                        );
                    });
                });

                describe('when "newFile.typeahead.enabled" is "false"', () => {
                    beforeEach(async () => {
                        helper.createGetConfigurationStub({ "newFile.typeahead.enabled": false });
                    });

                    it("should not show the quick pick dialog", async () => {
                        await subject.execute();
                        expect(window.showQuickPick).to.have.not.been.called;
                    });
                });
            });
        });
    });
});
