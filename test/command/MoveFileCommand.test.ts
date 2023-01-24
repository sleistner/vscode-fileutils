import { expect } from "chai";
import sinon from "sinon";
import { window } from "vscode";
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

            helper.protocol.it("should prompt for file destination", subject, "New Location");
            helper.protocol.it("should move current file to destination", subject);
            helper.protocol.describe("with target file in non-existent nested directory", subject);

            describe("configuration", () => {
                describe('when "newFile.typeahead.enabled" is "true"', () => {
                    beforeEach(async () => {
                        helper.createGetConfigurationStub({ "moveFile.typeahead.enabled": true });
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
                        helper.createGetConfigurationStub({ "moveFile.typeahead.enabled": false });
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
        beforeEach(async () => helper.createShowInputBoxStub().resolves(helper.targetFile.path));

        helper.protocol.it("should prompt for file destination", subject, "New Location");
        helper.protocol.it("should move current file to destination", subject, helper.editorFile1);
    });
});
