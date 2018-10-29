import { Uri } from 'vscode';
import { CopyFileNameController, IFileController } from '../controller';
import { FileItem } from '../Item';
import { BaseCommand } from './BaseCommand';

export class CopyFileNameCommand extends BaseCommand {

    constructor(controller?: IFileController) {
        super(controller || new CopyFileNameController());
    }

    public async execute(uri?: Uri) {
        const sourcePath: string = this.controller.sourcePath;
        if (!sourcePath) {
            return;
        }

        const fileItem = new FileItem(sourcePath);
        return this.controller.execute({ fileItem });
    }
}
