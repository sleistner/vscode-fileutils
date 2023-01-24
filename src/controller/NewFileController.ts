import expand from "brace-expansion";
import * as path from "path";
import { FileItem } from "../FileItem";
import { BaseFileController, GetTargetPathInputBoxValueOptions } from "./BaseFileController";
import { DialogOptions, ExecuteOptions, GetSourcePathOptions } from "./FileController";

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

    protected async getTargetPathInputBoxValue(
        sourcePath: string,
        options: GetTargetPathInputBoxValueOptions
    ): Promise<string> {
        const value = path.join(sourcePath, path.sep);
        return super.getTargetPathInputBoxValue(value, options);
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
            return this.getWorkspaceFolderPath();
        }
        return path.dirname(await this.getSourcePath());
    }
}
