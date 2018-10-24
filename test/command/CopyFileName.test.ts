import { expect, use as chaiUse } from 'chai';
import { paste as clipboardPaste } from 'copy-paste';
import * as path from 'path';
import * as sinonChai from 'sinon-chai';
import { commands, Uri, window, workspace } from 'vscode';
import { CopyFileNameCommand, ICommand } from '../../src/command';

chaiUse(sinonChai);

const rootDir = path.resolve(__dirname, '..', '..', '..');

const fixtureFile1Name = 'file-1.rb';
const fixtureFile1 = path.resolve(rootDir, 'test', 'fixtures', fixtureFile1Name);

describe('CopyFileNameCommand', () => {
    const sut: ICommand = new CopyFileNameCommand();

    describe('as command', () => {
        describe('with open text document', () => {
            before(() => {
                const uri = Uri.file(fixtureFile1);
                return workspace.openTextDocument(uri)
                    .then((textDocument) => window.showTextDocument(textDocument));
            });

            after(() => {
                return commands.executeCommand('workbench.action.closeAllEditors');
            });

            it('check file name was copied to clipboard', () => {
                return sut.execute()
                .then(() => {
                    const clipboardData = clipboardPaste();
                    expect(clipboardData).to.equal(fixtureFile1Name);
                });
            });
        });
    });
});
