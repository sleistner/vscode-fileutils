import { NewFileCommand } from "./NewFileCommand";

export class NewFolderCommand extends NewFileCommand {
    public async execute(): Promise<void> {
        const relativeToRoot = this.options?.relativeToRoot ?? false;
        const dialogOptions = { prompt: "Folder Name", relativeToRoot };
        const fileItem = await this.controller.showDialog(dialogOptions);

        if (fileItem) {
            const executeOptions = { fileItem, isDir: true };
            await this.controller.execute(executeOptions);
        }
    }
}
