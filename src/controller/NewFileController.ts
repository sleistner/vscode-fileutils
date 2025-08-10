import expand from "brace-expansion";
import * as path from "path";
import { window } from "vscode";
import { FileItem } from "../FileItem";
import { BaseFileController, type TargetPathInputBoxValueOptions } from "./BaseFileController";
import type { DialogOptions, ExecuteOptions, SourcePathOptions } from "./FileController";

export interface NewFileDialogOptions extends Omit<DialogOptions, "uri"> {
    relativeToRoot?: boolean;
}

export interface NewFileExecuteOptions extends ExecuteOptions {
    isDir?: boolean;
}

export class NewFileController extends BaseFileController {
    public async showDialog(options: NewFileDialogOptions): Promise<FileItem[] | undefined> {
        const { relativeToRoot = false, typeahead } = options;
        const sourcePath = await this.getNewFileSourcePath({ relativeToRoot, typeahead });
        const targetPath = await this.getTargetPath(sourcePath, options);

        if (!targetPath) {
            return;
        }

        return expand(targetPath.replace(/\\/g, "/")).map((filePath) => {
            const realPath = path.resolve(sourcePath, filePath);
            const isDir = filePath.endsWith("/");
            return new FileItem(sourcePath, realPath, isDir);
        });
    }

    public async execute(options: NewFileExecuteOptions): Promise<FileItem> {
        const { fileItem, isDir = false } = options;
        await this.ensureWritableFile(fileItem);
        try {
            return fileItem.create(isDir);
        } catch {
            throw new Error(`Error creating file '${fileItem.path}'.`);
        }
    }

    protected async getTargetPathInputBoxValue(
        sourcePath: string,
        options: TargetPathInputBoxValueOptions
    ): Promise<string> {
        const value = path.join(sourcePath, path.sep);
        return super.getTargetPathInputBoxValue(value, options);
    }

    public async getNewFileSourcePath({ relativeToRoot, typeahead }: SourcePathOptions): Promise<string> {
        const rootPath = await this.getRootPath(relativeToRoot === true);

        if (!rootPath) {
            throw new Error();
        }

        return this.getFileSourcePathAtRoot(rootPath, { relativeToRoot, typeahead });
    }

    private async getRootPath(relativeToRoot: boolean): Promise<string | undefined> {
        if (relativeToRoot) {
            return this.getWorkspaceFolderPath(relativeToRoot);
        }
        return path.dirname(await this.getSourcePath());
    }

    protected async getWorkspaceFolderPath(relativeToRoot: boolean): Promise<string | undefined> {
        const requiresWorkspaceFolderPick = relativeToRoot && this.isMultiRootWorkspace;
        if (requiresWorkspaceFolderPick) {
            const workspaceFolder = await window.showWorkspaceFolderPick();
            return workspaceFolder?.uri.fsPath;
        }

        return super.getWorkspaceFolderPath();
    }
}
