import { Uri } from 'vscode';
import { INewFileDialogOptions, INewFileExecuteOptions } from '../controller/NewFileController';
import { INewFileOptions, NewFileCommand } from './NewFileCommand';

export class NewFolderCommand extends NewFileCommand {

    public async execute(uri?: Uri, options?: INewFileOptions) {
        const { relativeToRoot = false } = options || {};

        const dialogOptions: INewFileDialogOptions = { prompt: 'Folder Name', relativeToRoot };
        const fileItem = await this.controller.showDialog(dialogOptions);
        if (fileItem) {
            const executeOptions: INewFileExecuteOptions = { fileItem, isDir: true };
            return this.controller.execute(executeOptions);
        }
    }

}
