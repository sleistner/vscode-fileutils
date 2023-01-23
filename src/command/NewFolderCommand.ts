import { getConfiguration } from "../lib/config";
import { NewFileCommand } from "./NewFileCommand";

export class NewFolderCommand extends NewFileCommand {
    public async execute(): Promise<void> {
        const typeahead = this.typeahead;
        const relativeToRoot = this.options?.relativeToRoot ?? false;
        const dialogOptions = { prompt: "Folder Name", relativeToRoot, typeahead };
        const fileItems = await this.controller.showDialog(dialogOptions);

        if (fileItems) {
            const executions = [...fileItems].map(async (fileItem) => {
                await this.controller.execute({ fileItem, isDir: true });
            });
            await Promise.all(executions);
        }
    }

    protected get typeahead(): boolean {
        return (getConfiguration("newFolder.typeahead.enabled") ?? getConfiguration("typeahead.enabled")) === true;
    }
}
