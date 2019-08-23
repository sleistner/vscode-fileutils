import { expect } from 'chai';
import * as path from 'path';
import { commands, window } from 'vscode';
import { RenameFileCommand } from '../../src/command';
import { MoveFileController } from '../../src/controller';
import * as helper from '../helper';

describe('RenameFileCommand', () => {
    const subject = helper.createTestSubject(RenameFileCommand, MoveFileController);

    beforeEach(helper.beforeEach);

    afterEach(helper.afterEach);

    describe('as command', () => {
        describe('with open text document', () => {
            beforeEach(async () => {
                await helper.openDocument(helper.editorFile1);
                helper.createShowInputBoxStub().resolves(helper.targetFile.path);
            });

            afterEach(async () => {
                await helper.closeAllEditors();
                helper.restoreShowInputBox();
            });

            it('prompts for file destination', async () => {
                await subject.execute();
                const prompt = 'New Name';
                const value = path.basename(helper.editorFile1.fsPath);
                const valueSelection = [value.length - 9, value.length - 3];
                expect(window.showInputBox).to.have.been.calledWithExactly({ prompt, value, valueSelection });
            });

            helper.protocol.it('moves current file to destination', subject);
            helper.protocol.describe('target file in non existing nested directories', subject);
            helper.protocol.describe('when target destination exists', subject, {
                extra() {

                    describe('configuration', () => {
                        beforeEach(async () => {
                            helper.createExecuteCommandStub().withArgs('workbench.action.closeActiveEditor');
                        });

                        afterEach(async () => {
                            helper.restoreGetConfiguration();
                            helper.restoreExecuteCommand();
                        });

                        describe('rename.closeOldTab set to true', () => {
                            beforeEach(async () => {
                                helper.createGetConfigurationStub({ 'rename.closeOldTab': true });
                            });

                            it('renames a file and verifies that the tab of the file was closed', async () => {
                                await subject.execute();
                                expect(commands.executeCommand).to.have.been.called;
                            });
                        });

                        describe('rename.closeOldTab set to false', () => {
                            beforeEach(async () => {
                                helper.createGetConfigurationStub({ 'rename.closeOldTab': false });
                            });

                            it('renames a file and verifies that the tab of the file was not closed', async () => {
                                await subject.execute();
                                expect(commands.executeCommand).to.have.not.been.called;
                            });
                        });
                    });
                }
            });

            helper.protocol.it('opens target file as active editor', subject);
        });

        describe('with no open text document', () => {
            beforeEach(async () => {
                await helper.closeAllEditors();
                helper.createShowInputBoxStub();
            });

            afterEach(() => helper.restoreShowInputBox());

            it('ignores the command call', async () => {
                try {
                    await subject.execute();
                    expect.fail('Must fail');
                } catch {
                    expect(window.showInputBox).to.have.not.been.called;
                }
            });
        });
    });
});
