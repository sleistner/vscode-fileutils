import { Uri } from 'vscode';
import { IFileController, MoveFileController } from '../controller';
import { getConfiguration } from '../lib/config';
import { BaseCommand } from './BaseCommand';

export class RenameFileCommand extends BaseCommand {

    constructor(controller?: IFileController) {
        super(controller || new MoveFileController());
    }

    public async execute(uri?: Uri) {
        const fileItem = await this.controller.showDialog({ prompt: 'New Name' });
        const movedFileItem = await this.controller.execute({ fileItem });

        if (getConfiguration('rename.closeOldTab')) {
            await this.controller.closeCurrentFileEditor();
        }

        return this.controller.openFileInEditor(movedFileItem);
    }

}
