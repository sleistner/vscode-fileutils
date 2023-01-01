import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import sinon from "sinon";
import { Uri, window, workspace, WorkspaceFolder } from "vscode";
import { NewFileCommand } from "../../src/command";
import { NewFileController } from "../../src/controller";
import * as helper from "../helper";

describe(NewFileCommand.name, () => {
    const hint = "larger projects may take a moment to load";
    const expectedShowQuickPickPlaceHolder = `First, select an existing path to create relative to (${hint})`;

    beforeEach(helper.beforeEach);

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
            helper.restoreShowInputBox();
            helper.restoreShowQuickPick();
        });

        it("should prompt for file destination", async () => {
            await subject.execute();
            const prompt = "File Name";
            const value = path.join(path.dirname(helper.editorFile1.path), path.sep);
            const valueSelection = [value.length, value.length];
            expect(window.showInputBox).to.have.been.calledWithExactly({ prompt, value, valueSelection });
        });

        describe("configuration", () => {
            beforeEach(async () => {
                await workspace.fs.createDirectory(Uri.file(path.resolve(helper.tmpDir.fsPath, "dir-1")));
                await workspace.fs.createDirectory(Uri.file(path.resolve(helper.tmpDir.fsPath, "dir-2")));
            });

            afterEach(async () => {
                helper.restoreGetConfiguration();
            });

            describe('"typeahead.enabled" is "true"', () => {
                beforeEach(async () => {
                    helper.createGetConfigurationStub({ "typeahead.enabled": true });
                });

                it("should show the quick pick dialog", async () => {
                    await subject.execute();
                    expect(window.showQuickPick).to.have.been.calledOnceWithExactly(
                        sinon.match([
                            { description: "- current file", label: "/" },
                            { description: undefined, label: "/dir-1" },
                            { description: undefined, label: "/dir-2" },
                        ]),
                        sinon.match({
                            placeHolder: expectedShowQuickPickPlaceHolder,
                        })
                    );
                });
            });

            describe('"typeahead.enabled" is "false"', () => {
                beforeEach(async () => {
                    helper.createGetConfigurationStub({ "typeahead.enabled": false });
                });

                it("should show the quick pick dialog", async () => {
                    await subject.execute();
                    expect(window.showQuickPick).to.have.not.been.called;
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

        helper.protocol.describe("with target file in non-existent nested directory", subject);
        helper.protocol.describe("when target destination exists", subject, { overwriteFileContent: "" });
        helper.protocol.it("should open target file as active editor", subject);
    });

    describe('when "relativeToRoot" is "true"', () => {
        const subject = new NewFileCommand(new NewFileController(helper.createExtensionContext()), {
            relativeToRoot: true,
        });

        class WorkspaceFolderStub implements WorkspaceFolder {
            constructor(readonly uri: Uri, readonly name: string, readonly index: number) {}
        }

        const workspacePathA = path.join(helper.tmpDir.fsPath, "workspaceA");
        const workspacePathB = path.join(helper.tmpDir.fsPath, "workspaceB");

        const workspaceFolderA = new WorkspaceFolderStub(Uri.file(workspacePathA), "a", 0);
        const workspaceFolderB = new WorkspaceFolderStub(Uri.file(workspacePathB), "b", 1);
        let workspaceFolders: WorkspaceFolder[] = [];
        let workspaceFoldersStub: sinon.SinonStub;

        beforeEach(async () => {
            await workspace.fs.createDirectory(workspaceFolderA.uri);
            await workspace.fs.createDirectory(workspaceFolderB.uri);

            workspaceFoldersStub = helper.createStubObject(workspace, "workspaceFolders").get(() => workspaceFolders);

            helper.createShowInputBoxStub().callsFake(async (options) => {
                if (options.value) {
                    return path.join(options.value, "filename.txt");
                }
            });
            helper.createShowQuickPickStub().resolves({ label: "/", description: "" });
        });

        afterEach(async () => {
            helper.restoreObject(workspaceFoldersStub);
            helper.restoreShowInputBox();
            helper.restoreShowQuickPick();
        });

        describe("with one workspace", () => {
            beforeEach(async () => {
                workspaceFolders.push(workspaceFolderA);
                helper.createStubObject(workspace, "getWorkspaceFolder");
            });

            afterEach(async () => {
                workspaceFolders = [];
                helper.restoreObject(workspace.getWorkspaceFolder);
            });

            it("should select first workspace", async () => {
                await subject.execute();
                expect(workspace.getWorkspaceFolder).to.have.not.been.called;

                const prompt = "File Name";
                const value = path.join(workspacePathA, path.sep);
                const valueSelection = [value.length, value.length];
                expect(window.showInputBox).to.have.been.calledWithExactly({ prompt, value, valueSelection });
            });

            describe("configuration", () => {
                beforeEach(async () => {
                    await workspace.fs.createDirectory(Uri.file(path.resolve(workspaceFolderA.uri.fsPath, "dir-1")));
                    await workspace.fs.createDirectory(Uri.file(path.resolve(workspaceFolderA.uri.fsPath, "dir-2")));
                });

                afterEach(async () => {
                    helper.restoreGetConfiguration();
                });

                describe('when "typeahead.enabled" is "true"', () => {
                    beforeEach(async () => {
                        helper.createGetConfigurationStub({ "typeahead.enabled": true });
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
                                placeHolder: expectedShowQuickPickPlaceHolder,
                            })
                        );
                    });
                });

                describe('when "typeahead.enabled" is "false"', () => {
                    beforeEach(async () => {
                        helper.createGetConfigurationStub({ "typeahead.enabled": false });
                    });

                    it("should show the quick pick dialog", async () => {
                        await subject.execute();
                        expect(window.showQuickPick).to.have.not.been;
                    });
                });
            });
        });

        describe("with multiple workspaces", () => {
            beforeEach(async () => {
                workspaceFolders.push(workspaceFolderA, workspaceFolderB);
                helper.createStubObject(window, "showWorkspaceFolderPick").resolves(workspaceFolderB);
            });

            afterEach(async () => {
                helper.restoreObject(window.showWorkspaceFolderPick);
                workspaceFolders = [];
            });

            it("should show workspace selector", async () => {
                await subject.execute();
                expect(window.showWorkspaceFolderPick).to.have.been.calledWith();

                const prompt = "File Name";
                const value = path.join(workspacePathB, path.sep);
                const valueSelection = [value.length, value.length];
                expect(window.showInputBox).to.have.been.calledWithExactly({ prompt, value, valueSelection });
            });

            describe("with open document", () => {
                beforeEach(async () => {
                    helper.createStubObject(workspace, "getWorkspaceFolder").returns(workspaceFolders[1]);
                    await helper.openDocument(helper.editorFile1);
                });

                afterEach(async () => {
                    helper.restoreObject(workspace.getWorkspaceFolder);
                    await helper.closeAllEditors();
                });

                it("should select workspace for open file", async () => {
                    await subject.execute();
                    expect(workspace.getWorkspaceFolder).to.have.been.calledWith(Uri.file(helper.editorFile1.fsPath));
                    expect(window.showWorkspaceFolderPick).to.have.not.been.called;
                });
            });

            describe("configuration", () => {
                beforeEach(async () => {
                    await workspace.fs.createDirectory(Uri.file(path.resolve(workspaceFolderB.uri.fsPath, "dir-1")));
                    await workspace.fs.createDirectory(Uri.file(path.resolve(workspaceFolderB.uri.fsPath, "dir-2")));
                });

                afterEach(async () => {
                    helper.restoreGetConfiguration();
                });

                describe('when "typeahead.enabled" is "true"', () => {
                    beforeEach(async () => {
                        helper.createGetConfigurationStub({ "typeahead.enabled": true });
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
                                placeHolder: expectedShowQuickPickPlaceHolder,
                            })
                        );
                    });
                });

                describe('when "typeahead.enabled" is "false"', () => {
                    beforeEach(async () => {
                        helper.createGetConfigurationStub({ "typeahead.enabled": false });
                    });

                    it("should not show the quick pick dialog", async () => {
                        try {
                            await subject.execute();
                            expect.fail("Must fail");
                        } catch (e) {
                            expect(window.showQuickPick).to.have.not.been.called;
                        }
                    });
                });
            });
        });
    });
});
