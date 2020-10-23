import { Uri } from 'vscode';
import { IMoveFileDialogOptions } from '../controller/MoveFileController';
import { BaseCommand } from './BaseCommand';

export class MoveFileCommand extends BaseCommand {

    public async execute(uri?: Uri) {
        const dialogOptions: IMoveFileDialogOptions = { prompt: 'New Location', showFullPath: true, uri };
        const fileItem = await this.controller.showDialog(dialogOptions);
        if (fileItem) {
            await this.controller.execute({ fileItem });
        }
    }

}
