import { NewFileController } from "../controller/NewFileController";
import { getConfiguration } from "../lib/config";
import { BaseCommand } from "./BaseCommand";

export class NewFileCommand extends BaseCommand<NewFileController> {
    public async execute(): Promise<void> {
        const typeahead = this.typeahead;
        const relativeToRoot = this.options?.relativeToRoot ?? false;
        const dialogOptions = { prompt: "File Name", relativeToRoot, typeahead };
        const fileItems = await this.controller.showDialog(dialogOptions);

        if (fileItems) {
            const executions = [...fileItems].map(async (fileItem) => {
                const result = await this.controller.execute({ fileItem });
                await this.controller.openFileInEditor(result);
            });
            await Promise.all(executions);
        }
    }

    protected get typeahead(): boolean {
        return (getConfiguration("newFile.typeahead.enabled") ?? getConfiguration("typeahead.enabled")) === true;
    }
}
