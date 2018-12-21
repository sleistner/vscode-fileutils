import { fail } from 'assert';
import * as retry from 'bluebird-retry';
import { expect, use as chaiUse } from 'chai';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { commands, ExtensionContext, TextEditor, Uri, window, workspace } from 'vscode';
import { ICommand, NewFileCommand } from '../../src/command';
import { Cache } from '../../src/lib/Cache';

chaiUse(sinonChai);

const rootDir = path.resolve(__dirname, '..', '..', '..');
const tmpDir = path.resolve(os.tmpdir(), 'vscode-fileutils-test--new-file');

const fixtureFile1 = path.resolve(rootDir, 'test', 'fixtures', 'file-1.rb');
const fixtureFile2 = path.resolve(rootDir, 'test', 'fixtures', 'file-2.rb');

const editorFile1 = path.resolve(tmpDir, 'nested-dir-1', 'nested-dir-2', 'file-1.rb');
const editorFile2 = path.resolve(tmpDir, 'file-2.rb');

const targetFile = path.resolve(`${editorFile1}.tmp`);

describe('NewFileCommand', () => {

    const sut: ICommand = new NewFileCommand();

    beforeEach(() => Promise.all([
        fs.remove(tmpDir),
        fs.copy(fixtureFile1, editorFile1),
        fs.copy(fixtureFile2, editorFile2)
    ]));

    afterEach(() => fs.remove(tmpDir));

    describe('with open text document', () => {
        beforeEach(() => {
            const context = {
                globalState: {
                    get(...args) {
                        return {};
                    },
                    update(...args) {
                        return {};
                    }
                }
            };
            Cache.context = context as ExtensionContext;

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

            const stubShowQuickPick = () => {
                sinon.stub(window, 'showQuickPick').returns(Promise.resolve({ label: '/' }));
                return Promise.resolve();
            };

            return Promise.all([
                retry(() => openDocument(), { max_tries: 4, interval: 500 }),
                stubShowInputBox(),
                stubShowQuickPick()
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

            const restoreShowQuickPick = () => {
                const stub: any = window.showQuickPick;
                return Promise.resolve(stub.restore());
            };

            return Promise.all([
                closeAllEditors(),
                restoreShowInputBox(),
                restoreShowQuickPick()
            ]);
        });

        it('prompts for file destination', () => {
            return sut.execute().then(() => {
                const prompt = 'File Name';
                const value = path.join(path.dirname(editorFile1), path.sep);
                const valueSelection = [value.length, value.length];
                expect(window.showInputBox).to.have.been.calledWithExactly({ prompt, value, valueSelection });
            });
        });

        it('create file at destination', () => {
            return sut.execute().then(() => {
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
                await sut.execute();
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
                return sut.execute().then((textEditor: TextEditor) => {
                    const dirname = path.dirname(textEditor.document.fileName);
                    const directories: string[] = dirname.split(path.sep);

                    expect(directories.pop()).to.equal('level-3');
                    expect(directories.pop()).to.equal('level-2');
                    expect(directories.pop()).to.equal('level-1');
                });
            });
        });

        it('opens new file as active editor', () => {
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

            describe('responding with yes', () => {
                it('overwrites the existig file', async () => {
                    await sut.execute();
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
                await sut.execute();
                fail('must fail');
            } catch (e) {
                // tslint:disable-next-line:no-unused-expression
                expect(window.showInputBox).to.have.not.been.called;
            }
        });
    });
});
