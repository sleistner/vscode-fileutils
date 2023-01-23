import expand from "brace-expansion";
import * as path from "path";
import { window } from "vscode";
import { FileItem } from "../FileItem";
import { BaseFileController } from "./BaseFileController";
import { DialogOptions, ExecuteOptions, GetSourcePathOptions } from "./FileController";

export interface NewFileDialogOptions extends Omit<DialogOptions, "uri"> {
    relativeToRoot?: boolean;
}

export interface NewFileExecuteOptions extends ExecuteOptions {
    isDir?: boolean;
}

export class NewFileController extends BaseFileController {
    public async showDialog(options: NewFileDialogOptions): Promise<FileItem[] | undefined> {
        const { prompt, relativeToRoot = false, typeahead } = options;
        const sourcePath = await this.getNewFileSourcePath({ relativeToRoot, typeahead });
        const value: string = path.join(sourcePath, path.sep);
        const valueSelection: [number, number] = [value.length, value.length];
        const targetPath = await window.showInputBox({
            prompt,
            value,
            valueSelection,
        });

        if (targetPath) {
            return expand(targetPath.replace(/\\/g, "/")).map((filePath) => {
                const realPath = path.resolve(sourcePath, filePath);
                const isDir = filePath.endsWith("/");
                return new FileItem(sourcePath, realPath, isDir);
            });
        }
    }

    public async execute(options: NewFileExecuteOptions): Promise<FileItem> {
        const { fileItem, isDir = false } = options;
        await this.ensureWritableFile(fileItem);
        try {
            return fileItem.create(isDir);
        } catch (e) {
            throw new Error(`Error creating file '${fileItem.path}'.`);
        }
    }

    public async getNewFileSourcePath({ relativeToRoot, typeahead }: GetSourcePathOptions): Promise<string> {
        const rootPath = await this.getRootPath(relativeToRoot === true);

        if (!rootPath) {
            throw new Error();
        }

        return this.getFileSourcePathAtRoot(rootPath, { relativeToRoot, typeahead });
    }

    private async getRootPath(relativeToRoot: boolean): Promise<string | undefined> {
        if (relativeToRoot) {
            return this.getWorkspaceSourcePath();
        }
        return path.dirname(await this.getSourcePath());
    }
}
