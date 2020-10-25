import { env, Uri } from "vscode";
import { FileItem } from "../FileItem";
import { BaseFileController } from "./BaseFileController";
import { DialogOptions, ExecuteOptions } from "./FileController";

export interface CopyFileNameDialogOptions extends DialogOptions {
    uri?: Uri;
}

export class CopyFileNameController extends BaseFileController {
    public async showDialog(options: CopyFileNameDialogOptions): Promise<FileItem> {
        const { uri = null } = options;
        const sourcePath = (uri && uri.fsPath) || (await this.getSourcePath());

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
