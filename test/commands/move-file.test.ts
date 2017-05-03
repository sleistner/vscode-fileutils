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
    moveFile
} from '../../src/extension/commands';

chai.use(sinonChai);

const rootDir = path.resolve(__dirname, '..', '..', '..');
const tmpDir = path.resolve(os.tmpdir(), 'vscode-fileutils-test--move-file');

const fixtureFile1 = path.resolve(rootDir, 'test', 'fixtures', 'file-1.rb');
const fixtureFile2 = path.resolve(rootDir, 'test', 'fixtures', 'file-2.rb');

const editorFile1 = path.resolve(tmpDir, 'file-1.rb');
const editorFile2 = path.resolve(tmpDir, 'file-2.rb');

const targetFile = path.resolve(`${editorFile1}.tmp`);

describe('moveFile', () => {

    beforeEach(() => Promise.all([
        fs.removeAsync(tmpDir),
        fs.copyAsync(fixtureFile1, editorFile1),
        fs.copyAsync(fixtureFile2, editorFile2)
    ]));

    afterEach(() => fs.removeAsync(tmpDir));

    describe('as command', () => {

        describe('with open text document', () => {

            beforeEach(() => {

                const openDocument = () => {
                    const uri = Uri.file(editorFile1);
                    return workspace.openTextDocument(uri)
                        .then((textDocument) => window.showTextDocument(textDocument));
                };

                const stubShowInputBox = () => {
                    sinon.stub(window, 'showInputBox').returns(Promise.resolve(targetFile));
                    return Promise.resolve();
                };

                return Promise.all([
                    retry(() => openDocument(), { max_tries: 4, interval: 500 }),
                    stubShowInputBox()
                ]);
            });

            afterEach(() => {

                const closeAllEditors = () => {
                    return commands.executeCommand('workbench.action.closeAllEditors');
                };

                const restoreShowInputBox = () => {
                    const stub: any = window.showInputBox;
                    return Promise.resolve(stub.restore());
                };

                return Promise.all([
                    closeAllEditors(),
                    restoreShowInputBox()
                ]);
            });

            it('prompts for file destination', () => {

                return moveFile().then(() => {
                    const prompt = 'New Location';
                    const value = editorFile1;
                    expect(window.showInputBox).to.have.been.calledWithExactly({ prompt, value });
                });

            });

            it('moves current file to destination', () => {

                return moveFile().then(() => {
                    const message = `${targetFile} does not exist`;
                    // tslint:disable-next-line:no-unused-expression
                    expect(fs.existsSync(targetFile), message).to.be.true;
                });
            });

            describe('target file in non existing nested directories', () => {

                const targetDir = path.resolve(tmpDir, 'level-1', 'level-2', 'level-3');

                beforeEach(() => {
                    const stub: any = window.showInputBox;
                    stub.returns(Promise.resolve(path.resolve(targetDir, 'file.rb')));
                });

                it('creates nested directories', () => {

                    return moveFile().then((textEditor: TextEditor) => {
                        const dirname = path.dirname(textEditor.document.fileName);
                        const directories: string[] = dirname.split(path.sep);

                        expect(directories.pop()).to.equal('level-3');
                        expect(directories.pop()).to.equal('level-2');
                        expect(directories.pop()).to.equal('level-1');
                    });
                });

            });

            it('opens target file as active editor', () => {

                return moveFile().then(() => {
                    const activeEditor: TextEditor = window.activeTextEditor;
                    expect(activeEditor.document.fileName).to.equal(targetFile);
                });
            });

            describe('when target destination exists', () => {

                beforeEach(() => {

                    const createTargetFile = () => {
                        return fs.copyAsync(editorFile2, targetFile);
                    };

                    const stubShowInformationMessage = () => {
                        sinon.stub(window, 'showInformationMessage').returns(Promise.resolve(true));
                        return Promise.resolve();
                    };

                    return Promise.all([
                        createTargetFile(),
                        stubShowInformationMessage()
                    ]);
                });

                afterEach(() => {
                    const stub: any = window.showInformationMessage;
                    return Promise.resolve(stub.restore());
                });

                it('asks to overwrite destination file', () => {

                    const message = `File '${targetFile}' already exists.`;
                    const action = 'Overwrite';
                    const options = { modal: true };

                    return moveFile().then(() => {
                        expect(window.showInformationMessage).to.have.been.calledWith(message, options, action);
                    });
                });

                describe('responding with Overwrite', () => {

                    it('overwrites the existing file', () => {

                        return moveFile().then(() => {
                            const fileContent = fs.readFileSync(targetFile).toString();
                            expect(fileContent).to.equal('class FileOne; end');
                        });
                    });

                });

                describe('responding with Cancel', () => {

                    beforeEach(() => {
                        const stub: any = window.showInformationMessage;
                        stub.returns(Promise.resolve(false));
                        return Promise.resolve();
                    });

                    it('leaves existing file untouched', () => {

                        return moveFile().then(() => {
                            const fileContent = fs.readFileSync(targetFile).toString();
                            expect(fileContent).to.equal('class FileTwo; end');
                        });
                    });

                });

            });

        });

        describe('with no open text document', () => {

            beforeEach(() => {

                const closeAllEditors = () => {
                    return commands.executeCommand('workbench.action.closeAllEditors');
                };

                const stubShowInputBox = () => {
                    sinon.stub(window, 'showInputBox');
                    return Promise.resolve();
                };

                return Promise.all([
                    closeAllEditors(),
                    stubShowInputBox()
                ]);
            });

            afterEach(() => {
                const stub: any = window.showInputBox;
                return Promise.resolve(stub.restore());
            });

            it('ignores the command call', () => {

                return moveFile().catch(() => {
                    // tslint:disable-next-line:no-unused-expression
                    expect(window.showInputBox).to.have.not.been.called;
                });
            });

        });

    });

    describe('as context menu', () => {

        beforeEach(() => {
            sinon.stub(window, 'showInputBox').returns(Promise.resolve(targetFile));
            return Promise.resolve();
        });

        afterEach(() => {
            const stub: any = window.showInputBox;
            return Promise.resolve(stub.restore());
        });

        it('prompts for file destination', () => {

            return moveFile(Uri.file(editorFile1)).then(() => {
                const prompt = 'New Location';
                const value = editorFile1;
                expect(window.showInputBox).to.have.been.calledWithExactly({ prompt, value });
            });

        });

        it('moves current file to destination', () => {

            return moveFile(Uri.file(editorFile1)).then(() => {
                const message = `${targetFile} does not exist`;
                // tslint:disable-next-line:no-unused-expression
                expect(fs.existsSync(targetFile), message).to.be.true;
            });
        });

        it('opens target file as active editor', () => {

            return moveFile(Uri.file(editorFile1)).then(() => {
                const activeEditor: TextEditor = window.activeTextEditor;
                expect(activeEditor.document.fileName).to.equal(targetFile);
            });
        });

    });

    describe('error handling', () => {

        beforeEach(() => {
            sinon.stub(controller, 'showMoveFileDialog').returns(Promise.reject('must fail'));
            sinon.stub(window, 'showErrorMessage');
            return Promise.resolve();
        });

        afterEach(() => {

            const restoreShowMoveFileDialog = () => {
                const stub: any = controller.showMoveFileDialog;
                return Promise.resolve(stub.restore());
            };

            const restoreShowErrorMessage = () => {
                const stub: any = window.showErrorMessage;
                return Promise.resolve(stub.restore());
            };

            return Promise.all([
                restoreShowMoveFileDialog(),
                restoreShowErrorMessage()
            ]);
        });

        it('shows an error message', () => {

            return moveFile().catch(() => {
                expect(window.showErrorMessage).to.have.been.calledWithExactly('must fail');
            });
        });

    });

});
