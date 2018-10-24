import { TextDocument, TextEditor, window } from 'vscode';

export class Util {

    public static getSourcePath(): string {
        const activeEditor: TextEditor = window.activeTextEditor;
        const document: TextDocument = activeEditor && activeEditor.document;

        return document && document.fileName;
    }
}
