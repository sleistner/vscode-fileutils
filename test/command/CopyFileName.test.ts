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
            before(() => {
                const uri = Uri.file(fixtureFile1);
                return workspace.openTextDocument(uri)
                    .then((textDocument) => window.showTextDocument(textDocument));
            });

            after(() => {
                return commands.executeCommand('workbench.action.closeAllEditors');
            });

            it('check file name was copied to clipboard', () => {
                return sut.execute()
                .then(() => {
                    return ClipboardUtil.getClipboardContent()
                    .then((pasteContent) => {
                        expect(pasteContent).to.equal(fixtureFile1Name);
                    });
                })
                .catch((error: Error) => {
                    // Suppressing errors that can be caused by unsupported platforms.
                    if (ClipboardUtil.isClipboardRelatedError(error)) {
                        return;
                    }

                    throw (error);
                });
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
                }).catch((error) => {
                    // Suppressing errors that can be caused by unsupported platforms.
                    if (ClipboardUtil.isClipboardRelatedError(error)) {
                        return;
                    }

                    throw (error);
                }).then(closeAllEditors);
            });

            after(() => {
                // After test has finished - return original clipboard content.
                return ClipboardUtil.setClipboardContent(originalClipboardContent)
                .catch((error) => {
                    // Suppressing errors that can be caused by unsupported platforms.
                    if (ClipboardUtil.isClipboardRelatedError(error)) {
                        return;
                    }

                    throw (error);
                });
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
                })
                .catch((error) => {
                    // As explained in BaseFileController.getSourcePath(),
                    // Whenever the window.activeTextEditor doesn't exist, we attempt to retrieve the source path
                    // with clipboard manipulations.
                    // This can lead to errors in unsupported platforms.
                    // Suppressing these errors in tests.
                    if (ClipboardUtil.isClipboardRelatedError(error)) {
                        return;
                    }

                    throw (error);
                });
            });
        });
    });
});
