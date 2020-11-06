import { NewFileCommand } from "./NewFileCommand";

export class NewFolderCommand extends NewFileCommand {
    public async execute(): Promise<void> {
        const relativeToRoot = this.options?.relativeToRoot ?? false;
        const dialogOptions = { prompt: "Folder Name", relativeToRoot };
        const fileItems = await this.controller.showDialog(dialogOptions);

        if (fileItems) {
            const executions = [...fileItems].map(async (fileItem) => {
                await this.controller.execute({ fileItem, isDir: true });
            });
            await Promise.all(executions);
        }
    }
}
