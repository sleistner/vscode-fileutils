import { fail } from 'assert';
import * as retry from 'bluebird-retry';
import { expect, use as chaiUse } from 'chai';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { commands, MessageItem, TextEditor, Uri, window, workspace, WorkspaceConfiguration } from 'vscode';
import { ICommand, RemoveFileCommand } from '../../src/command';

chaiUse(sinonChai);

const rootDir = path.resolve(__dirname, '..', '..', '..');
const tmpDir = path.resolve(os.tmpdir(), 'vscode-fileutils-test--remove-file');

const fixtureFile = path.resolve(rootDir, 'test', 'fixtures', 'file-1.rb');
const editorFile = path.resolve(tmpDir, 'file-1.rb');

describe('RemoveFileCommand', () => {

    const sut: ICommand = new RemoveFileCommand();

    beforeEach(async () => {
        fs.removeSync(tmpDir);
        fs.copySync(fixtureFile, editorFile);
    });

    afterEach(async () => fs.removeSync(tmpDir));

    describe('as command', () => {
        describe('with open text document', () => {
            beforeEach(async () => {
                const openDocument = () => {
                    const uri = Uri.file(editorFile);
                    return workspace.openTextDocument(uri)
                        .then((textDocument) => window.showTextDocument(textDocument));
                };

                const item: MessageItem = { title: 'placeholder' };
                sinon.stub(window, 'showInformationMessage').returns(Promise.resolve(item));

                await retry(() => openDocument(), { max_tries: 4, interval: 500 });
            });

            afterEach(async () => {
                await commands.executeCommand('workbench.action.closeAllEditors');
                (window.showInformationMessage as sinon.SinonStub).restore();
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
                        await sut.execute();
                        const message = `Are you sure you want to delete '${path.basename(editorFile)}'?`;
                        const action = 'Delete';
                        const options = { modal: true };
                        expect(window.showInformationMessage).to.have.been.calledWith(message, options, action);
                    });
                });

                describe('delete.useTrash set to true', () => {
                    beforeEach(async () => {
                        const keys = { 'delete.useTrash': true, 'delete.confirm': true };
                        (workspace.getConfiguration as sinon.SinonStub).returns({ get: (key) => keys[key] });
                    });

                    it('asks to move file to trash', async () => {
                        await sut.execute();
                        const message = `Are you sure you want to delete '${path.basename(editorFile)}'?`;
                        const action = 'Move to Trash';
                        const options = { modal: true };
                        expect(window.showInformationMessage).to.have.been.calledWith(message, options, action);
                    });
                });
            });

            describe('responding with delete', () => {
                it('deletes the file', async () => {
                    await sut.execute();
                    const message = `${editorFile} does exist`;
                    expect(fs.existsSync(editorFile), message).to.be.false;
                });
            });

            describe('responding with no', () => {
                beforeEach(async () => {
                    (window.showInformationMessage as sinon.SinonStub).returns(Promise.resolve(false));
                });

                it('leaves the file untouched', async () => {
                    try {
                        await sut.execute();
                        fail('must fail');
                    } catch (e) {
                        const message = `${editorFile} does not exist`;
                        expect(fs.existsSync(editorFile), message).to.be.true;
                    }
                });
            });

            describe('delete.confirm configuration set to false', () => {
                beforeEach(async () => {
                    const keys = { 'delete.useTrash': false, 'delete.confirm': false };
                    const config = {
                        get: (key) => keys[key]
                    };
                    sinon.stub(workspace, 'getConfiguration').returns(config as WorkspaceConfiguration);
                });

                afterEach(async () => {
                    (workspace.getConfiguration as sinon.SinonStub).restore();
                });

                it('deletes the file without confirmation', async () => {
                    await sut.execute();
                    expect(window.showInformationMessage).to.have.not.been.called;
                    expect(fs.existsSync(editorFile), `${editorFile} does not exist`).to.be.false;
                });
            });

            it('closes file editor', async () => {
                let activeEditor: TextEditor;

                const retryable = async () => {
                    await sut.execute();
                    activeEditor = window.activeTextEditor;

                    if (activeEditor) {
                        throw new Error();
                    }
                };

                await retry(retryable, { max_tries: 4, interval: 500 });
                expect(activeEditor).to.not.exist;
            });
        });

        describe('with no open text document', () => {
            beforeEach(async () => {
                await commands.executeCommand('workbench.action.closeAllEditors');
                sinon.stub(window, 'showInformationMessage');
            });

            afterEach(async () => {
                (window.showInformationMessage as sinon.SinonStub).restore();
            });

            it('ignores the command call', async () => {
                try {
                    await sut.execute();
                    fail('Must fail');
                } catch {
                    expect(window.showInformationMessage).to.have.not.been.called;
                }
            });
        });
    });
});
