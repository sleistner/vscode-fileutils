import { expect } from "chai";
import * as path from "path";
import sinon from "sinon";
import { type QuickPickItem, Uri, window } from "vscode";
import { MoveFileCommand } from "../../src/command";
import { MoveFileController } from "../../src/controller";
import * as helper from "../helper";

describe(MoveFileCommand.name, () => {
    const subject = new MoveFileCommand(new MoveFileController(helper.createExtensionContext()));

    beforeEach(async () => {
        await helper.beforeEach();
        helper.createGetConfigurationStub({ "moveFile.typeahead.enabled": false, "inputBox.path": "root" });
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
                    prompt: "New Location",
                    value,
                    valueSelection,
                    ignoreFocusOut: true,
                });
            });

            it("should move current file to destination", async () => {
                await subject.execute();
                const message = `${helper.targetFile} does not exist`;
                expect(require("fs").existsSync(helper.targetFile.fsPath), message).to.be.true;
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

            describe("typeahead configuration", () => {
                describe('when "moveFile.typeahead.enabled" is "true"', () => {
                    beforeEach(async () => {
                        helper.createGetConfigurationStub({ "moveFile.typeahead.enabled": true });
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

                describe('when "moveFile.typeahead.enabled" is "false"', () => {
                    beforeEach(async () => {
                        helper.createGetConfigurationStub({ "moveFile.typeahead.enabled": false });
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
        beforeEach(async () => helper.createShowInputBoxStub().resolves(helper.targetFile.path));

        it("should prompt for file destination", async () => {
            await subject.execute(helper.editorFile1);
            const value = helper.editorFile1.path;
            const valueSelection = [value.length - 9, value.length - 3];
            expect(window.showInputBox).to.have.been.calledWithExactly({
                prompt: "New Location",
                value,
                valueSelection,
                ignoreFocusOut: true,
            });
        });

        it("should move current file to destination", async () => {
            await subject.execute(helper.editorFile1);
            const message = `${helper.targetFile} does not exist`;
            expect(require("fs").existsSync(helper.targetFile.fsPath), message).to.be.true;
        });
    });
});
