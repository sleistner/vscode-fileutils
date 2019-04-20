import { fail } from 'assert';
import * as retry from 'bluebird-retry';
import { expect, use as chaiUse } from 'chai';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { commands, TextEditor, Uri, window, workspace } from 'vscode';
import { ClipboardUtil } from '../../src/ClipboardUtil';
import { ICommand } from '../../src/command/Command';
import { DuplicateFileCommand } from '../../src/command/DuplicateFileCommand';

chaiUse(sinonChai);

const rootDir = path.resolve(__dirname, '..', '..', '..');
const tmpDir = path.resolve(os.tmpdir(), 'vscode-fileutils-test--duplicate-file');

const fixtureFile1 = path.resolve(rootDir, 'test', 'fixtures', 'file-1.rb');
const fixtureFile2 = path.resolve(rootDir, 'test', 'fixtures', 'file-2.rb');

const editorFile1 = path.resolve(tmpDir, 'file-1.rb');
const editorFile2 = path.resolve(tmpDir, 'file-2.rb');

const targetFile = path.resolve(`${editorFile1}.tmp`);

describe('DuplicateFileCommand', () => {

    const sut: ICommand = new DuplicateFileCommand();

    beforeEach(() => Promise.all([
        fs.remove(tmpDir),
        fs.copy(fixtureFile1, editorFile1),
        fs.copy(fixtureFile2, editorFile2)
    ]));

    afterEach(() => fs.remove(tmpDir));

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

                return sut.execute().then(() => {
                    const prompt = 'Duplicate As';
                    const value = editorFile1;
                    const valueSelection = [value.length - 9, value.length - 3];
                    expect(window.showInputBox).to.have.been.calledWithExactly({ prompt, value, valueSelection });
                });

            });

            it('moves current file to destination', () => {

                return sut.execute().then(() => {
                    const message = `${targetFile} does not exist`;
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

                    return sut.execute().then((textEditor: TextEditor) => {
                        const dirname = path.dirname(textEditor.document.fileName);
                        const directories: string[] = dirname.split(path.sep);

                        expect(directories.pop()).to.equal('level-3');
                        expect(directories.pop()).to.equal('level-2');
                        expect(directories.pop()).to.equal('level-1');
                    });
                });

            });

            it('opens target file as active editor', () => {

                return sut.execute().then(() => {
                    const activeEditor: TextEditor = window.activeTextEditor;
                    expect(activeEditor.document.fileName).to.equal(targetFile);
                });
            });

            describe('when target destination exists', () => {

                beforeEach(() => {

                    const createTargetFile = () => {
                        return fs.copy(editorFile2, targetFile);
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

                    return sut.execute().then(() => {
                        expect(window.showInformationMessage).to.have.been.calledWith(message, options, action);
                    });
                });

                describe(`responding with 'Overwrite'`, () => {

                    it('overwrites the existig file', () => {

                        return sut.execute().then(() => {
                            const fileContent = fs.readFileSync(targetFile).toString();
                            expect(fileContent).to.equal('class FileOne; end');
                        });
                    });

                });

                describe(`responding with 'Cancel'`, () => {

                    beforeEach(() => {
                        const stub: any = window.showInformationMessage;
                        stub.returns(Promise.resolve(false));
                        return Promise.resolve();
                    });

                    it('leaves existing file untouched', async () => {
                        try {
                            await sut.execute();
                            fail('must fail');
                        } catch (e) {
                            const fileContent = fs.readFileSync(targetFile).toString();
                            expect(fileContent).to.equal('class FileTwo; end');
                        }
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

                return sut.execute().catch(() => {
                    expect(window.showInputBox).to.have.not.been.called;
                }).catch(ClipboardUtil.handleClipboardError);
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

            return sut.execute(Uri.file(editorFile1)).then(() => {
                const prompt = 'Duplicate As';
                const value = editorFile1;
                const valueSelection = [value.length - 9, value.length - 3];
                expect(window.showInputBox).to.have.been.calledWithExactly({ prompt, value, valueSelection });
            });

        });

        it('duplicates current file to destination', () => {

            return sut.execute(Uri.file(editorFile1)).then(() => {
                const message = `${targetFile} does not exist`;
                expect(fs.existsSync(targetFile), message).to.be.true;
            });
        });

        it('opens target file as active editor', () => {

            return sut.execute(Uri.file(editorFile1)).then(() => {
                const activeEditor: TextEditor = window.activeTextEditor;
                expect(activeEditor.document.fileName).to.equal(targetFile);
            });
        });

    });
});
