import { Uri } from "vscode";
import { CopyFileNameController } from "../controller/CopyFileNameController";
import { BaseCommand } from "./BaseCommand";

export class CopyFileNameCommand extends BaseCommand<CopyFileNameController> {
    public async execute(uri?: Uri): Promise<void> {
        const dialogOptions = { uri };
        const fileItem = await this.controller.showDialog(dialogOptions);
        await this.executeController(fileItem);
    }
}
