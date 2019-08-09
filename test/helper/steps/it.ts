import { expect } from 'chai';
import * as fs from 'fs';
import { Uri, window } from 'vscode';
import { editorFile1, targetFile } from '../environment';
import { FuncVoid, IStep } from './types';

export const it: IStep = {
    'opens target file as active editor'(subject: any, uri?: Uri): FuncVoid {
        return async () => {
            await subject.execute(uri);
            expect(window.activeTextEditor!.document.fileName).to.equal(targetFile.path);
        };
    },
    'moves current file to destination'(subject: any, uri?: Uri): FuncVoid {
        return async () => {
            await subject.execute(uri);
            const message = `${targetFile} does not exist`;
            expect(fs.existsSync(targetFile.fsPath), message).to.be.true;
        };
    },
    'prompts for file destination'(subject: any, prompt: string): FuncVoid {
        return async () => {
            await subject.execute(editorFile1);
            const value = editorFile1.path;
            const valueSelection = [value.length - 9, value.length - 3];
            expect(window.showInputBox).to.have.been.calledWithExactly({ prompt, value, valueSelection });
        };
    }
};

it['duplicates current file to destination'] = it['moves current file to destination'];
