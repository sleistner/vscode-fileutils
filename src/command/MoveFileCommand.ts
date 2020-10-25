import { Uri } from "vscode";
import { MoveFileController } from "../controller/MoveFileController";
import { BaseCommand } from "./BaseCommand";

export class MoveFileCommand extends BaseCommand<MoveFileController> {
    public async execute(uri?: Uri): Promise<void> {
        const dialogOptions = { prompt: "New Location", showFullPath: true, uri };
        const fileItem = await this.controller.showDialog(dialogOptions);

        if (fileItem) {
            await this.controller.execute({ fileItem });
        }
    }
}
