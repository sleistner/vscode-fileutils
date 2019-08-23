import * as retry from 'bluebird-retry';
import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { window } from 'vscode';
import { RemoveFileCommand } from '../../src/command';
import { RemoveFileController } from '../../src/controller';
import * as helper from '../helper';

describe('RemoveFileCommand', () => {
    const subject = helper.createTestSubject(RemoveFileCommand, RemoveFileController);

    beforeEach(helper.beforeEach);

    afterEach(helper.afterEach);

    describe('as command', () => {
        describe('with open text document', () => {
            beforeEach(async () => {
                await helper.openDocument(helper.editorFile1);
                helper.createShowInformationMessageStub().resolves(helper.targetFile.path);
            });

            afterEach(async () => {
                await helper.closeAllEditors();
                helper.restoreShowInformationMessage();
            });

            describe('configuration', () => {
                afterEach(async () => helper.restoreGetConfiguration());

                describe('delete.useTrash set to false', () => {
                    beforeEach(async () => {
                        helper.createGetConfigurationStub({ 'delete.useTrash': false, 'delete.confirm': true });
                    });

                    it('asks to delete file', async () => {
                        await subject.execute();
                        const message = `Are you sure you want to delete '${path.basename(helper.editorFile1.path)}'?`;
                        const action = 'Delete';
                        const options = { modal: true };
                        expect(window.showInformationMessage).to.have.been.calledWith(message, options, action);
                    });
                });

                describe('delete.useTrash set to true', () => {
                    beforeEach(async () => {
                        helper.createGetConfigurationStub({ 'delete.useTrash': true, 'delete.confirm': true });
                    });

                    it('asks to move file to trash', async () => {
                        await subject.execute();
                        const message = `Are you sure you want to delete '${path.basename(helper.editorFile1.path)}'?`;
                        const action = 'Move to Trash';
                        const options = { modal: true };
                        expect(window.showInformationMessage).to.have.been.calledWith(message, options, action);
                    });
                });
            });

            describe('responding with delete', () => {
                it('deletes the file', async () => {
                    await subject.execute();
                    const message = `${helper.editorFile1.path} does exist`;
                    expect(fs.existsSync(helper.editorFile1.fsPath), message).to.be.false;
                });
            });

            describe('responding with no', () => {
                beforeEach(async () => helper.createShowInformationMessageStub().resolves(false));

                it('leaves the file untouched', async () => {
                    try {
                        await subject.execute();
                        expect.fail('must fail');
                    } catch (e) {
                        const message = `${helper.editorFile1.path} does not exist`;
                        expect(fs.existsSync(helper.editorFile1.fsPath), message).to.be.true;
                    }
                });
            });

            describe('delete.confirm configuration set to false', () => {
                beforeEach(async () => {
                    helper.createGetConfigurationStub({ 'delete.useTrash': false, 'delete.confirm': false });
                });

                afterEach(async () => helper.restoreGetConfiguration());

                it('deletes the file without confirmation', async () => {
                    await subject.execute();
                    const message = `${helper.editorFile1.path} does not exist`;
                    expect(window.showInformationMessage).to.have.not.been.called;
                    expect(fs.existsSync(helper.editorFile1.fsPath), message).to.be.false;
                });
            });

            it('closes file editor', async () => {
                let activeEditor;

                const retryable = async () => {
                    await subject.execute();
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
                await helper.closeAllEditors();
                helper.createShowInformationMessageStub();
            });

            afterEach(async () => helper.restoreShowInformationMessage());

            it('ignores the command call', async () => {
                try {
                    await subject.execute();
                    expect.fail('Must fail');
                } catch {
                    expect(window.showInformationMessage).to.have.not.been.called;
                }
            });
        });
    });
});
