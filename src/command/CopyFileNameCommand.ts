import { Uri } from 'vscode';
import { CopyFileNameController, IFileController } from '../controller';
import { ICopyFileNameDialogOptions } from '../controller/CopyFileNameController';
import { BaseCommand } from './BaseCommand';

export class CopyFileNameCommand extends BaseCommand {

    constructor(controller?: IFileController) {
        super(controller || new CopyFileNameController());
    }

    public async execute(uri?: Uri) {
        const dialogOptions: ICopyFileNameDialogOptions = { uri };
        const fileItem = await this.controller.showDialog(dialogOptions);
        return this.controller.execute({ fileItem });
    }
}
