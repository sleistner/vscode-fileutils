import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import { window } from "vscode";
import { RemoveFileCommand } from "../../src/command";
import { RemoveFileController } from "../../src/controller";
import * as helper from "../helper";

describe(RemoveFileCommand.name, () => {
    const subject = new RemoveFileCommand(new RemoveFileController(helper.createExtensionContext()));

    beforeEach(helper.beforeEach);

    afterEach(helper.afterEach);

    describe("as command", () => {
        describe("with open text document", () => {
            beforeEach(async () => {
                await helper.openDocument(helper.editorFile1);
                helper.createShowInformationMessageStub().resolves(helper.targetFile.path);
                helper.createGetConfigurationStub({});
            });

            afterEach(async () => {
                await helper.closeAllEditors();
                helper.restoreShowInformationMessage();
                helper.restoreGetConfiguration();
            });

            describe("configuration", () => {
                describe('when "explorer.confirmDelete" is "true"', () => {
                    beforeEach(async () => {
                        helper.createGetConfigurationStub({ confirmDelete: true });
                    });

                    it("should show a confirmation dialog", async () => {
                        await subject.execute();
                        const message = `Are you sure you want to delete '${path.basename(helper.editorFile1.path)}'?`;
                        const action = "Move to Trash";
                        const options = { modal: true };
                        expect(window.showInformationMessage).to.have.been.calledWith(message, options, action);
                    });
                });

                describe('when "explorer.confirmDelete" is "false"', () => {
                    beforeEach(async () => {
                        helper.createGetConfigurationStub({ confirmDelete: false });
                    });

                    it("should delete the file without confirmation", async () => {
                        await subject.execute();
                        const message = `${helper.editorFile1.path} does not exist`;
                        expect(window.showInformationMessage).to.have.not.been.called;
                        expect(fs.existsSync(helper.editorFile1.fsPath), message).to.be.false;
                    });
                });
            });

            describe('when answered with "Move to Trash"', () => {
                it("should delete the file", async () => {
                    await subject.execute();
                    const message = `${helper.editorFile1.path} does exist`;
                    expect(fs.existsSync(helper.editorFile1.fsPath), message).to.be.false;
                });
            });

            describe('when answered with "Cancel"', () => {
                beforeEach(async () => {
                    helper.createGetConfigurationStub({ confirmDelete: true });
                    helper.createShowInformationMessageStub().resolves(false);
                });

                it("should leave the file untouched", async () => {
                    try {
                        await subject.execute();
                        expect.fail("Must fail");
                    } catch (e) {
                        const message = `${helper.editorFile1.path} does not exist`;
                        expect(fs.existsSync(helper.editorFile1.fsPath), message).to.be.true;
                    }
                });
            });
        });

        describe("without an open text document", () => {
            beforeEach(async () => {
                await helper.closeAllEditors();
                helper.createShowInformationMessageStub();
            });

            afterEach(async () => helper.restoreShowInformationMessage());

            it("should ignore the command call", async () => {
                try {
                    await subject.execute();
                    expect.fail("Must fail");
                } catch {
                    expect(window.showInformationMessage).to.have.not.been.called;
                }
            });
        });
    });
});
