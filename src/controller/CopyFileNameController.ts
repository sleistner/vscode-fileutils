import { Uri } from 'vscode';
import { ClipboardUtil } from '../ClipboardUtil';
import { FileItem } from '../Item';
import { BaseFileController } from './BaseFileController';
import { IDialogOptions, IExecuteOptions } from './FileController';

export interface ICopyFileNameDialogOptions extends IDialogOptions {
    uri?: Uri;
}

export class CopyFileNameController extends BaseFileController {

    public async showDialog(options: ICopyFileNameDialogOptions): Promise<FileItem> {
        const { uri = null } = options;
        const sourcePath = uri && uri.fsPath || await this.getSourcePath();
        if (!sourcePath) {
            throw new Error();
        }
        return new FileItem(sourcePath);
    }

    public async execute(options: IExecuteOptions): Promise<FileItem> {
        await ClipboardUtil.setClipboardContent(options.fileItem.name);
        return options.fileItem;
    }
}
