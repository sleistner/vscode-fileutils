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

            helper.protocol.it('should prompt for file destination', subject, 'New Location');
            helper.protocol.it('should move current file to destination', subject);
            helper.protocol.describe('target file in non existing nested directories', subject);
        });

        helper.protocol.describe('without open text document', subject);
    });

    describe('as context menu', () => {
        beforeEach(async () => helper.createShowInputBoxStub().resolves(helper.targetFile.path));

        afterEach(async () => helper.restoreShowInputBox());

        helper.protocol.it('should prompt for file destination', subject, 'New Location');
        helper.protocol.it('should move current file to destination', subject, helper.editorFile1);
    });
});
