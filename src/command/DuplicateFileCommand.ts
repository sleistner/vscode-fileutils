import { Uri } from "vscode";
import { MoveFileController } from "../controller/MoveFileController";
import { BaseCommand } from "./BaseCommand";

export class DuplicateFileCommand extends BaseCommand<MoveFileController> {
    public async execute(uri?: Uri): Promise<void> {
        const dialogOptions = { prompt: "Duplicate As", showFullPath: true, uri };
        const fileItem = await this.controller.showDialog(dialogOptions);
        await this.executeController(fileItem, { openFileInEditor: true });
    }
}
