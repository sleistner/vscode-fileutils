import { IDialogOptions, IExecuteOptions, IFileController } from './FileController';

import * as fs from 'fs';
import { commands, TextDocument, TextEditor, ViewColumn, window, workspace } from 'vscode';
import { ClipboardUtil } from '../ClipboardUtil';
import { FileItem } from '../Item';

export abstract class BaseFileController implements IFileController {
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

    public async getSourcePath(): Promise<string> {
        // Attempting to get the fileName from the activeTextEditor.
        // Works for text files only.
        const activeEditor: TextEditor = window.activeTextEditor;
        if (activeEditor && activeEditor.document && activeEditor.document.fileName) {
            return Promise.resolve(activeEditor.document.fileName);
        }

        // No activeTextEditor means that we don't have an active file or
        // the active file is a non-text file (e.g. binary files such as images).
        // Since there is no actual API to differentiate between the scenarios, we try to retrieve
        // the path for a non-textual file before throwing an error.
        const sourcePath = this.getSourcePathForNonTextFile();
        if (!sourcePath) {
            throw new Error();
        }

        return sourcePath;
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

    private async getSourcePathForNonTextFile(): Promise<string> {
        // Since there is no API to get details of non-textual files, the following workaround is performed:
        // 1. Saving the original clipboard data to a local variable.
        const originalClipboardData = await ClipboardUtil.getClipboardContent();

        // 2. Populating the clipboard with an empty string
        await ClipboardUtil.setClipboardContent('');

        // 3. Calling the copyPathOfActiveFile that populates the clipboard with the source path of the active file.
        // If there is no active file - the clipboard will not be populated and it will stay with the empty string.
        await commands.executeCommand('workbench.action.files.copyPathOfActiveFile');

        // 4. Get the clipboard data after the API call
        const postAPICallClipboardData = await ClipboardUtil.getClipboardContent();

        // 5. Return the saved original clipboard data to the clipboard so this method
        // will not interfere with the clipboard's content.
        await ClipboardUtil.setClipboardContent(originalClipboardData);

        // 6. Return the clipboard data from the API call (which could be an empty string if it failed).
        return postAPICallClipboardData;
    }
}
