import {
    expect,
    use as chaiUse
} from 'chai';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { openTextDocument } from '../helper';

import {
    commands,
    TextEditor,
    Uri,
    window,
    workspace
} from 'vscode';

import { fail } from 'assert';
import {
    controller,
    newFile
} from '../../src/extension/commands';

chaiUse(sinonChai);

const rootDir = path.resolve(__dirname, '..', '..', '..');
const tmpDir = path.resolve(os.tmpdir(), 'vscode-fileutils-test--new-file');

const fixtureFile1 = path.resolve(rootDir, 'test', 'fixtures', 'file-1.rb');
const fixtureFile2 = path.resolve(rootDir, 'test', 'fixtures', 'file-2.rb');

const editorFile1 = path.resolve(tmpDir, 'nested-dir-1', 'nested-dir-2', 'file-1.rb');
const editorFile2 = path.resolve(tmpDir, 'file-2.rb');

const targetFile = path.resolve(`${editorFile1}.tmp`);

describe('newFile', () => {

    beforeEach(async () => {
        await fs.remove(tmpDir);
        await fs.copy(fixtureFile1, editorFile1);
        await fs.copy(fixtureFile2, editorFile2);
    });

    afterEach(() => fs.remove(tmpDir));

    describe('with open text document', () => {

        beforeEach(async () => {
            const fileName = path.basename(targetFile);
            sinon.stub(window, 'showInputBox').returns(Promise.resolve(fileName));

            return openTextDocument(editorFile1);
        });

        afterEach(async () => {
            await commands.executeCommand('workbench.action.closeAllEditors');
            (window.showInputBox as sinon.SinonStub).restore();
        });

        it('prompts for file destination', async () => {
            await newFile();
            expect(window.showInputBox).to.have.been.calledWithExactly({ prompt: 'File Name' });
        });

        it('create file at destination', async () => {
            await newFile();
            // tslint:disable-next-line:no-unused-expression
            expect(fs.existsSync(targetFile), `${targetFile} does not exist`).to.be.true;
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
                const stub: sinon.SinonStub = window.showInputBox as sinon.SinonStub;
                stub.returns(Promise.resolve(path.resolve(targetDir, 'file.rb')));
            });

            it('creates nested directories', async () => {
                const textEditor: TextEditor = await newFile();
                const dirname = path.dirname(textEditor.document.fileName);
                const directories: string[] = dirname.split(path.sep);

                expect(directories.pop()).to.equal('level-3');
                expect(directories.pop()).to.equal('level-2');
                expect(directories.pop()).to.equal('level-1');
            });
        });

        it('opens new file as active editor', async () => {
            await newFile();
            const activeEditor: TextEditor = window.activeTextEditor;
            expect(activeEditor.document.fileName).to.equal(targetFile);
        });

        describe('when target destination exists', () => {
            beforeEach(async () => {
                await fs.copy(editorFile2, targetFile);
                sinon.stub(window, 'showInformationMessage').returns(Promise.resolve(true));
            });

            afterEach(async () => {
                (window.showInformationMessage as sinon.SinonStub).restore();
            });

            it('asks to overwrite destination file', async () => {
                const message = `File '${targetFile}' already exists.`;
                const action = 'Overwrite';
                const options = { modal: true };

                await newFile();
                expect(window.showInformationMessage).to.have.been.calledWith(message, options, action);
            });

            describe('responding with yes', () => {
                it('overwrites the existig file', async () => {
                    await newFile();
                    const fileContent = fs.readFileSync(targetFile).toString();
                    expect(fileContent).to.equal('');
                });
            });

            describe('responding with no', () => {
                beforeEach(async () => {
                    const stub: sinon.SinonStub = window.showInformationMessage as sinon.SinonStub;
                    stub.returns(Promise.resolve(false));
                });

                it('leaves existing file untouched', async () => {
                    await newFile();
                    const fileContent = fs.readFileSync(targetFile).toString();
                    expect(fileContent).to.equal('class FileTwo; end');
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
            const stub: sinon.SinonStub = window.showInputBox as sinon.SinonStub;
            stub.restore();
        });

        it('ignores the command call', async () => {
            try {
                await newFile();
                fail('Call must not be executed');
            } catch (e) {
                // tslint:disable-next-line:no-unused-expression
                expect(window.showInputBox).to.have.not.been.called;
            }
        });
    });

    describe('error handling', () => {
        beforeEach(async () => {
            sinon.stub(controller, 'showNewFileDialog').returns(Promise.reject('must fail'));
            sinon.stub(window, 'showErrorMessage');
        });

        afterEach(async () => {
            (controller.showNewFileDialog as sinon.SinonStub).restore();
            (window.showErrorMessage as sinon.SinonStub).restore();
        });

        it('shows an error message', async () => {
            try {
                await newFile();
                fail('Call must not be executed');
            } catch (e) {
                expect(window.showErrorMessage).to.have.been.calledWithExactly('must fail');
            }
        });
    });
});
