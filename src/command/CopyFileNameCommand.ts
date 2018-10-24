import { CopyFileNameController, ICopyController } from '../controller';
import { BaseCopyCommand } from './BaseCopyCommand';

export class CopyFileNameCommand extends BaseCopyCommand {

    constructor(controller?: ICopyController) {
        super(controller || new CopyFileNameController());
    }

    public async execute() {
        await this.controller.execute();
    }
}
