import * as path from 'path';
import { commands, Uri, window, workspace, WorkspaceFolder } from 'vscode';
import { FileItem } from '../FileItem';
import { getConfiguration } from '../lib/config';
import { BaseFileController } from './BaseFileController';
import { IDialogOptions, IExecuteOptions, IGetSourcePathOptions } from './IFileController';
import { TypeAheadController } from './TypeAheadController';

export interface INewFileDialogOptions extends IDialogOptions {
    relativeToRoot?: boolean;
}

export interface INewFileExecuteOptions extends IExecuteOptions {
    isDir?: boolean;
}

export class NewFileController extends BaseFileController {
    private fallbackToRoot: boolean = false;

    public async showDialog(options: INewFileDialogOptions): Promise<FileItem | undefined> {
        const { prompt, relativeToRoot = false } = options;
        const sourcePath = await this.getSourcePath({ relativeToRoot });
        const value = path.join(sourcePath, path.sep);
        const valueSelection: [number, number] = [value.length, value.length];
        const targetPath = await window.showInputBox({ prompt, value, valueSelection });
        if (targetPath) {
            const isDir = targetPath.endsWith(path.sep);
            const realPath = path.resolve(sourcePath, targetPath);
            return new FileItem(sourcePath, realPath, isDir);
        }
    }

    public async execute(options: INewFileExecuteOptions): Promise<FileItem> {
        const { fileItem, isDir = false } = options;
        await this.ensureWritableFile(fileItem);
        try {
            return fileItem.create(isDir);
        } catch (e) {
            throw new Error(`Error creating file '${fileItem.path}'.`);
        }
    }

    public async getSourcePath({ relativeToRoot }: IGetSourcePathOptions): Promise<string> {
        const rootPath = relativeToRoot
            ? await this.getWorkspaceSourcePath()
            : await this.getFileSourcePath();

        if (!rootPath) {
            throw new Error();
        }

        return this.getFileSourcePathAtRoot(rootPath, relativeToRoot === true || this.fallbackToRoot);
    }

    private async getWorkspaceSourcePath(): Promise<string | undefined> {
        const workspaceFolder = await this.selectWorkspaceFolder();
        return workspaceFolder && workspaceFolder.uri.fsPath;
    }

    private async selectWorkspaceFolder(): Promise<WorkspaceFolder | undefined> {
        if (!workspace.workspaceFolders) {
            await this.showOpenFolderDialog();
            return;
        }

        if (workspace.workspaceFolders.length === 1) {
            return workspace.workspaceFolders[0];
        }

        const sourcePath = await super.getSourcePath();
        const uri = Uri.file(sourcePath);
        return workspace.getWorkspaceFolder(uri) || window.showWorkspaceFolderPick();
    }

    private async showOpenFolderDialog(): Promise<void> {
        const message = 'It doesn\'t look like you have a folder opened in your workspace. Try opening a folder first.';
        const openFolderItem = 'Open Folder';
        const result = await window.showInformationMessage(message, { modal: true }, openFolderItem);
        if (result === openFolderItem) {
            await commands.executeCommand('vscode.openFolder');
        }
    }

    private async getFileSourcePath(): Promise<string | undefined> {
        const sourcePath = await super.getSourcePath();
        const uri = Uri.file(sourcePath);
        const workspaceFolder = workspace.getWorkspaceFolder(uri);
        if (workspaceFolder) {
            return path.dirname(sourcePath);
        }
        this.fallbackToRoot = true;
        return this.getWorkspaceSourcePath();
    }

    private async getFileSourcePathAtRoot(rootPath: string, relativeToRoot: boolean): Promise<string> {
        let sourcePath = rootPath;

        if (getConfiguration('typeahead.enabled') === true) {
            const cache = this.getCache(`workspace:${sourcePath}`);
            const typeAheadController = new TypeAheadController(cache, relativeToRoot);
            sourcePath = await typeAheadController.showDialog(sourcePath);
        }

        if (!sourcePath) {
            throw new Error();
        }

        return sourcePath;
    }
}
