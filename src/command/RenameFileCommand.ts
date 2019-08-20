import { Uri } from 'vscode';
import { getConfiguration } from '../lib/config';
import { BaseCommand } from './BaseCommand';

export class RenameFileCommand extends BaseCommand {

    public async execute(uri?: Uri) {
        const fileItem = await this.controller.showDialog({ prompt: 'New Name' });

        if (fileItem) {
            const movedFileItem = await this.controller.execute({ fileItem });

            if (getConfiguration('rename.closeOldTab')) {
                await this.controller.closeCurrentFileEditor();
            }

            return this.controller.openFileInEditor(movedFileItem);
        }
    }

}
