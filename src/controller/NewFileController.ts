import { TypeAheadController } from './TypeAheadController';

import * as path from 'path';
import { window, workspace, WorkspaceFolder } from 'vscode';
import { FileItem } from '../Item';
import { getConfiguration } from '../lib/config';
import { BaseFileController } from './BaseFileController';
import { IDialogOptions, IExecuteOptions } from './FileController';

export interface INewFileDialogOptions extends IDialogOptions {
    relativeToRoot?: boolean;
}

export interface INewFileExecuteOptions extends IExecuteOptions {
    isDir?: boolean;
}

export class NewFileController extends BaseFileController {

    public async showDialog(options: INewFileDialogOptions): Promise<FileItem> {
        const { prompt, relativeToRoot = false } = options;
        const workspaceFolders: WorkspaceFolder[] = workspace.workspaceFolders;
        let sourcePath = workspaceFolders && workspaceFolders[0].uri.fsPath;

        if (!sourcePath) {
            throw new Error();
        }

        if (!relativeToRoot) {
            sourcePath = path.dirname(this.sourcePath);
        }

        if (getConfiguration('typeahead.enabled') === true) {
            const typeAheadController = new TypeAheadController();
            sourcePath = await typeAheadController.showDialog(sourcePath);
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
}
