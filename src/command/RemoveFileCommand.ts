import { Uri } from 'vscode';
import { IFileController, RemoveFileController } from '../controller';
import { BaseCommand } from './BaseCommand';

export class RemoveFileCommand extends BaseCommand {

    constructor(controller?: IFileController) {
        super(controller || new RemoveFileController());
    }

    public async execute(uri?: Uri) {
        const fileItem = await this.controller.showDialog();
        await this.controller.execute({ fileItem });
        return this.controller.closeCurrentFileEditor();
    }

}
