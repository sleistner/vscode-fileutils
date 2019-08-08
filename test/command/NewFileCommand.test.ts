import { fail } from 'assert';
import * as retry from 'bluebird-retry';
import { expect, use as chaiUse } from 'chai';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import {
    commands, ExtensionContext, MessageItem, QuickPickItem, TextEditor, Uri, window, workspace, WorkspaceFolder
} from 'vscode';
import { NewFileCommand } from '../../src/command';
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

    const sut: NewFileCommand = new NewFileCommand();

    async function openDocument() {
        const uri = Uri.file(editorFile1);
        const textDocument = await workspace.openTextDocument(uri);
        return window.showTextDocument(textDocument);
    }

    function setCacheContext() {
        const context = {
            globalState: {
                get<T>(key: string, defaultValue: T) {
                    return {};
                },
                update<T>(key: string, value: any) {
                    return {};
                }
            }
        };
        Cache.context = context as ExtensionContext;
    }

    beforeEach(async () => {
        fs.removeSync(tmpDir);
        fs.copySync(fixtureFile1, editorFile1);
        fs.copySync(fixtureFile2, editorFile2);
    });

    afterEach(async () => fs.removeSync(tmpDir));

    describe('with relativeToRoot set "false"', () => {
        beforeEach(async () => {
            setCacheContext();

            const fileName = path.basename(targetFile);
            sinon.stub(window, 'showInputBox').returns(Promise.resolve(fileName));

            const item: QuickPickItem = { label: '/', description: '' };
            sinon.stub(window, 'showQuickPick').returns(Promise.resolve(item));

            await retry(async () => openDocument(), { max_tries: 4, interval: 500 });
        });

        afterEach(async () => {
            await commands.executeCommand('workbench.action.closeAllEditors');

            (window.showInputBox as sinon.SinonStub).restore();
            (window.showQuickPick as sinon.SinonStub).restore();
        });

        it('prompts for file destination', async () => {
            await sut.execute();
            const prompt = 'File Name';
            const value = path.join(path.dirname(editorFile1), path.sep);
            const valueSelection = [value.length, value.length];
            expect(window.showInputBox).to.have.been.calledWithExactly({ prompt, value, valueSelection });
        });

        it('create file at destination', async () => {
            await sut.execute();
            const message = `${targetFile} does not exist`;
            expect(fs.existsSync(targetFile), message).to.be.true;
        });

        describe('file path ends with path separator', () => {
            beforeEach(async () => {
                const fileName = path.basename(targetFile) + path.sep;
                (window.showInputBox as sinon.SinonStub).resolves(fileName);
            });

            it('create directory at destination', async () => {
                await sut.execute();
                const message = `${targetFile} must be a directory`;
                expect(fs.statSync(targetFile).isDirectory(), message).to.be.true;
            });
        });

        describe('new file in non existing nested directories', () => {
            beforeEach(async () => {
                const targetDir = path.resolve(tmpDir, 'level-1', 'level-2', 'level-3');
                const stub: any = window.showInputBox;
                stub.returns(Promise.resolve(path.resolve(targetDir, 'file.rb')));
            });

            it('creates nested directories', async () => {
                const textEditor: TextEditor = await sut.execute();
                const dirname = path.dirname(textEditor.document.fileName);
                const directories: string[] = dirname.split(path.sep);

                expect(directories.pop()).to.equal('level-3');
                expect(directories.pop()).to.equal('level-2');
                expect(directories.pop()).to.equal('level-1');
            });
        });

        it('opens new file as active editor', async () => {
            await sut.execute();
            const activeEditor: TextEditor = window.activeTextEditor;
            expect(activeEditor.document.fileName).to.equal(targetFile);
        });

        describe('when target destination exists', () => {
            beforeEach(async () => {
                fs.copySync(editorFile2, targetFile);

                const item: MessageItem = { title: 'placeholder' };
                sinon.stub(window, 'showInformationMessage').returns(Promise.resolve(item));
            });

            afterEach(async () => {
                (window.showInformationMessage as sinon.SinonStub).restore();
            });

            it('asks to overwrite destination file', async () => {
                const message = `File '${targetFile}' already exists.`;
                const action = 'Overwrite';
                const options = { modal: true };

                await sut.execute();
                expect(window.showInformationMessage).to.have.been.calledWith(message, options, action);
            });

            describe('responding with yes', () => {
                it('overwrites the existig file', async () => {
                    await sut.execute();
                    const fileContent = fs.readFileSync(targetFile).toString();
                    expect(fileContent).to.equal('');
                });
            });

            describe('responding with no', () => {
                beforeEach(async () => {
                    (window.showInformationMessage as sinon.SinonStub).resolves(false);
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

    describe('with relativeToRoot set "true"', () => {
        class WorkspaceFolderStub implements WorkspaceFolder {
            constructor(readonly uri: Uri, readonly name: string, readonly index: number) { }
        }
        let workspaceFoldersStub: sinon.SinonStub;

        const workspacePathA = path.join(tmpDir, 'workspaceA');
        const workspacePathB = path.join(tmpDir, 'workspaceB');

        const workspaceFolderA = new WorkspaceFolderStub(Uri.file(workspacePathA), 'a', 0);
        const workspaceFolderB = new WorkspaceFolderStub(Uri.file(workspacePathB), 'b', 1);
        let workspaceFolders: WorkspaceFolder[] = [];

        beforeEach(async () => {
            workspaceFoldersStub = sinon.stub(workspace, 'workspaceFolders').get(() => workspaceFolders);

            sinon.stub(window, 'showInputBox').callsFake(({ value }) => {
                return Promise.resolve(path.join(value, 'filename.txt'));
            });
        });

        afterEach(async () => {
            workspaceFoldersStub.restore();
            (window.showInputBox as sinon.SinonStub).restore();
        });

        describe('with one workspace', () => {
            beforeEach(async () => {
                workspaceFolders.push(workspaceFolderA);
                sinon.stub(workspace, 'getWorkspaceFolder');
            });

            afterEach(async () => {
                (workspace.getWorkspaceFolder as sinon.SinonStub).restore();
                workspaceFolders = [];
            });

            it('selects first workspace', async () => {
                await sut.execute(null, { relativeToRoot: true });
                expect(workspace.getWorkspaceFolder).to.have.not.been.called;

                const prompt = 'File Name';
                const value = path.join(workspacePathA, path.sep);
                const valueSelection = [value.length, value.length];
                expect(window.showInputBox).to.have.been.calledWithExactly({ prompt, value, valueSelection });
            });
        });

        describe('with multiple workspaces', () => {

            beforeEach(async () => {
                workspaceFolders.push(workspaceFolderA, workspaceFolderB);
                sinon.stub(window, 'showWorkspaceFolderPick').returns(Promise.resolve(workspaceFolderB));
            });

            afterEach(async () => {
                (window.showWorkspaceFolderPick as sinon.SinonStub).restore();
                workspaceFolders = [];
            });

            it('shows workspace selector', async () => {
                await sut.execute(null, { relativeToRoot: true });
                expect(window.showWorkspaceFolderPick).to.have.been.calledWith();

                const prompt = 'File Name';
                const value = path.join(workspacePathB, path.sep);
                const valueSelection = [value.length, value.length];
                expect(window.showInputBox).to.have.been.calledWithExactly({ prompt, value, valueSelection });
            });

            describe('with open document', () => {
                beforeEach(async () => {
                    const workspaceFolder: WorkspaceFolder = workspaceFolders[1];
                    sinon.stub(workspace, 'getWorkspaceFolder').returns(workspaceFolder);

                    await retry(async () => openDocument(), { max_tries: 4, interval: 500 });
                });

                afterEach(async () => {
                    (workspace.getWorkspaceFolder as sinon.SinonStub).restore();
                    await commands.executeCommand('workbench.action.closeAllEditors');
                });

                it('selects workspace for open file', async () => {
                    await sut.execute(null, { relativeToRoot: true });
                    expect(workspace.getWorkspaceFolder).to.have.been.calledWith(Uri.file(editorFile1));
                    expect(window.showWorkspaceFolderPick).to.have.not.been.called;
                });
            });
        });
    });
});
