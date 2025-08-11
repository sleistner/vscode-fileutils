import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import sinon from "sinon";
import { type QuickPickItem, Uri, window, workspace } from "vscode";
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

            it("should prompt for file destination", async () => {
                await subject.execute(helper.editorFile1);
                const value = helper.editorFile1.path;
                const valueSelection = [value.length - 9, value.length - 3];
                expect(window.showInputBox).to.have.been.calledWithExactly({
                    prompt: "Duplicate As",
                    value,
                    valueSelection,
                    ignoreFocusOut: true,
                });
            });

            it("should duplicate current file to destination", async () => {
                await subject.execute();
                const message = `${helper.targetFile} does not exist`;
                expect(fs.existsSync(helper.targetFile.fsPath), message).to.be.true;
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
                        expect(fileContent).to.equal("class FileOne; end");
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

            describe("typeahead configuration", () => {
                describe('when "duplicateFile.typeahead.enabled" is "true"', () => {
                    beforeEach(async () => {
                        helper.createGetConfigurationStub({ "duplicateFile.typeahead.enabled": true });
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

                describe('when "duplicateFile.typeahead.enabled" is "false"', () => {
                    beforeEach(async () => {
                        helper.createGetConfigurationStub({ "duplicateFile.typeahead.enabled": false });
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

                            const expectedValue = `${pathTypeIndicator}/${path.basename(helper.editorFile1.path)}`;

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
        });

        describe("without an open text document", () => {
            beforeEach(async () => {
                await helper.closeAllEditors();
                helper.createShowInputBoxStub();
            });

            it("should ignore the command call", async () => {
                try {
                    await subject.execute();
                    expect.fail("must fail");
                } catch {
                    expect(window.showInputBox).to.have.not.been.called;
                }
            });
        });
    });

    describe("as context menu", () => {
        describe("with selected file", () => {
            beforeEach(async () => helper.createShowInputBoxStub().resolves(helper.targetFile.path));

            it("should prompt for file destination", async () => {
                await subject.execute(helper.editorFile1);
                const value = helper.editorFile1.path;
                const valueSelection = [value.length - 9, value.length - 3];
                expect(window.showInputBox).to.have.been.calledWithExactly({
                    prompt: "Duplicate As",
                    value,
                    valueSelection,
                    ignoreFocusOut: true,
                });
            });

            it("should duplicate current file to destination", async () => {
                await subject.execute(helper.editorFile1);
                const message = `${helper.targetFile} does not exist`;
                expect(fs.existsSync(helper.targetFile.fsPath), message).to.be.true;
            });

            it("should open target file as active editor", async () => {
                await subject.execute(helper.editorFile1);
                expect(window.activeTextEditor?.document.fileName).to.equal(helper.targetFile.path);
            });
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
                expect(window.showInputBox).to.have.been.calledWithExactly({
                    prompt,
                    value,
                    valueSelection,
                    ignoreFocusOut: true,
                });
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
