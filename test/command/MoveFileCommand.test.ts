import { expect } from 'chai';
import * as sinon from 'sinon';
import { commands, workspace } from 'vscode';
import { MoveFileCommand } from '../../src/command';
import { MoveFileController } from '../../src/controller';
import * as helper from '../helper';

describe('MoveFileCommand', () => {
    const subject = helper.createTestSubject(MoveFileCommand, MoveFileController);

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

            helper.protocol.it('prompts for file destination', subject, 'New Location');
            helper.protocol.it('moves current file to destination', subject);
            helper.protocol.describe('target file in non existing nested directories', subject);
            helper.protocol.describe('when target destination exists', subject, {
                extra() {
                    describe('configuration', () => {
                        beforeEach(async () => {
                            helper.createGetConfigurationStub();
                            helper.createExecuteCommandStub().withArgs('workbench.action.closeActiveEditor');
                        });

                        afterEach(async () => {
                            helper.restoreGetConfiguration();
                            helper.restoreExecuteCommand();
                        });

                        describe('move.closeOldTab set to true', () => {
                            beforeEach(async () => {
                                const keys: { [key: string]: boolean } = { 'move.closeOldTab': true };
                                const config = { get: (key: string) => keys[key] };
                                helper.createGetConfigurationStub().returns(config);
                            });

                            it('moves a file and verifies that the tab of the file was closed', async () => {
                                await subject.execute();
                                expect(commands.executeCommand).to.have.been.called;
                            });
                        });

                        describe('move.closeOldTab set to false', () => {
                            beforeEach(async () => {
                                const keys: { [key: string]: boolean } = { 'move.closeOldTab': false };
                                const config = { get: (key: string) => keys[key] };
                                helper.createGetConfigurationStub().returns(config);
                            });

                            it('moves a file and verifies that the tab of the file was not closed', async () => {
                                await subject.execute();
                                expect(commands.executeCommand).to.have.not.been.called;
                            });
                        });
                    });
                }
            });

            helper.protocol.it('opens target file as active editor', subject);
        });

        helper.protocol.describe('without open text document', subject);
    });

    describe('as context menu', () => {
        beforeEach(async () => helper.createShowInputBoxStub(Promise.resolve(helper.targetFile.path)));

        afterEach(async () => helper.restoreShowInputBox());

        helper.protocol.it('prompts for file destination', subject, 'New Location');
        helper.protocol.it('moves current file to destination', subject, helper.editorFile1);
        helper.protocol.it('opens target file as active editor', subject, helper.editorFile1);
    });
});
