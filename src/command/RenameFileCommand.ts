import { MoveFileController } from "../controller";
import { BaseCommand } from "./BaseCommand";

export class RenameFileCommand extends BaseCommand<MoveFileController> {
    public async execute(): Promise<void> {
        const dialogOptions = { prompt: "New Name" };
        const fileItem = await this.controller.showDialog(dialogOptions);
        await this.executeController(fileItem);
    }
}
