import type { Uri } from "vscode";
import type { RenameFileController } from "../controller/RenameFileController";
import { BaseCommand } from "./BaseCommand";

export class RenameFileCommand extends BaseCommand<RenameFileController> {
    public async execute(uri?: Uri): Promise<void> {
        const dialogOptions = { prompt: "New Name", uri };
        const fileItem = await this.controller.showDialog(dialogOptions);
        await this.executeController(fileItem);
    }
}
