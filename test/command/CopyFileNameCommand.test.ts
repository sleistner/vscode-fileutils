import { expect } from 'chai';
import { env } from 'vscode';
import { CopyFileNameCommand } from '../../src/command';
import { CopyFileNameController } from '../../src/controller';
import { FileItem } from '../../src/FileItem';
import * as helper from '../helper';

describe('CopyFileNameCommand', () => {
    const clipboardInitialTestData = 'SOME_TEXT';
    const subject = helper.createTestSubject(CopyFileNameCommand, CopyFileNameController);

    beforeEach(helper.beforeEach);

    afterEach(helper.afterEach);

    describe('as command', () => {
        afterEach(async () => {
            await env.clipboard.writeText(clipboardInitialTestData);
        });

        describe('with open text document', () => {
            beforeEach(async () => helper.openDocument(helper.editorFile1));

            afterEach(async () => helper.closeAllEditors());

            it('puts the file name to the clipboard', async () => {
                await subject.execute();
                const clipboardData = await env.clipboard.readText();
                expect(clipboardData).to.equal(new FileItem(helper.editorFile1).name);
            });
        });

        describe('with no open text document', () => {
            beforeEach(async () => {
                await helper.closeAllEditors();
                await env.clipboard.writeText(clipboardInitialTestData);
            });

            it('ignores the command call and does not change the clipboard data', async () => {
                try {
                    await subject.execute();
                    expect.fail('must fail');
                } catch (e) {
                    const clipboardData = await env.clipboard.readText();
                    expect(clipboardData).to.equal(clipboardInitialTestData);
                }
            });
        });
    });
});
