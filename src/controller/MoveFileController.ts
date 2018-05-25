import * as path from 'path';
import { Uri, window } from 'vscode';
import { FileItem } from '../Item';
import { AbstractFileController } from './AbstractFileController';

export interface IMoveFileDialogOptions {
    prompt: string;
    showFullPath?: boolean;
    uri?: Uri;
}

export class MoveFileController extends AbstractFileController {

    public async showDialog(options: IMoveFileDialogOptions): Promise<FileItem> {
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

    public async move(fileItem: FileItem): Promise<FileItem> {
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
