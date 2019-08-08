import { fail } from 'assert';
import * as retry from 'bluebird-retry';
import { expect, use as chaiUse } from 'chai';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { commands, MessageItem, TextEditor, Uri, window, workspace } from 'vscode';
import { ICommand, MoveFileCommand } from '../../src/command';

chaiUse(sinonChai);

const rootDir = path.resolve(__dirname, '..', '..', '..');
const tmpDir = path.resolve(os.tmpdir(), 'vscode-fileutils-test--move-file');

const fixtureFile1 = path.resolve(rootDir, 'test', 'fixtures', 'file-1.rb');
const fixtureFile2 = path.resolve(rootDir, 'test', 'fixtures', 'file-2.rb');

const editorFile1 = path.resolve(tmpDir, 'file-1.rb');
const editorFile2 = path.resolve(tmpDir, 'file-2.rb');

const targetFile = path.resolve(`${editorFile1}.tmp`);

describe('MoveFileCommand', () => {

    const sut: ICommand = new MoveFileCommand();

    beforeEach(async () => {
        fs.removeSync(tmpDir);
        fs.copySync(fixtureFile1, editorFile1);
        fs.copySync(fixtureFile2, editorFile2);
    });

    afterEach(async () => fs.removeSync(tmpDir));

    describe('as command', () => {

        describe('with open text document', () => {
            beforeEach(async () => {
                const openDocument = () => {
                    const uri = Uri.file(editorFile1);
                    return workspace.openTextDocument(uri)
                        .then((textDocument) => window.showTextDocument(textDocument));
                };

                sinon.stub(window, 'showInputBox').returns(Promise.resolve(targetFile));

                await retry(() => openDocument(), { max_tries: 4, interval: 500 });
            });

            afterEach(async () => {
                await commands.executeCommand('workbench.action.closeAllEditors');
                (window.showInputBox as sinon.SinonStub).restore();
            });

            it('prompts for file destination', async () => {
                await sut.execute();
                const prompt = 'New Location';
                const value = editorFile1;
                const valueSelection = [value.length - 9, value.length - 3];
                expect(window.showInputBox).to.have.been.calledWithExactly({ prompt, value, valueSelection });
            });

            it('moves current file to destination', async () => {
                await sut.execute();
                const message = `${targetFile} does not exist`;
                expect(fs.existsSync(targetFile), message).to.be.true;
            });

            describe('target file in non existing nested directories', () => {
                const targetDir = path.resolve(tmpDir, 'level-1', 'level-2', 'level-3');

                beforeEach(() => {
                    const stub: sinon.SinonStub = window.showInputBox as sinon.SinonStub;
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

            it('opens target file as active editor', async () => {
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
                    await sut.execute();
                    const message = `File '${targetFile}' already exists.`;
                    const action = 'Overwrite';
                    const options = { modal: true };
                    expect(window.showInformationMessage).to.have.been.calledWith(message, options, action);
                });

                describe('responding with Overwrite', () => {
                    it('overwrites the existing file', async () => {
                        await sut.execute();
                        const fileContent = fs.readFileSync(targetFile).toString();
                        expect(fileContent).to.equal('class FileOne; end');
                    });
                });

                describe('responding with Cancel', () => {
                    beforeEach(async () => {
                        (window.showInformationMessage as sinon.SinonStub).returns(Promise.resolve(false));
                    });

                    it('leaves existing file untouched', async () => {
                        try {
                            await sut.execute();
                            fail('must fail');
                        } catch {
                            const fileContent = fs.readFileSync(targetFile).toString();
                            expect(fileContent).to.equal('class FileTwo; end');
                        }
                    });
                });

                describe('configuration', () => {
                    beforeEach(async () => {
                        sinon.stub(workspace, 'getConfiguration');
                        sinon.stub(commands, 'executeCommand').withArgs('workbench.action.closeActiveEditor');
                    });

                    afterEach(async () => {
                        (workspace.getConfiguration as sinon.SinonStub).restore();
                        (commands.executeCommand as sinon.SinonStub).restore();
                    });

                    describe('move.closeOldTab set to true', () => {
                        beforeEach(async () => {
                            const keys = { 'move.closeOldTab': true };
                            (workspace.getConfiguration as sinon.SinonStub).returns({ get: (key) => keys[key] });
                        });

                        it('moves a file and verifies that the tab of the moved file was closed', async () => {
                            await sut.execute();
                            expect(commands.executeCommand).to.have.been.called;
                        });
                    });

                    describe('move.closeOldTab set to false', () => {
                        beforeEach(async () => {
                            const keys = { 'move.closeOldTab': false };
                            (workspace.getConfiguration as sinon.SinonStub).returns({ get: (key) => keys[key] });
                        });

                        it('moves a file and verifies that the tab of the moved file was not closed', async () => {
                            await sut.execute();
                            expect(commands.executeCommand).to.have.not.been.called;
                        });
                    });
                });
            });
        });

        describe('with no open text document', () => {
            beforeEach(async () => {
                await commands.executeCommand('workbench.action.closeAllEditors');
                sinon.stub(window, 'showInputBox');
            });

            afterEach(async () => {
                (window.showInputBox as sinon.SinonStub).restore();
            });

            it('ignores the command call', async () => {
                try {
                    await sut.execute();
                    fail('Must fail');
                } catch {
                    expect(window.showInputBox).to.have.not.been.called;
                }
            });
        });
    });

    describe('as context menu', () => {
        beforeEach(async () => {
            sinon.stub(window, 'showInputBox').returns(Promise.resolve(targetFile));
        });

        afterEach(async () => {
            (window.showInputBox as sinon.SinonStub).restore();
        });

        it('prompts for file destination', async () => {
            await sut.execute(Uri.file(editorFile1));
            const prompt = 'New Location';
            const value = editorFile1;
            const valueSelection = [value.length - 9, value.length - 3];
            expect(window.showInputBox).to.have.been.calledWithExactly({ prompt, value, valueSelection });
        });

        it('moves current file to destination', async () => {
            await sut.execute(Uri.file(editorFile1));
            const message = `${targetFile} does not exist`;
            expect(fs.existsSync(targetFile), message).to.be.true;
        });

        it('opens target file as active editor', async () => {
            await sut.execute(Uri.file(editorFile1));
            const activeEditor: TextEditor = window.activeTextEditor;
            expect(activeEditor.document.fileName).to.equal(targetFile);
        });
    });
});
