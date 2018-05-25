import { fail } from 'assert';
import * as retry from 'bluebird-retry';
import { expect, use as chaiUse } from 'chai';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { commands, TextEditor, Uri, window, workspace } from 'vscode';
import { removeFile } from '../../src/command/RemoveFileCommand';

chaiUse(sinonChai);

const rootDir = path.resolve(__dirname, '..', '..', '..');
const tmpDir = path.resolve(os.tmpdir(), 'vscode-fileutils-test--remove-file');

const fixtureFile = path.resolve(rootDir, 'test', 'fixtures', 'file-1.rb');
const editorFile = path.resolve(tmpDir, 'file-1.rb');

describe('removeFile', () => {
    beforeEach(() => Promise.all([
        fs.remove(tmpDir),
        fs.copy(fixtureFile, editorFile),
    ]));

    afterEach(() => fs.remove(tmpDir));

    describe('as command', () => {
        describe('with open text document', () => {
            beforeEach(() => {
                const openDocument = () => {
                    const uri = Uri.file(editorFile);
                    return workspace.openTextDocument(uri)
                        .then((textDocument) => window.showTextDocument(textDocument));
                };

                const stubShowInformationMessage = () => {
                    sinon.stub(window, 'showInformationMessage').returns(Promise.resolve(true));
                    return Promise.resolve();
                };

                return Promise.all([
                    retry(() => openDocument(), { max_tries: 4, interval: 500 }),
                    stubShowInformationMessage()
                ]);
            });

            afterEach(() => {
                const closeAllEditors = () => {
                    return commands.executeCommand('workbench.action.closeAllEditors');
                };

                const restoreShowInformationMessage = () => {
                    const stub: any = window.showInformationMessage;
                    return Promise.resolve(stub.restore());
                };

                return Promise.all([
                    closeAllEditors(),
                    restoreShowInformationMessage()
                ]);
            });

            describe('configuration', () => {
                beforeEach(async () => {
                    sinon.stub(workspace, 'getConfiguration');
                });

                afterEach(async () => {
                    (workspace.getConfiguration as sinon.SinonStub).restore();
                });

                describe('delete.useTrash set to false', () => {
                    beforeEach(async () => {
                        const keys = { 'delete.useTrash': false, 'delete.confirm': true };
                        (workspace.getConfiguration as sinon.SinonStub).returns({ get: (key) => keys[key] });
                    });

                    it('asks to delete file', async () => {
                        const message = `Are you sure you want to delete '${path.basename(editorFile)}'?`;
                        const action = 'Delete';
                        const options = { modal: true };

                        await removeFile();
                        expect(window.showInformationMessage).to.have.been.calledWith(message, options, action);
                    });
                });

                describe('delete.useTrash set to true', () => {
                    beforeEach(async () => {
                        const keys = { 'delete.useTrash': true, 'delete.confirm': true };
                        (workspace.getConfiguration as sinon.SinonStub).returns({ get: (key) => keys[key] });
                    });

                    it('asks to move file to trash', async () => {
                        const message = `Are you sure you want to delete '${path.basename(editorFile)}'?`;
                        const action = 'Move to Trash';
                        const options = { modal: true };

                        await removeFile();
                        expect(window.showInformationMessage).to.have.been.calledWith(message, options, action);
                    });
                });
            });

            describe('responding with delete', () => {
                it('deletes the file', () => {
                    return removeFile().then(() => {
                        const message = `${editorFile} does exist`;
                        // tslint:disable-next-line:no-unused-expression
                        expect(fs.existsSync(editorFile), message).to.be.false;
                    });
                });
            });

            describe('responding with no', () => {
                beforeEach(async () => {
                    (window.showInformationMessage as sinon.SinonStub).returns(Promise.resolve(false));
                });

                it('leaves the file untouched', async () => {
                    try {
                        await removeFile();
                        fail('must fail');
                    } catch (e) {
                        const message = `${editorFile} does not exist`;
                        // tslint:disable-next-line:no-unused-expression
                        expect(fs.existsSync(editorFile), message).to.be.true;
                    }
                });
            });

            describe('delete.confirm configuration set to false', () => {
                beforeEach(async () => {
                    const keys = { 'delete.useTrash': false, 'delete.confirm': false };
                    sinon.stub(workspace, 'getConfiguration').returns({ get: (key) => keys[key] });
                });

                afterEach(async () => {
                    (workspace.getConfiguration as sinon.SinonStub).restore();
                });

                it('deletes the file without confirmation', async () => {
                    await removeFile();
                    // tslint:disable-next-line:no-unused-expression
                    expect(window.showInformationMessage).to.have.not.been.called;
                    // tslint:disable-next-line:no-unused-expression
                    expect(fs.existsSync(editorFile), `${editorFile} does not exist`).to.be.false;
                });
            });

            it('closes file editor', async () => {
                let activeEditor: TextEditor;

                const retryable = async () => {
                    await removeFile();
                    activeEditor = window.activeTextEditor;

                    if (activeEditor) {
                        throw new Error();
                    }
                };

                await retry(retryable, { max_tries: 4, interval: 500 });
                expect(activeEditor).to.not.exist;  // tslint:disable-line:no-unused-expression
            });
        });

        describe('with no open text document', () => {
            beforeEach(() => {
                const closeAllEditors = () => {
                    return commands.executeCommand('workbench.action.closeAllEditors');
                };

                const stubShowInformationMessage = () => {
                    sinon.stub(window, 'showInformationMessage');
                    return Promise.resolve();
                };

                return Promise.all([
                    closeAllEditors(),
                    stubShowInformationMessage()
                ]);
            });

            afterEach(() => {
                const stub: any = window.showInformationMessage;
                return Promise.resolve(stub.restore());
            });

            it('ignores the command call', () => {
                return removeFile().catch(() => {
                    // tslint:disable-next-line:no-unused-expression
                    expect(window.showInformationMessage).to.have.not.been.called;
                });
            });
        });
    });
});
