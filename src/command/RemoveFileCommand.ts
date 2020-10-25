import { RemoveFileController } from "../controller";
import { BaseCommand } from "./BaseCommand";

export class RemoveFileCommand extends BaseCommand<RemoveFileController> {
    public async execute(): Promise<void> {
        const fileItem = await this.controller.showDialog();
        await this.executeController(fileItem);
    }
}
