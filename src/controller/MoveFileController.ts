import * as path from 'path';
import { Uri, window } from 'vscode';
import { FileItem } from '../FileItem';
import { BaseFileController } from './BaseFileController';
import { IDialogOptions, IExecuteOptions } from './FileController';

export interface IMoveFileDialogOptions extends IDialogOptions {
    showFullPath?: boolean;
    uri?: Uri;
}

export class MoveFileController extends BaseFileController {

    public async showDialog(options: IMoveFileDialogOptions): Promise<FileItem | undefined> {
        const { prompt, showFullPath = false, uri = null } = options;
        const sourcePath = uri && uri.fsPath || await this.getSourcePath();

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

    public async execute(options: IExecuteOptions): Promise<FileItem> {
        const { fileItem } = options;
        await this.ensureWritableFile(fileItem);
        return fileItem.move();
    }

    private getFilenameSelection(value: string): [number, number] {
        const basename = path.basename(value);
        const start = value.length - basename.length;
        const dot = basename.lastIndexOf('.');
        const exclusiveEndIndex = dot <= 0 ? value.length : start + dot;

        return [start, exclusiveEndIndex];
    }
}
