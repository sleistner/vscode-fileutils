import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import { Uri, window } from "vscode";
import { RenameFileCommand } from "../../src/command";
import { RenameFileController } from "../../src/controller/RenameFileController";
import * as helper from "../helper";

describe(RenameFileCommand.name, () => {
    const subject = new RenameFileCommand(new RenameFileController(helper.createExtensionContext()));

    beforeEach(async () => {
        await helper.beforeEach();
    });

    afterEach(helper.afterEach);

    describe("as command", () => {
        describe("with open text document", () => {
            beforeEach(async () => {
                await helper.openDocument(helper.editorFile1);
                helper.createShowInputBoxStub().resolves(helper.targetFile.path);
            });

            afterEach(async () => {
                await helper.closeAllEditors();
            });

            it("should prompt for file destination", async () => {
                await subject.execute();
                const prompt = "New Name";
                const value = path.basename(helper.editorFile1.fsPath);
                const valueSelection = [value.length - 9, value.length - 3];
                expect(window.showInputBox).to.have.been.calledWithExactly({
                    prompt,
                    value,
                    valueSelection,
                    ignoreFocusOut: true,
                });
            });

            it("should move current file to destination", async () => {
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

            it("should open target file as active editor", async () => {
                await subject.execute();
                expect(window.activeTextEditor?.document.fileName).to.equal(helper.targetFile.path);
            });

            describe("prefer uri over current editor", () => {
                beforeEach(async () => {
                    const targetFile = Uri.file(path.resolve(`${helper.editorFile2.fsPath}.tmp`));
                    helper.createShowInputBoxStub().resolves(targetFile.path);
                });

                it("should prompt for file destination", async () => {
                    await subject.execute(helper.editorFile2);
                    const prompt = "New Name";
                    const value = path.basename(helper.editorFile2.fsPath);
                    const valueSelection = [value.length - 9, value.length - 3];
                    expect(window.showInputBox).to.have.been.calledWithExactly({
                        prompt,
                        value,
                        valueSelection,
                        ignoreFocusOut: true,
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
                    expect.fail("Must fail");
                } catch {
                    expect(window.showInputBox).to.have.not.been.called;
                }
            });
        });
    });
});
