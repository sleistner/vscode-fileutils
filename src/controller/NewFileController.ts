import * as path from 'path';
import { Uri, window, workspace, WorkspaceFolder } from 'vscode';
import { FileItem } from '../Item';
import { getConfiguration } from '../lib/config';
import { BaseFileController } from './BaseFileController';
import { IDialogOptions, IExecuteOptions } from './FileController';
import { TypeAheadController } from './TypeAheadController';

export interface INewFileDialogOptions extends IDialogOptions {
    relativeToRoot?: boolean;
}

export interface INewFileExecuteOptions extends IExecuteOptions {
    isDir?: boolean;
}

export class NewFileController extends BaseFileController {

    public async showDialog(options: INewFileDialogOptions): Promise<FileItem> {
        const { prompt, relativeToRoot = false } = options;
        const sourcePath: string = await this.findSourcePath(relativeToRoot);
        if (!sourcePath) {
            throw new Error();
        }
        const value: string = path.join(sourcePath, path.sep);
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

    private async findSourcePath(relativeToRoot: boolean): Promise<string> {
        if (relativeToRoot) {
            return this.getWorkspaceSourcePath();
        }
        return this.getFileSourcePath();
    }

    private async getFileSourcePath(): Promise<string> {
        let sourcePath = await this.getSourcePath();
        sourcePath = path.dirname(sourcePath);

        if (getConfiguration('typeahead.enabled') === true) {
            const typeAheadController = new TypeAheadController();
            sourcePath = await typeAheadController.showDialog(sourcePath);
        }
        return sourcePath;
    }

    private async getWorkspaceSourcePath(): Promise<string> {
        const workspaceFolder = await this.selectWorkspaceFolder();
        return workspaceFolder && workspaceFolder.uri.fsPath;
    }

    private async selectWorkspaceFolder(): Promise<WorkspaceFolder | undefined> {
        if (workspace.workspaceFolders.length === 1) {
            return workspace.workspaceFolders[0];
        }

        const sourcePath = await this.getSourcePath();
        const uri = Uri.file(sourcePath);
        return workspace.getWorkspaceFolder(uri) || window.showWorkspaceFolderPick();
    }
}
