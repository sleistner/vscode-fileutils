import * as path from 'path';
import { window, workspace } from 'vscode';
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
        let sourcePath = workspace.rootPath;

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
        const writeable = await this.ensureWritableFile(fileItem);
        if (writeable) {
            return fileItem.create(isDir)
                .catch(() => Promise.reject(`Error creating file '${fileItem.path}'.`));
        }
    }
}
