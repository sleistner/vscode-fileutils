import { expect, use as chaiUse } from 'chai';
import { paste as clipboardPaste } from 'copy-paste-win32fix';
import * as path from 'path';
import * as sinon from 'sinon';
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

        describe('with open text document', () => {
            // Saving original clipboard content to be able to return it to the clipboard after the test
            let originalClipboardContent = '';

            before(() => {
                const uri = Uri.file(fixtureFile1);

                return ClipboardUtil.getClipboardContent()
                .then((clipboardContent) => {
                    originalClipboardContent = clipboardContent;
                    return workspace.openTextDocument(uri);
                })
                .then((textDocument) => window.showTextDocument(textDocument))
                .catch(ClipboardUtil.handleClipboardError);
            });

            after(() => {
                // After test has finished - return original clipboard content.
                return ClipboardUtil.setClipboardContent(originalClipboardContent)
                .then(() => commands.executeCommand('workbench.action.closeAllEditors'))
                .catch(ClipboardUtil.handleClipboardError);
            });

            it('check file name was copied to clipboard', () => {
                return sut.execute()
                .then(() => {
                    return ClipboardUtil.getClipboardContent()
                    .then((pasteContent) => {
                        expect(pasteContent).to.equal(fixtureFile1Name);
                    });
                }).catch(ClipboardUtil.handleClipboardError);
            });
        });

        describe('with no open text document', () => {
            // Saving original clipboard content to be able to return it to the clipboard after the test
            let originalClipboardContent = '';

            before(() => {
                const closeAllEditors = () => {
                    return commands.executeCommand('workbench.action.closeAllEditors');
                };

                return ClipboardUtil.getClipboardContent()
                .then((clipboardContent) => {
                    originalClipboardContent = clipboardContent;
                    return ClipboardUtil.setClipboardContent(clipboardInitialTestData);
                }).catch(ClipboardUtil.handleClipboardError);
            });

            after(() => {
                // After test has finished - return original clipboard content.
                return ClipboardUtil.setClipboardContent(originalClipboardContent)
                .catch(ClipboardUtil.handleClipboardError);
            });

            it('ignores the command call and verifies that clipboard text did not change', () => {

                return sut.execute()
                .then(() => {
                    // Retrieving clipboard data and verifying that it is indeed the data that was in the
                    // clipboard prior to the test.
                    return ClipboardUtil.getClipboardContent()
                    .then((clipboardData) => {
                        expect(clipboardData).to.equal(clipboardInitialTestData);
                    });
                }).catch(ClipboardUtil.handleClipboardError);
            });
        });
    });
});
