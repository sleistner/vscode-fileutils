import { fail } from 'assert';
import * as retry from 'bluebird-retry';
import { expect, use as chaiUse } from 'chai';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { commands, TextEditor, Uri, window, workspace } from 'vscode';
import { newFile } from '../../src/command/NewFileCommand';

chaiUse(sinonChai);

const rootDir = path.resolve(__dirname, '..', '..', '..');
const tmpDir = path.resolve(os.tmpdir(), 'vscode-fileutils-test--new-file');

const fixtureFile1 = path.resolve(rootDir, 'test', 'fixtures', 'file-1.rb');
const fixtureFile2 = path.resolve(rootDir, 'test', 'fixtures', 'file-2.rb');

const editorFile1 = path.resolve(tmpDir, 'nested-dir-1', 'nested-dir-2', 'file-1.rb');
const editorFile2 = path.resolve(tmpDir, 'file-2.rb');

const targetFile = path.resolve(`${editorFile1}.tmp`);

describe('newFile', () => {
    beforeEach(() => Promise.all([
        fs.remove(tmpDir),
        fs.copy(fixtureFile1, editorFile1),
        fs.copy(fixtureFile2, editorFile2)
    ]));

    afterEach(() => fs.remove(tmpDir));

    describe('with open text document', () => {
        beforeEach(() => {
            const openDocument = () => {
                const uri = Uri.file(editorFile1);
                return workspace.openTextDocument(uri)
                    .then((textDocument) => window.showTextDocument(textDocument));
            };

            const stubShowInputBox = () => {
                const fileName = path.basename(targetFile);
                sinon.stub(window, 'showInputBox').returns(Promise.resolve(fileName));
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
            return newFile().then(() => {
                const prompt = 'File Name';
                expect(window.showInputBox).to.have.been.calledWithExactly({ prompt });
            });
        });

        it('create file at destination', () => {
            return newFile().then(() => {
                const message = `${targetFile} does not exist`;
                // tslint:disable-next-line:no-unused-expression
                expect(fs.existsSync(targetFile), message).to.be.true;
            });
        });

        describe('file path ends with path separator', () => {
            beforeEach(async () => {
                (window.showInputBox as sinon.SinonStub).restore();
                const fileName = path.basename(targetFile) + path.sep;
                sinon.stub(window, 'showInputBox').returns(Promise.resolve(fileName));
            });

            it('create directory at destination', async () => {
                await newFile();
                // tslint:disable-next-line:no-unused-expression
                expect(fs.statSync(targetFile).isDirectory(), `${targetFile} must be a directory`).to.be.true;
            });
        });

        describe('new file in non existing nested directories', () => {
            beforeEach(() => {
                const targetDir = path.resolve(tmpDir, 'level-1', 'level-2', 'level-3');
                const stub: any = window.showInputBox;
                stub.returns(Promise.resolve(path.resolve(targetDir, 'file.rb')));
            });

            it('creates nested directories', () => {
                return newFile().then((textEditor: TextEditor) => {
                    const dirname = path.dirname(textEditor.document.fileName);
                    const directories: string[] = dirname.split(path.sep);

                    expect(directories.pop()).to.equal('level-3');
                    expect(directories.pop()).to.equal('level-2');
                    expect(directories.pop()).to.equal('level-1');
                });
            });
        });

        it('opens new file as active editor', () => {
            return newFile().then(() => {
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

                return newFile().then(() => {
                    expect(window.showInformationMessage).to.have.been.calledWith(message, options, action);
                });
            });

            describe('responding with yes', () => {
                it('overwrites the existig file', async () => {
                    await newFile();
                    const fileContent = fs.readFileSync(targetFile).toString();
                    expect(fileContent).to.equal('');
                });
            });

            describe('responding with no', () => {
                beforeEach(() => {
                    const stub: any = window.showInformationMessage;
                    stub.returns(Promise.resolve(false));
                    return Promise.resolve();
                });

                it('leaves existing file untouched', async () => {
                    try {
                        await newFile();
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
        let workspaceFolderStub: sinon.SinonStub;

        beforeEach(async () => {
            workspaceFolderStub = sinon.stub(workspace, 'workspaceFolders').get(() => undefined);
            sinon.stub(window, 'showInputBox');
        });

        afterEach(async () => {
            workspaceFolderStub.restore();
            (window.showInputBox as sinon.SinonStub).restore();
        });

        it('ignores the command call', async () => {
            try {
                await newFile();
                fail('must fail');
            } catch (e) {
                // tslint:disable-next-line:no-unused-expression
                expect(window.showInputBox).to.have.not.been.called;
            }
        });
    });
});
