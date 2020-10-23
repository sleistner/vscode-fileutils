import { Uri } from 'vscode';
import { BaseCommand } from './BaseCommand';

export class RenameFileCommand extends BaseCommand {

    public async execute(uri?: Uri) {
        const fileItem = await this.controller.showDialog({ prompt: 'New Name' });

        if (fileItem) {
            await this.controller.execute({ fileItem });
        }
    }

}
