import { ExtensionContext, Uri } from 'vscode';
import { IFileController, MoveFileController } from '../controller';
import { IMoveFileDialogOptions } from '../controller/MoveFileController';
import { getConfiguration } from '../lib/config';
import { BaseCommand } from './BaseCommand';

export class MoveFileCommand extends BaseCommand {

    public async execute(uri?: Uri) {
        const dialogOptions: IMoveFileDialogOptions = { prompt: 'New Location', showFullPath: true, uri };
        const fileItem = await this.controller.showDialog(dialogOptions);
        if (fileItem) {
            await this.controller.execute({ fileItem });

            if (getConfiguration('move.closeOldTab')) {
                await this.controller.closeCurrentFileEditor();
            }

            return this.controller.openFileInEditor(fileItem);
        }
    }

}
