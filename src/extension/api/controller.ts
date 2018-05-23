import * as fs from 'fs';
import * as path from 'path';
import {
    commands,
    TextDocument,
    TextEditor,
    Uri,
    ViewColumn,
    window,
    workspace,
    WorkspaceConfiguration,
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

    public async showMoveFileDialog(options: IMoveFileDialogOptions): Promise<FileItem> {
        const { prompt, showFullPath = false, uri = null } = options;
        const sourcePath = uri && uri.fsPath || this.sourcePath;

        if (!sourcePath) {
            throw new Error();
        }

        const value = showFullPath ? sourcePath : path.basename(sourcePath);
        const valueSelection = this.getFilenameSelection(value);
        const targetPath = await window.showInputBox({ prompt, value, valueSelection });
        if (targetPath) {
            const realPath = path.resolve(path.dirname(sourcePath), targetPath);
            return new FileItem(sourcePath, realPath);
        }
    }

    public async showNewFileDialog(options: INewFileDialogOptions): Promise<FileItem> {
        const { prompt, relativeToRoot = false } = options;
        let sourcePath = workspace.rootPath;

        if (!relativeToRoot && this.sourcePath) {
            sourcePath = path.dirname(this.sourcePath);
        }

        if (!sourcePath) {
            throw new Error();
        }

        const targetPath = await window.showInputBox({ prompt });
        if (targetPath) {
            const realPath = path.resolve(sourcePath, targetPath);
            return new FileItem(sourcePath, realPath);
        }
    }

    public async showRemoveFileDialog(): Promise<FileItem> {
        const sourcePath = this.sourcePath;

        if (!sourcePath) {
            throw new Error();
        }

        if (!this.confirmDelete) {
            return new FileItem(sourcePath);
        }

        const message = `Are you sure you want to delete '${path.basename(sourcePath)}'?`;
        const action = this.useTrash ? 'Move to Trash' : 'Delete';
        const remove = window.showInformationMessage(message, { modal: true }, action);
        if (remove) {
            return new FileItem(sourcePath);
        }
    }

    public async move(fileItem: FileItem): Promise<FileItem> {
        const writeable = await this.ensureWritableFile(fileItem);
        if (writeable) {
            return fileItem.move();
        }
    }

    public async duplicate(fileItem: FileItem): Promise<FileItem> {
        const writeable = await this.ensureWritableFile(fileItem);
        if (writeable) {
            return fileItem.duplicate();
        }
    }

    public async remove(fileItem: FileItem): Promise<FileItem> {
        return fileItem.remove(this.useTrash)
            .catch(() => Promise.reject(`Error deleting file '${fileItem.path}'.`));
    }

    public async create(options: ICreateOptions): Promise<FileItem> {
        const { fileItem, isDir = false } = options;
        const writeable = await this.ensureWritableFile(fileItem);
        if (writeable) {
            return fileItem.create(isDir)
                .catch(() => Promise.reject(`Error creating file '${fileItem.path}'.`));
        }
    }

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

    private get sourcePath(): string {
        const activeEditor: TextEditor = window.activeTextEditor;
        const document: TextDocument = activeEditor && activeEditor.document;

        return document && document.fileName;
    }

    private async ensureWritableFile(fileItem: FileItem): Promise<FileItem> {
        if (!fileItem.exists) {
            return fileItem;
        }

        const message = `File '${fileItem.targetPath}' already exists.`;
        const action = 'Overwrite';
        const overwrite = window.showInformationMessage(message, { modal: true }, action);
        if (overwrite) {
            return fileItem;
        }
    }

    private getFilenameSelection(value: string): [number, number] {
        const basename = path.basename(value);
        const start = value.length - basename.length;
        const dot = basename.lastIndexOf('.');

        if (dot <= 0) {
            // file with no extension or ".editorconfig" like file
            return [start, value.length];
        }

        // select basename without extension
        return [start, start + dot];
    }

    private get configuration(): WorkspaceConfiguration {
        return workspace.getConfiguration('fileutils');
    }

    private get useTrash(): boolean {
        return this.configuration.get('delete.useTrash');
    }

    private get confirmDelete(): boolean {
        return this.configuration.get('delete.confirm');
    }
}
