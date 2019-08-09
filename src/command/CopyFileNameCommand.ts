import { Uri } from 'vscode';
import { ICopyFileNameDialogOptions } from '../controller/CopyFileNameController';
import { BaseCommand } from './BaseCommand';

export class CopyFileNameCommand extends BaseCommand {

    public async execute(uri?: Uri) {
        const dialogOptions: ICopyFileNameDialogOptions = { uri };
        const fileItem = await this.controller.showDialog(dialogOptions);
        if (fileItem) {
            return this.controller.execute({ fileItem });
        }
    }
}
