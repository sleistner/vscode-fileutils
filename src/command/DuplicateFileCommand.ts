import { Uri } from 'vscode';
import { IMoveFileDialogOptions } from '../controller/MoveFileController';
import { BaseCommand } from './BaseCommand';

export class DuplicateFileCommand extends BaseCommand {

    public async execute(uri?: Uri) {
        const dialogOptions: IMoveFileDialogOptions = { prompt: 'Duplicate As', showFullPath: true, uri };
        const fileItem = await this.controller.showDialog(dialogOptions);
        if (fileItem) {
            const copiedFileItem = await this.controller.execute({ fileItem });
            return this.controller.openFileInEditor(copiedFileItem);
        }
    }

}
