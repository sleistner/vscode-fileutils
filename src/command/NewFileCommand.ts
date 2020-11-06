import { NewFileController } from "../controller/NewFileController";
import { BaseCommand } from "./BaseCommand";

export class NewFileCommand extends BaseCommand<NewFileController> {
    public async execute(): Promise<void> {
        const relativeToRoot = this.options?.relativeToRoot ?? false;
        const dialogOptions = { prompt: "File Name", relativeToRoot };
        const fileItems = await this.controller.showDialog(dialogOptions);

        if (fileItems) {
            const executions = [...fileItems].map(async (fileItem) => {
                const result = await this.controller.execute({ fileItem });
                await this.controller.openFileInEditor(result);
            });
            await Promise.all(executions);
        }
    }
}
