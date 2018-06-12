import * as path from 'path';
import { window, workspace, WorkspaceFolder } from 'vscode';
import { FileItem } from '../Item';
import { AbstractFileController } from './AbstractFileController';
import { DialogOptions, ExecuteOptions } from './FileController';

export interface NewFileDialogOptions extends DialogOptions {
    relativeToRoot?: boolean;
}

export interface CreateOptions extends ExecuteOptions {
    isDir?: boolean;
}

export class NewFileController extends AbstractFileController {

    public async showDialog(options: NewFileDialogOptions): Promise<FileItem> {
        const { prompt, relativeToRoot = false } = options;
        const workspaceFolders: WorkspaceFolder[] = workspace.workspaceFolders;
        let sourcePath = workspaceFolders && workspaceFolders[0].uri.toString();

        if (!sourcePath) {
            throw new Error();
        }

        if (!relativeToRoot) {
            sourcePath = path.dirname(this.sourcePath);
        }

        const targetPath = await window.showInputBox({ prompt });
        if (targetPath) {
            const isDir = targetPath.endsWith(path.sep);
            const realPath = path.resolve(sourcePath, targetPath);
            return new FileItem(sourcePath, realPath, isDir);
        }
    }

    public async execute(options: CreateOptions): Promise<FileItem> {
        const { fileItem, isDir = false } = options;
        await this.ensureWritableFile(fileItem);
        try {
            return fileItem.create(isDir);
        } catch (e) {
            throw new Error(`Error creating file '${fileItem.path}'.`);
        }
    }
}
