import * as path from 'path';
import { window } from 'vscode';
import { FileItem } from '../FileItem';
import { getConfiguration } from '../lib/config';
import { BaseFileController } from './BaseFileController';
import { IExecuteOptions } from './IFileController';

export class RemoveFileController extends BaseFileController {

    public async showDialog(): Promise<FileItem | undefined> {
        const sourcePath = await this.getSourcePath();

        if (!sourcePath) {
            throw new Error();
        }

        if (this.confirmDelete === false) {
            return new FileItem(sourcePath);
        }

        const message = `Are you sure you want to delete '${path.basename(sourcePath)}'?`;
        const action = this.useTrash ? 'Move to Trash' : 'Delete';
        const remove = await window.showInformationMessage(message, { modal: true }, action);
        if (remove) {
            return new FileItem(sourcePath);
        }
    }

    public async execute(options: IExecuteOptions): Promise<FileItem> {
        const { fileItem } = options;
        try {
            await fileItem.remove(this.useTrash);
        } catch (e) {
            throw new Error(`Error deleting file '${fileItem.path}'.`);
        }
        return fileItem;
    }

    private get useTrash(): boolean {
        return getConfiguration('delete.useTrash');
    }

    private get confirmDelete(): boolean {
        return getConfiguration('delete.confirm');
    }
}
