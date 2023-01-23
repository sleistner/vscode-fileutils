import expand from "brace-expansion";
import * as path from "path";
import { FileType, Uri, window, workspace } from "vscode";
import { FileItem } from "../FileItem";
import { BaseFileController } from "./BaseFileController";
import { DialogOptions, ExecuteOptions } from "./FileController";

export interface MoveFileDialogOptions extends DialogOptions {
    showFullPath?: boolean;
}

export class MoveFileController extends BaseFileController {
    public async showDialog(options: MoveFileDialogOptions): Promise<FileItem | undefined> {
        const { uri } = options;
        const sourcePath = await this.getSourcePath({ uri });

        if (!sourcePath) {
            throw new Error();
        }

        const targetPath = await this.getTargetPath(sourcePath, options);

        if (targetPath) {
            const isDir = (await workspace.fs.stat(Uri.file(sourcePath))).type === FileType.Directory;

            return expand(targetPath)
                .map((filePath) => new FileItem(sourcePath, filePath, isDir))
                .at(0);
        }
    }

    public async execute(options: ExecuteOptions): Promise<FileItem> {
        const { fileItem } = options;
        await this.ensureWritableFile(fileItem);
        return fileItem.move();
    }

    private async getTargetPath(sourcePath: string, options: MoveFileDialogOptions): Promise<string | undefined> {
        const { prompt } = options;
        const value = await this.getTargetPathPromptValue(sourcePath, options);
        const valueSelection = this.getFilenameSelection(value);

        return await window.showInputBox({
            prompt,
            value,
            valueSelection,
        });
    }

    private async getTargetPathPromptValue(sourcePath: string, options: MoveFileDialogOptions): Promise<string> {
        const { showFullPath = false } = options;
        if (showFullPath) {
            return await this.getFullTargetPathPromptValue(sourcePath, options);
        }
        return path.basename(sourcePath);
    }

    private async getFullTargetPathPromptValue(sourcePath: string, options: MoveFileDialogOptions): Promise<string> {
        const { typeahead } = options;

        if (!typeahead) {
            return sourcePath;
        }

        const workspaceSourcePath = await this.getWorkspaceSourcePath();

        if (!workspaceSourcePath) {
            throw new Error();
        }

        const rootPath = await this.getFileSourcePathAtRoot(workspaceSourcePath, { relativeToRoot: true, typeahead });
        const fileName = path.basename(sourcePath);

        return path.join(rootPath, fileName);
    }

    private getFilenameSelection(value: string): [number, number] {
        const basename = path.basename(value);
        const start = value.length - basename.length;
        const dot = basename.lastIndexOf(".");
        const exclusiveEndIndex = dot <= 0 ? value.length : start + dot;

        return [start, exclusiveEndIndex];
    }
}
