import { window, workspace, commands, TextEditor, TextDocument } from 'vscode';
import { FileItem } from './item';
import * as path from 'path';

export class FileController {

    public showMoveFileDialog({ prompt, showFullPath = false }): Promise<FileItem> {

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
                    targetPath = path.resolve(path.dirname(sourcePath), targetPath);
                    const fileItem: FileItem = new FileItem(sourcePath, targetPath);
                    resolve(fileItem);
                }

            });
        });
    }

    public showNewFileDialog({ prompt, root = true }): Promise<FileItem> {

        return new Promise<FileItem>(resolve => {

            let sourcePath: string = workspace.rootPath;

            if (!root && this.sourcePath) {
                sourcePath = path.dirname(this.sourcePath);
            }
            
            if (!sourcePath) {
                return;
            }

            window.showInputBox({
                prompt
            }).then((targetPath) => {

                if (targetPath) {
                    targetPath = path.resolve(sourcePath, targetPath);
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

        return new Promise<string>((resolve, reject) => {
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

    public create(fileItem: FileItem, isDir: Boolean = false): Promise<string> {

        return new Promise<string>((resolve, reject) => {
            
            this.ensureWritableFile(fileItem)
                .then(() => {
                    fileItem.create(isDir)
                    .then(targetPath => resolve(targetPath))
                    .catch(() => reject(`Error creating ${isDir ? 'folder' : 'file'} "${fileItem.targetPath}".`));
                });
                
        });

    }

    private get sourcePath(): string {
        
        const activeEditor: TextEditor = window.activeTextEditor;
        const document: TextDocument = activeEditor && activeEditor.document;

        return document && document.fileName;
    }

    private moveOrDuplicate(fileItem: FileItem, fn: Function): Promise<string> {

        return new Promise<string>(resolve => {

            this.ensureWritableFile(fileItem)
                .then(() => {
                    fn.call(fileItem).then(targetPath => resolve(targetPath));
                });

        });

    }

    private ensureWritableFile(fileItem: FileItem): Promise<Boolean> {

        return new Promise<Boolean>(resolve => {

            if (!fileItem.exists) {
                return resolve(true);
            }

            window.showInformationMessage(`File ${fileItem.targetPath} already exists.`, 'Overwrite')
                .then(overwrite => overwrite && resolve(true));
        });
    }

    public openFileInEditor(fileName): Promise<TextEditor> {

        return new Promise<TextEditor>((resolve, reject) => {

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