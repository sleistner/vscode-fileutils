import { commands, env, ExtensionContext, TextEditor, ViewColumn, window, workspace } from 'vscode';
import { FileItem } from '../FileItem';
import { Cache } from '../lib/Cache';
import { IDialogOptions, IExecuteOptions, IFileController } from './FileController';

export abstract class BaseFileController implements IFileController {
    constructor(protected context: ExtensionContext) { }

    public abstract async showDialog(options?: IDialogOptions): Promise<FileItem | undefined>;

    public abstract async execute(options: IExecuteOptions): Promise<FileItem>;

    public async openFileInEditor(fileItem: FileItem): Promise<TextEditor | undefined> {
        if (fileItem.isDir) {
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
        const activeEditor = window.activeTextEditor;
        if (activeEditor && activeEditor.document && activeEditor.document.fileName) {
            return activeEditor.document.fileName;
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

    protected getCache(namespace: string): Cache {
        return new Cache(this.context.globalState, namespace);
    }

    protected async ensureWritableFile(fileItem: FileItem): Promise<FileItem> {
        if (!fileItem.exists) {
            return fileItem;
        }

        if (fileItem.targetPath === undefined) {
            throw new Error('Missing target path');
        }

        const message = `File '${fileItem.targetPath.path}' already exists.`;
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
        const originalClipboardData = await env.clipboard.readText();

        // 2. Populating the clipboard with an empty string
        await env.clipboard.writeText('');

        // 3. Calling the copyPathOfActiveFile that populates the clipboard with the source path of the active file.
        // If there is no active file - the clipboard will not be populated and it will stay with the empty string.
        await commands.executeCommand('workbench.action.files.copyPathOfActiveFile');

        // 4. Get the clipboard data after the API call
        const postAPICallClipboardData = await await env.clipboard.readText();

        // 5. Return the saved original clipboard data to the clipboard so this method
        // will not interfere with the clipboard's content.
        await env.clipboard.writeText(originalClipboardData);

        // 6. Return the clipboard data from the API call (which could be an empty string if it failed).
        return postAPICallClipboardData;
    }
}
