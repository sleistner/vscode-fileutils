import * as path from 'path';
import { window, workspace, WorkspaceFolder } from 'vscode';
import { FileItem } from '../Item';
import { AbstractFileController } from './AbstractFileController';

export interface INewFileDialogOptions {
    prompt: string;
    relativeToRoot?: boolean;
}

export interface ICreateOptions {
    fileItem: FileItem;
    isDir?: boolean;
}

export class NewFileController extends AbstractFileController {

    public async showDialog(options: INewFileDialogOptions): Promise<FileItem> {
        const { prompt, relativeToRoot = false } = options;
        const workspaceFolders: WorkspaceFolder[] = workspace.workspaceFolders;
        let sourcePath = workspaceFolders && workspaceFolders[0].uri.toString();

        if (!relativeToRoot && this.sourcePath) {
            sourcePath = path.dirname(this.sourcePath);
        }

        if (!sourcePath) {
            throw new Error();
        }

        const targetPath = await window.showInputBox({ prompt });
        if (targetPath) {
            const isDir = targetPath.endsWith(path.sep);
            const realPath = path.resolve(sourcePath, targetPath);
            return new FileItem(sourcePath, realPath, isDir);
        }
    }

    public async create(options: ICreateOptions): Promise<FileItem> {
        const { fileItem, isDir = false } = options;
        await this.ensureWritableFile(fileItem);
        try {
            return fileItem.create(isDir);
        } catch (e) {
            throw new Error(`Error creating file '${fileItem.path}'.`);
        }
    }
}
