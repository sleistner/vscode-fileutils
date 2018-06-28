import { Uri } from 'vscode';
import { DuplicateFileController, IFileController } from '../controller';
import { IMoveFileDialogOptions } from '../controller/MoveFileController';
import { BaseCommand } from './BaseCommand';

export class DuplicateFileCommand extends BaseCommand {

    constructor(controller?: IFileController) {
        super(controller || new DuplicateFileController());
    }

    public async execute(uri?: Uri) {
        const dialogOptions: IMoveFileDialogOptions = { prompt: 'Duplicate As', showFullPath: true, uri };
        const fileItem = await this.controller.showDialog(dialogOptions);
        const copiedFileItem = await this.controller.execute({ fileItem });
        return this.controller.openFileInEditor(copiedFileItem);
    }

}
