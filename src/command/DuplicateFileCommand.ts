import type { Uri } from "vscode";
import type { MoveFileController } from "../controller/MoveFileController";
import { getConfiguration } from "../lib/config";
import { BaseCommand } from "./BaseCommand";

export class DuplicateFileCommand extends BaseCommand<MoveFileController> {
    public async execute(uri?: Uri): Promise<void> {
        const typeahead = getConfiguration("duplicateFile.typeahead.enabled") === true;
        const dialogOptions = { prompt: "Duplicate As", uri, typeahead };
        const fileItem = await this.controller.showDialog(dialogOptions);
        await this.executeController(fileItem, { openFileInEditor: !fileItem?.isDir });
    }
}
