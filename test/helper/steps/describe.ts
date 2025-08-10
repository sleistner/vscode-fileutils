import { expect } from "chai";
import * as mocha from "mocha";
import * as path from "path";
import sinon from "sinon";
import { type QuickPickItem, Uri, window, workspace } from "vscode";
import type { Command } from "../../../src/command";
import { quickPick } from "..";
import { editorFile2, targetFile, tmpDir, workspaceFolderA } from "../environment";
import { closeAllEditors, readFile } from "../functions";
import {
    createGetConfigurationStub,
    createGetWorkspaceFolderStub,
    createShowInformationMessageStub,
    createShowInputBoxStub,
    createWorkspaceFoldersStub,
} from "../stubs";
import type { FuncVoid, Step } from "./types";

export const describe: Step = {
    "with target file in non-existent nested directory"(subject: Command): FuncVoid {
        return () => {
            const targetDir = path.resolve(tmpDir.fsPath, "level-1", "level-2", "level-3");

            mocha.beforeEach(async () => createShowInputBoxStub().resolves(path.resolve(targetDir, "file.rb")));

            mocha.it("should create nested directories", async () => {
                await subject.execute();
                const textEditor = window.activeTextEditor;
                expect(textEditor);

                const dirname = path.dirname(textEditor?.document.fileName ?? "");
                const directories: string[] = dirname.split(path.sep);

                expect(directories.pop()).to.equal("level-3");
                expect(directories.pop()).to.equal("level-2");
                expect(directories.pop()).to.equal("level-1");
            });
        };
    },
    "when target destination exists"(subject: Command, config?: Record<string, unknown>): FuncVoid {
        return () => {
            mocha.beforeEach(async () => {
                await workspace.fs.copy(editorFile2, targetFile, { overwrite: true });
                createShowInformationMessageStub().resolves({ title: "placeholder" });
            });

            mocha.it("should prompt with confirmation dialog to overwrite destination file", async () => {
                await subject.execute();
                const message = `File '${targetFile.path}' already exists.`;
                const action = "Overwrite";
                const options = { modal: true };
                expect(window.showInformationMessage).to.have.been.calledWith(message, options, action);
            });

            mocha.describe('when answered with "Overwrite"', () => {
                mocha.it("should overwrite the existig file", async () => {
                    await subject.execute();
                    const fileContent = await readFile(targetFile);
                    const expectedFileContent =
                        config && "overwriteFileContent" in config ? config.overwriteFileContent : "class FileOne; end";
                    expect(fileContent).to.equal(expectedFileContent);
                });
            });

            mocha.describe('when answered with "Cancel"', () => {
                mocha.beforeEach(async () => createShowInformationMessageStub().resolves(false));

                mocha.it("should leave existing file untouched", async () => {
                    try {
                        await subject.execute();
                        expect.fail("must fail");
                    } catch (_e) {
                        const fileContent = await readFile(targetFile);
                        expect(fileContent).to.equal("class FileTwo; end");
                    }
                });
            });
        };
    },
    "without an open text document"(subject: Command): FuncVoid {
        return () => {
            mocha.beforeEach(async () => {
                await closeAllEditors();
                createShowInputBoxStub();
            });

            mocha.it("should ignore the command call", async () => {
                try {
                    await subject.execute();
                    expect.fail("must fail");
                } catch {
                    expect(window.showInputBox).to.have.not.been.called;
                }
            });
        };
    },
    "typeahead configuration"(subject: Command, options: { command: string; items: QuickPickItem[] }): FuncVoid {
        const { command, items } = options;
        return () => {
            mocha.describe(`when "${command}.typeahead.enabled" is "true"`, () => {
                mocha.beforeEach(async () => {
                    createGetConfigurationStub({ [`${command}.typeahead.enabled`]: true });
                    createWorkspaceFoldersStub(workspaceFolderA);
                });

                mocha.it("should show the quick pick dialog", async () => {
                    await subject.execute();
                    expect(window.showQuickPick).to.have.been.calledOnceWith(
                        sinon.match(items),
                        sinon.match(quickPick.typeahead.options)
                    );
                });
            });

            mocha.describe(`when "${command}.typeahead.enabled" is "false"`, () => {
                mocha.beforeEach(async () => {
                    createGetConfigurationStub({ [`${command}.typeahead.enabled`]: false });
                });

                mocha.it("should not show the quick pick dialog", async () => {
                    await subject.execute();
                    expect(window.showQuickPick).to.have.not.been.called;
                });
            });
        };
    },
    "inputBox configuration"(subject: Command, options: { editorFile: Uri; expectedPath?: string }): FuncVoid {
        const { editorFile, expectedPath } = options;
        const runs = [
            { pathType: "workspace", pathTypeIndicator: "@" },
            { pathType: "workspace", pathTypeIndicator: "" },
            { pathType: "workspace", pathTypeIndicator: ":" },
            { pathType: "workspace", pathTypeIndicator: " " },
        ];

        return () => {
            runs.forEach(({ pathType, pathTypeIndicator }) => {
                mocha.describe(
                    `when "inputBox.pathType" is "${pathType}" and "inputBox.pathTypeIndicator" is "${pathTypeIndicator}"`,
                    () => {
                        mocha.beforeEach(async () => {
                            createGetConfigurationStub({
                                "inputBox.pathType": pathType,
                                "inputBox.pathTypeIndicator": pathTypeIndicator,
                            });

                            const workspaceFolder = path.dirname(editorFile.path);
                            createWorkspaceFoldersStub({
                                uri: Uri.file(workspaceFolder),
                                name: "workspace-a",
                                index: 0,
                            });
                            createGetWorkspaceFolderStub().returns(workspaceFolder);
                        });

                        mocha.it("should show the quick pick dialog", async () => {
                            await subject.execute();

                            const expectedValue = `${pathTypeIndicator}/${
                                expectedPath ?? path.basename(editorFile.path)
                            }`;

                            expect(window.showInputBox).to.have.been.calledOnceWith({
                                prompt: sinon.match.string,
                                value: sinon.match(expectedValue),
                                valueSelection: sinon.match.array,
                                ignoreFocusOut: true,
                            });
                        });
                    }
                );
            });
        };
    },
};
