import { Uri } from "vscode";
import { NewFileController } from "../controller/NewFileController";
import { BaseCommand } from "./BaseCommand";

export interface NewFileOptions {
    relativeToRoot?: boolean;
}

export class NewFileCommand extends BaseCommand<NewFileController> {
    public async execute(uri?: Uri, options?: NewFileOptions): Promise<void> {
        const { relativeToRoot = false } = options || {};
        const dialogOptions = { prompt: "File Name", relativeToRoot };
        const fileItem = await this.controller.showDialog(dialogOptions);

        if (fileItem) {
            const newFileItem = await this.controller.execute({ fileItem });
            await this.controller.openFileInEditor(newFileItem);
        }
    }
}
