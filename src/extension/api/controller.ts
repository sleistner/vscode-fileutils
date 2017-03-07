import * as Promise from 'bluebird';
import * as fs from 'fs';
import * as path from 'path';
import {
    commands,
    TextDocument,
    TextEditor,
    Uri,
    window,
    workspace
} from 'vscode';
import { FileItem } from './item';

export interface IMoveFileDialogOptions {
    prompt: string;
    showFullPath?: boolean;
    uri?: Uri;
}

export interface INewFileDialogOptions {
    prompt: string;
    relativeToRoot?: boolean;
}

export interface ICreateOptions {
    fileItem: FileItem;
    isDir?: boolean;
}

export class FileController {

    public showMoveFileDialog(options: IMoveFileDialogOptions): Promise<FileItem> {

        const { prompt, showFullPath = false, uri = null } = options;

        const sourcePath = uri ? uri.fsPath : this.sourcePath;

        if (!sourcePath) {
            return Promise.reject(null);
        }

        const value = showFullPath ? sourcePath : path.basename(sourcePath);

        return Promise.resolve(window.showInputBox({ prompt, value }))
            .then((targetPath) => {

                if (targetPath) {
                    targetPath = path.resolve(path.dirname(sourcePath), targetPath);
                    return new FileItem(sourcePath, targetPath);
                }

            });
    }

    public showNewFileDialog(options: INewFileDialogOptions): Promise<FileItem> {

        const { prompt, relativeToRoot = false } = options;

        let sourcePath = workspace.rootPath;

        if (!relativeToRoot && this.sourcePath) {
            sourcePath = path.dirname(this.sourcePath);
        }

        if (!sourcePath) {
            return Promise.reject(null);
        }

        return Promise.resolve(window.showInputBox({ prompt }))
            .then((targetPath) => {

                if (targetPath) {
                    targetPath = path.resolve(sourcePath, targetPath);
                    return new FileItem(sourcePath, targetPath);
                }

            });
    }

    public showRemoveFileDialog(): Promise<FileItem> {

        const sourcePath = this.sourcePath;

        if (!sourcePath) {
            return Promise.reject(null);
        }

        const message = `Are you sure you want to delete '${path.basename(sourcePath)}'?`;
        const action = 'Delete';

        return Promise.resolve(window.showInformationMessage(message, { modal: true }, action))
            .then((remove) => remove && new FileItem(sourcePath));
    }

    public move(fileItem: FileItem): Promise<FileItem> {
        return this.ensureWritableFile(fileItem)
            .then(() => fileItem.move());
    }

    public duplicate(fileItem: FileItem): Promise<FileItem> {
        return this.ensureWritableFile(fileItem)
            .then(() => fileItem.duplicate());
    }

    public remove(fileItem: FileItem): Promise<FileItem> {
        return fileItem.remove()
            .catch(() => Promise.reject(`Error deleting file '${fileItem.path}'.`));
    }

    public create(options: ICreateOptions): Promise<FileItem> {

        const { fileItem, isDir = false } = options;

        return this.ensureWritableFile(fileItem)
            .then(() => fileItem.create(isDir))
            .catch(() => Promise.reject(`Error creating file '${fileItem.targetPath}'.`));
    }

    public openFileInEditor(fileItem: FileItem): Promise<TextEditor> {

        const isDir = fs.statSync(fileItem.path).isDirectory();

        if (isDir) {
            return;
        }

        return Promise.resolve(workspace.openTextDocument(fileItem.path))
            .then((textDocument) => textDocument || Promise.reject('Could not open file!'))
            .then((textDocument) => window.showTextDocument(textDocument))
            .then((editor) => editor || Promise.reject('Could not show document!'));
    }

    public closeCurrentFileEditor(): Thenable<any> {
        return commands.executeCommand('workbench.action.closeActiveEditor');
    }

    private get sourcePath(): string {

        const activeEditor: TextEditor = window.activeTextEditor;
        const document: TextDocument = activeEditor && activeEditor.document;

        return document && document.fileName;
    }

    private ensureWritableFile(fileItem: FileItem): Promise<FileItem> {

        if (!fileItem.exists) {
            return Promise.resolve(fileItem);
        }

        const message = `File '${fileItem.targetPath}' already exists.`;
        const action = 'Overwrite';

        return Promise.resolve(window.showInformationMessage(message, { modal: true }, action))
            .then((overwrite) => overwrite || Promise.reject(null))
            .then(() => fileItem);
    }

}
