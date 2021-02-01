import { Uri } from "vscode";
import { MoveFileController } from "../controller";
import { BaseCommand } from "./BaseCommand";

export class RenameFileCommand extends BaseCommand<MoveFileController> {
    public async execute(uri?: Uri): Promise<void> {
        const dialogOptions = { prompt: "New Name", uri };
        const fileItem = await this.controller.showDialog(dialogOptions);
        await this.executeController(fileItem);
    }
}
