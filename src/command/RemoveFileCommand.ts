import { Uri } from 'vscode';
import { BaseCommand } from './BaseCommand';

export class RemoveFileCommand extends BaseCommand {

    public async execute(uri?: Uri) {
        const fileItem = await this.controller.showDialog();
        if (fileItem) {
            return this.controller.execute({ fileItem });
        }
    }

}
