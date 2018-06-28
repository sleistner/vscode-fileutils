import { Uri } from 'vscode';
import { IFileController, MoveFileController } from '../controller';
import { BaseCommand } from './BaseCommand';

export class RenameFileCommand extends BaseCommand {

    constructor(controller?: IFileController) {
        super(controller || new MoveFileController());
    }

    public async execute(uri?: Uri) {
        const fileItem = await this.controller.showDialog({ prompt: 'New Name' });
        const movedFileItem = await this.controller.execute({ fileItem });
        return this.controller.openFileInEditor(movedFileItem);
    }

}
