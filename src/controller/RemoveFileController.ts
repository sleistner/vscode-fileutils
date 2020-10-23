import * as path from 'path';
import { window, workspace } from 'vscode';
import { FileItem } from '../FileItem';
import { BaseFileController } from './BaseFileController';
import { IExecuteOptions } from './FileController';

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
        const action = 'Move to Trash';
        const remove = await window.showInformationMessage(message, { modal: true }, action);
        if (remove) {
            return new FileItem(sourcePath);
        }
    }

    public async execute(options: IExecuteOptions): Promise<FileItem> {
        const { fileItem } = options;
        try {
            await fileItem.remove();
        } catch (e) {
            throw new Error(`Error deleting file '${fileItem.path}'.`);
        }
        return fileItem;
    }

    private get confirmDelete(): boolean {
        return workspace.getConfiguration('explorer', null).get('confirmDelete') === true;
    }
}
