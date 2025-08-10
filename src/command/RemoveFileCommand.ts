import type { Uri } from "vscode";
import type { RemoveFileController } from "../controller";
import { BaseCommand } from "./BaseCommand";

export class RemoveFileCommand extends BaseCommand<RemoveFileController> {
    public async execute(uri?: Uri): Promise<void> {
        const fileItem = await this.controller.showDialog({ uri });
        await this.executeController(fileItem);
    }
}
