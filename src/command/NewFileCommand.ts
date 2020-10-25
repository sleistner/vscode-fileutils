import { NewFileController } from "../controller/NewFileController";
import { BaseCommand } from "./BaseCommand";

export class NewFileCommand extends BaseCommand<NewFileController> {
    public async execute(): Promise<void> {
        const relativeToRoot = this.options?.relativeToRoot ?? false;
        const dialogOptions = { prompt: "File Name", relativeToRoot };
        const fileItem = await this.controller.showDialog(dialogOptions);
        await this.executeController(fileItem, { openFileInEditor: true });
    }
}
