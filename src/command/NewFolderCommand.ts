import { Uri } from "vscode";
import { NewFileCommand, NewFileOptions } from "./NewFileCommand";

export class NewFolderCommand extends NewFileCommand {
    public async execute(uri?: Uri, options?: NewFileOptions): Promise<void> {
        const { relativeToRoot = false } = options || {};
        const dialogOptions = { prompt: "Folder Name", relativeToRoot };
        const fileItem = await this.controller.showDialog(dialogOptions);

        if (fileItem) {
            const executeOptions = { fileItem, isDir: true };
            await this.controller.execute(executeOptions);
        }
    }
}
