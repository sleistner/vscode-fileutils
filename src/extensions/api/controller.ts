/// <reference path="../../../typings/tsd.d.ts" />

import { window, workspace, commands, TextEditor, TextDocument } from 'vscode';
import { FileItem } from './item';
import * as path from 'path';

export class FileController {

    public showFileDialog({ prompt, showFullPath = false }): Promise<FileItem> {

        return new Promise<FileItem>(resolve => {
            const sourcePath: string = this.sourcePath;

            if (!sourcePath) {
                return;
            }

            window.showInputBox({
                prompt,
                value: showFullPath ? sourcePath : path.basename(sourcePath)
            }).then((targetPath) => {

                if (targetPath) {
                    const fileItem: FileItem = new FileItem(sourcePath, targetPath);
                    resolve(fileItem);
                }

            });
        });
    }

    public move(fileItem: FileItem): Promise<string> {
        return this.moveOrDuplicate(fileItem, fileItem.move);
    }

    public duplicate(fileItem: FileItem): Promise<string> {
        return this.moveOrDuplicate(fileItem, fileItem.duplicate);
    }

    public remove(): Promise<string> {

        return new Promise((resolve, reject) => {
            const sourcePath: string = this.sourcePath;
            
            if (!sourcePath) {
                return;
            }
            
            const fileItem: FileItem = new FileItem(sourcePath);

            fileItem.remove()
                .then(() => resolve(fileItem.sourcePath))
                .catch(() => reject(`Error deleting file "${fileItem.sourcePath}".`));
        });

    }

    private get sourcePath(): string {
        const activeEditor: TextEditor = window.activeTextEditor;
        const document: TextDocument = activeEditor && activeEditor.document;

        return document && document.fileName;
    }

    private moveOrDuplicate(fileItem: FileItem, fn: Function): Promise<string> {

        return new Promise(resolve => {

            this.ensureWritableFile(fileItem)
                .then(() => {
                    fn.call(fileItem).then(targetPath => resolve(targetPath));
                });

        });

    }

    private ensureWritableFile(fileItem: FileItem): Promise<Boolean> {

        return new Promise(resolve => {

            if (!fileItem.exists) {
                return resolve(true);
            }

            window.showInformationMessage(`File ${fileItem.targetPath} already exists.`, 'Overwrite')
                .then(overwrite => overwrite && resolve(true));
        });
    }

    public openFileInEditor(fileName): Promise<TextEditor> {

        return new Promise((resolve, reject) => {

            workspace.openTextDocument(fileName).then(textDocument => {

                if (!textDocument) {
                    return reject('Could not open file!');
                }

                window.showTextDocument(textDocument).then(editor => {

                    if (!editor) {
                        return reject('Could not show document!');
                    }

                    resolve(editor);
                });
            });
        });
    }

    public closeCurrentFileEditor(): Thenable<any> {
        return commands.executeCommand('workbench.action.closeActiveEditor');
    }

}