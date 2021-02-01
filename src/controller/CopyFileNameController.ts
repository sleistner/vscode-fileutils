import { env } from "vscode";
import { FileItem } from "../FileItem";
import { BaseFileController } from "./BaseFileController";
import { DialogOptions, ExecuteOptions } from "./FileController";

export class CopyFileNameController extends BaseFileController {
    public async showDialog(options: DialogOptions): Promise<FileItem> {
        const { uri } = options;
        const sourcePath = await this.getSourcePath({ uri });

        if (!sourcePath) {
            throw new Error();
        }
        return new FileItem(sourcePath);
    }

    public async execute(options: ExecuteOptions): Promise<FileItem> {
        await env.clipboard.writeText(options.fileItem.name);
        return options.fileItem;
    }
}
