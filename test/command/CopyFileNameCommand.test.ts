import { fail } from 'assert';
import { expect, use as chaiUse } from 'chai';
import * as path from 'path';
import * as sinonChai from 'sinon-chai';
import { commands, Uri, window, workspace } from 'vscode';
import { ClipboardUtil } from '../../src/ClipboardUtil';
import { CopyFileNameCommand, ICommand } from '../../src/command';

chaiUse(sinonChai);

const rootDir = path.resolve(__dirname, '..', '..', '..');

const fixtureFile1Name = 'file-1.rb';
const fixtureFile1 = path.resolve(rootDir, 'test', 'fixtures', fixtureFile1Name);

const clipboardInitialTestData = 'SOME_TEXT';

describe('CopyFileNameCommand', () => {
    const sut: ICommand = new CopyFileNameCommand();

    describe('as command', () => {
        after(async () => {
            await ClipboardUtil.setClipboardContent(clipboardInitialTestData);
        });

        describe('with open text document', () => {
            before(async () => {
                const uri = Uri.file(fixtureFile1);
                const textDocument = await workspace.openTextDocument(uri);
                await window.showTextDocument(textDocument);
            });

            after(async () => {
                await commands.executeCommand('workbench.action.closeAllEditors');
            });

            it('puts the file name to the clipboard', async () => {
                await sut.execute();
                const pasteContent = await ClipboardUtil.getClipboardContent();
                expect(pasteContent).to.equal(fixtureFile1Name);
            });
        });

        describe('with no open text document', () => {
            before(async () => {
                await commands.executeCommand('workbench.action.closeAllEditors');
                await ClipboardUtil.setClipboardContent(clipboardInitialTestData);
            });

            it('ignores the command call and does not change the clipboard data', async () => {
                try {
                    await sut.execute();
                    fail('must fail');
                } catch (e) {
                    const clipboardData = await ClipboardUtil.getClipboardContent();
                    expect(clipboardData).to.equal(clipboardInitialTestData);
                }
            });
        });
    });
});
