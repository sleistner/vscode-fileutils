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

        const executor = (resolve, reject) => {

            const sourcePath = uri ? uri.fsPath : this.sourcePath;

            if (!sourcePath) {
                return reject();
            }

            window.showInputBox({
                prompt,
                value: showFullPath ? sourcePath : path.basename(sourcePath)
            }).then((targetPath) => {

                if (targetPath) {
                    targetPath = path.resolve(path.dirname(sourcePath), targetPath);
                    resolve(new FileItem(sourcePath, targetPath));
                }

            });
        };

        return new Promise<FileItem>(executor);
    }

    public showNewFileDialog(options: INewFileDialogOptions): Promise<FileItem> {

        const { prompt, relativeToRoot = false } = options;

        const executor = (resolve, reject) => {

            let sourcePath = workspace.rootPath;

            if (!relativeToRoot && this.sourcePath) {
                sourcePath = path.dirname(this.sourcePath);
            }

            if (!sourcePath) {
                return reject();
            }

            window.showInputBox({
                prompt
            }).then((targetPath) => {

                if (targetPath) {
                    targetPath = path.resolve(sourcePath, targetPath);
                    resolve(new FileItem(sourcePath, targetPath));
                }

            });
        };

        return new Promise<FileItem>(executor);
    }

    public showRemoveFileDialog(): Promise<FileItem> {

        const executor = (resolve, reject) => {

            const sourcePath = this.sourcePath;

            if (!sourcePath) {
                return reject();
            }

            const onResponse = (remove) => {

                if (remove) {
                    return resolve(new FileItem(sourcePath));
                }

                reject();
            };

            const message = `Are you sure you want to delete '${path.basename(sourcePath)}'?`;
            const action = 'Delete';

            window.showInformationMessage(message, { modal: true }, action)
                .then(onResponse);
        };

        return new Promise<FileItem>(executor);
    }

    public move(fileItem: FileItem): Promise<string> {
        return this.moveOrDuplicate(fileItem, fileItem.move);
    }

    public duplicate(fileItem: FileItem): Promise<string> {
        return this.moveOrDuplicate(fileItem, fileItem.duplicate);
    }

    public remove(fileItem: FileItem): Promise<string> {

        const executor = (resolve, reject) => {

            fileItem.remove()
                .then(() => resolve(fileItem.sourcePath))
                .catch(() => reject(`Error deleting file "${fileItem.sourcePath}".`));
        };

        return new Promise<string>(executor);
    }

    public create(options: ICreateOptions): Promise<string> {

        const { fileItem, isDir = false } = options;

        const executor = (resolve, reject) => {

            const create = () => {
                fileItem.create(isDir)
                    .then((targetPath) => resolve(targetPath))
                    .catch(() => reject(`Error creating ${isDir ? 'folder' : 'file'} "${fileItem.targetPath}".`));
            };

            this.ensureWritableFile(fileItem)
                .then(create, reject);
        };

        return new Promise<string>(executor);
    }

    public openFileInEditor(fileName): Promise<TextEditor> {

        const isDir = fs.statSync(fileName).isDirectory();

        if (isDir) {
            return;
        }

        const executor = (resolve, reject) => {

            workspace.openTextDocument(fileName).then((textDocument) => {

                if (!textDocument) {
                    return reject('Could not open file!');
                }

                window.showTextDocument(textDocument).then((editor) => {

                    if (!editor) {
                        return reject('Could not show document!');
                    }

                    resolve(editor);
                });

            }, reject);
        };

        return new Promise<TextEditor>(executor);
    }

    public closeCurrentFileEditor(): Thenable<any> {
        return commands.executeCommand('workbench.action.closeActiveEditor');
    }

    private get sourcePath(): string {

        const activeEditor: TextEditor = window.activeTextEditor;
        const document: TextDocument = activeEditor && activeEditor.document;

        return document && document.fileName;
    }

    private moveOrDuplicate(fileItem: FileItem, fn: () => Promise<string>): Promise<string> {

        const executor = (resolve, reject) => {

            const callFunction = () => fn.call(fileItem).then(resolve);

            this.ensureWritableFile(fileItem)
                .then(callFunction, reject);
        };

        return new Promise<string>(executor);
    }

    private ensureWritableFile(fileItem: FileItem): Promise<boolean> {

        const executor = (resolve, reject) => {

            if (!fileItem.exists) {
                return resolve(true);
            }

            const onResponse = (overwrite) => {
                if (overwrite) {
                    return resolve(true);
                }

                reject();
            };

            const message = `File '${fileItem.targetPath}' already exists.`;
            const action = 'Overwrite';

            window.showInformationMessage(message, { modal: true }, action)
                .then(onResponse);
        };

        return new Promise<boolean>(executor);
    }

}
