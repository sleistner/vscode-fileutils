import { Uri } from "vscode";
import { MoveFileController } from "../controller/MoveFileController";
import { getConfiguration } from "../lib/config";
import { BaseCommand } from "./BaseCommand";

export class MoveFileCommand extends BaseCommand<MoveFileController> {
    public async execute(uri?: Uri): Promise<void> {
        const typeahead = getConfiguration("moveFile.typeahead.enabled") === true;
        const dialogOptions = { prompt: "New Location", showFullPath: true, uri, typeahead };
        const fileItem = await this.controller.showDialog(dialogOptions);
        await this.executeController(fileItem);
    }
}
