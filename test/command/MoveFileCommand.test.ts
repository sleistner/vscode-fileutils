import { expect } from "chai";
import path from "path";
import sinon from "sinon";
import { Uri, window, workspace } from "vscode";
import { MoveFileCommand } from "../../src/command";
import { MoveFileController } from "../../src/controller";
import * as helper from "../helper";

describe(MoveFileCommand.name, () => {
    const subject = new MoveFileCommand(new MoveFileController(helper.createExtensionContext()));

    beforeEach(async () => {
        await helper.beforeEach();
        helper.createGetConfigurationStub({ "moveFile.typeahead.enabled": false });
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

            helper.protocol.it("should prompt for file destination", subject, "New Location");
            helper.protocol.it("should move current file to destination", subject);
            helper.protocol.describe("with target file in non-existent nested directory", subject);

            describe("configuration", () => {
                describe('when "newFile.typeahead.enabled" is "true"', () => {
                    beforeEach(async () => {
                        await workspace.fs.createDirectory(Uri.file(path.resolve(helper.tmpDir.fsPath, "dir-1")));
                        await workspace.fs.createDirectory(Uri.file(path.resolve(helper.tmpDir.fsPath, "dir-2")));

                        helper.createGetConfigurationStub({ "moveFile.typeahead.enabled": true });
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

        afterEach(async () => helper.restoreShowInputBox());

        helper.protocol.it("should prompt for file destination", subject, "New Location");
        helper.protocol.it("should move current file to destination", subject, helper.editorFile1);
    });
});
