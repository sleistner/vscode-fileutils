import { IDialogOptions, IExecuteOptions, IFileController } from './FileController';

import * as fs from 'fs';
import { commands, TextDocument, TextEditor, ViewColumn, window, workspace } from 'vscode';
import { FileItem } from '../Item';

export abstract class BaseFileController implements IFileController {
    public get sourcePath(): string {
        const activeEditor: TextEditor = window.activeTextEditor;
        const document: TextDocument = activeEditor && activeEditor.document;

        return document && document.fileName;
    }

    public abstract async showDialog(options?: IDialogOptions): Promise<FileItem>;

    public abstract async execute(options: IExecuteOptions): Promise<FileItem>;

    public async openFileInEditor(fileItem: FileItem): Promise<TextEditor> {
        const isDir = fs.statSync(fileItem.path).isDirectory();
        if (isDir) {
            return;
        }

        const textDocument = await workspace.openTextDocument(fileItem.path);
        if (!textDocument) {
            throw new Error('Could not open file!');
        }

        const editor = await window.showTextDocument(textDocument, ViewColumn.Active);
        if (!editor) {
            throw new Error('Could not show document!');
        }

        return editor;
    }

    public async closeCurrentFileEditor(): Promise<any> {
        return commands.executeCommand('workbench.action.closeActiveEditor');
    }

    protected async ensureWritableFile(fileItem: FileItem): Promise<FileItem> {
        if (!fileItem.exists) {
            return fileItem;
        }

        const message = `File '${fileItem.targetPath}' already exists.`;
        const action = 'Overwrite';
        const overwrite = await window.showInformationMessage(message, { modal: true }, action);
        if (overwrite) {
            return fileItem;
        }
        throw new Error();
    }
}
