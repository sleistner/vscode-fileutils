import { expect } from "chai";
import { env } from "vscode";
import { CopyFileNameCommand } from "../../src/command";
import { CopyFileNameController } from "../../src/controller";
import { FileItem } from "../../src/FileItem";
import * as helper from "../helper";

describe("CopyFileNameCommand", () => {
    const clipboardInitialTestData = "SOME_TEXT";
    const subject = new CopyFileNameCommand(new CopyFileNameController(helper.createExtensionContext()));

    beforeEach(helper.beforeEach);

    afterEach(helper.afterEach);

    describe("as command", () => {
        afterEach(async () => {
            await env.clipboard.writeText(clipboardInitialTestData);
        });

        describe("with open text document", () => {
            beforeEach(async () => helper.openDocument(helper.editorFile1));

            afterEach(async () => helper.closeAllEditors());

            it("should put the file name to the clipboard", async () => {
                await subject.execute();
                const clipboardData = await env.clipboard.readText();
                expect(clipboardData).to.equal(new FileItem(helper.editorFile1).name);
            });
        });

        describe("with no open text document", () => {
            beforeEach(async () => {
                await helper.closeAllEditors();
                await env.clipboard.writeText(clipboardInitialTestData);
            });

            it("should ignore the command call and does not change the clipboard data", async () => {
                try {
                    await subject.execute();
                    expect.fail("must fail");
                } catch (e) {
                    const clipboardData = await env.clipboard.readText();
                    expect(clipboardData).to.equal(clipboardInitialTestData);
                }
            });
        });
    });
});
