import * as retry from 'bluebird-retry';
import * as chai from 'chai';
import { expect } from 'chai';
import * as fs from 'fs-extra-promise';
import * as os from 'os';
import * as path from 'path';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

import {
    commands,
    TextEditor,
    Uri,
    window,
    workspace
} from 'vscode';

import {
    controller,
    removeFile
} from '../../src/extension/commands';

chai.use(sinonChai);

const rootDir = path.resolve(__dirname, '..', '..', '..');
const tmpDir = path.resolve(os.tmpdir(), 'vscode-fileutils-test--remove-file');

const fixtureFile = path.resolve(rootDir, 'test', 'fixtures', 'file-1.rb');
const editorFile = path.resolve(tmpDir, 'file-1.rb');

describe('removeFile', () => {

    beforeEach(() => Promise.all([
        fs.removeAsync(tmpDir),
        fs.copyAsync(fixtureFile, editorFile),
    ]));

    afterEach(() => fs.removeAsync(tmpDir));

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

                return removeFile().then(() => {
                    expect(window.showInformationMessage).to.have.been.calledWith(message, options, action);
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
            sinon.stub(controller, 'showRemoveFileDialog').returns(Promise.reject('must fail'));
            sinon.stub(window, 'showErrorMessage');
            return Promise.resolve();
        });

        afterEach(() => {

            const restoreShowRemoveFileDialog = () => {
                const stub: any = controller.showRemoveFileDialog;
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
