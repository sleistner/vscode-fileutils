import { Uri } from 'vscode';
import { NewFileController } from '../controller';
import { IFileController } from '../controller/';
import { INewFileDialogOptions } from '../controller/NewFileController';
import { BaseCommand } from './BaseCommand';

export interface INewFileOptions {
    relativeToRoot?: boolean;
}

export class NewFileCommand extends BaseCommand {

    constructor(controller?: IFileController) {
        super(controller || new NewFileController());
    }

    public async execute(uri?: Uri, options?: INewFileOptions): Promise<any> {
        const { relativeToRoot = false } = options || {};

        const dialogOptions: INewFileDialogOptions = { prompt: 'File Name', relativeToRoot };
        const fileItem = await this.controller.showDialog(dialogOptions);
        const newFileItem = await this.controller.execute({ fileItem });
        return this.controller.openFileInEditor(newFileItem);
    }

}
