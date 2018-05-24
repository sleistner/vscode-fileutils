import { fail } from 'assert';
import * as retry from 'bluebird-retry';
import { expect, use as chaiUse } from 'chai';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { commands, TextEditor, Uri, window, workspace, WorkspaceConfiguration } from 'vscode';
import { controller, removeFile } from '../../src/command/RemoveFileCommand';

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

            it('asks to delete file', () => {

                const message = `Are you sure you want to delete '${path.basename(editorFile)}'?`;
                const action = 'Delete';
                const options = { modal: true };

                const patchConfiguration = () => {
                    const configuration: WorkspaceConfiguration = workspace.getConfiguration('fileutils');
                    return configuration.update('delete.useTrash', false);
                };

                patchConfiguration().then(() => {
                    return removeFile().then(() => {
                        expect(window.showInformationMessage).to.have.been.calledWith(message, options, action);
                    });
                });
            });

            describe('delete.useTrash configuration set to true', () => {
                it('asks to move file to trash', () => {

                    const message = `Are you sure you want to delete '${path.basename(editorFile)}'?`;
                    const action = 'Move to Trash';
                    const options = { modal: true };

                    const patchConfiguration = () => {
                        const configuration: WorkspaceConfiguration = workspace.getConfiguration('fileutils');
                        return configuration.update('delete.useTrash', true);
                    };

                    patchConfiguration().then(() => {
                        return removeFile().then(() => {
                            expect(window.showInformationMessage).to.have.been.calledWith(message, options, action);
                        });
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

                beforeEach(() => {
                    const stub: any = window.showInformationMessage;
                    stub.returns(Promise.resolve(false));
                    return Promise.resolve();
                });

                it('leaves the file untouched', () => {

                    return removeFile().then(() => {
                        const message = `${editorFile} does not exist`;
                        // tslint:disable-next-line:no-unused-expression
                        expect(fs.existsSync(editorFile), message).to.be.true;
                    });
                });

            });

            describe('delete.confirm configuration set to false', () => {

                beforeEach(() => {
                    const stub: any = window.showInformationMessage;
                    return Promise.resolve();
                });

                it('deletes the file without confirmation', () => {
                    const patchConfiguration = () => {
                        const configuration: WorkspaceConfiguration = workspace.getConfiguration('fileutils');
                        return configuration.update('delete.confirm', false);
                    };

                    patchConfiguration().then(() => {
                        return removeFile().then(() => {
                            // tslint:disable-next-line:no-unused-expression
                            expect(window.showInformationMessage).to.have.not.been.called;
                            const message = `${editorFile} does not exist`;
                            // tslint:disable-next-line:no-unused-expression
                            expect(fs.existsSync(editorFile), message).to.be.true;
                        });
                    }, fail);
                });
            });

            it('closes file editor', () => {

                return new Promise((resolve, reject) => {

                    let i = 10;

                    removeFile().then(() => {

                        const interval = setInterval(() => {

                            const activeEditor: TextEditor = window.activeTextEditor;

                            if (activeEditor && --i) {
                                return;
                            }

                            clearInterval(interval);
                            expect(activeEditor).not.exist;  // tslint:disable-line:no-unused-expression
                            resolve();

                        }, 100);

                    }).catch(reject);
                });

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

    describe('error handling', () => {

        beforeEach(() => {
            sinon.stub(controller, 'showDialog').returns(Promise.reject('must fail'));
            sinon.stub(window, 'showErrorMessage');
            return Promise.resolve();
        });

        afterEach(() => {

            const restoreShowRemoveFileDialog = () => {
                const stub: any = controller.showDialog;
                return Promise.resolve(stub.restore());
            };

            const restoreShowErrorMessage = () => {
                const stub: any = window.showErrorMessage;
                return Promise.resolve(stub.restore());
            };

            return Promise.all([
                restoreShowRemoveFileDialog(),
                restoreShowErrorMessage()
            ]);
        });

        it('shows an error message', () => {

            return removeFile().catch((err) => {
                expect(window.showErrorMessage).to.have.been.calledWithExactly('must fail');
            });
        });

    });

});
