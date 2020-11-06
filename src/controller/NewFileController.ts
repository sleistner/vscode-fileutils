import * as path from "path";
import { Uri, window, workspace, WorkspaceFolder } from "vscode";
import { FileItem } from "../FileItem";
import { getConfiguration } from "../lib/config";
import { BaseFileController } from "./BaseFileController";
import { DialogOptions, ExecuteOptions, GetSourcePathOptions } from "./FileController";
import { TypeAheadController } from "./TypeAheadController";
import expand from "brace-expansion";

export interface NewFileDialogOptions extends DialogOptions {
    relativeToRoot?: boolean;
}

export interface NewFileExecuteOptions extends ExecuteOptions {
    isDir?: boolean;
}

export class NewFileController extends BaseFileController {
    public async showDialog(options: NewFileDialogOptions): Promise<FileItem[] | undefined> {
        const { prompt, relativeToRoot = false } = options;
        const sourcePath = await this.getSourcePath({ relativeToRoot });
        const value: string = path.join(sourcePath, path.sep);
        const valueSelection: [number, number] = [value.length, value.length];
        const targetPath = await window.showInputBox({
            prompt,
            value,
            valueSelection,
        });

        if (targetPath) {
            return expand(targetPath).map((filePath) => {
                const realPath = path.resolve(sourcePath, filePath);
                const isDir = filePath.endsWith(path.sep);
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

    public async getSourcePath({ relativeToRoot }: GetSourcePathOptions): Promise<string> {
        const rootPath = relativeToRoot ? await this.getWorkspaceSourcePath() : await this.getFileSourcePath();

        if (!rootPath) {
            throw new Error();
        }

        return this.getFileSourcePathAtRoot(rootPath, relativeToRoot === true);
    }

    private async getWorkspaceSourcePath(): Promise<string | undefined> {
        const workspaceFolder = await this.selectWorkspaceFolder();
        return workspaceFolder?.uri.fsPath;
    }

    private async selectWorkspaceFolder(): Promise<WorkspaceFolder | undefined> {
        if (workspace.workspaceFolders && workspace.workspaceFolders.length === 1) {
            return workspace.workspaceFolders[0];
        }

        const sourcePath = await super.getSourcePath({ ignoreIfNotExists: true });
        const uri = Uri.file(sourcePath);
        return workspace.getWorkspaceFolder(uri) || window.showWorkspaceFolderPick();
    }

    private async getFileSourcePath(): Promise<string> {
        return path.dirname(await super.getSourcePath());
    }

    private async getFileSourcePathAtRoot(rootPath: string, relativeToRoot: boolean): Promise<string> {
        let sourcePath = rootPath;

        if (getConfiguration("typeahead.enabled") === true) {
            const cache = this.getCache(`workspace:${sourcePath}`);
            const typeAheadController = new TypeAheadController(cache, relativeToRoot);
            sourcePath = await typeAheadController.showDialog(sourcePath);
        }

        if (!sourcePath) {
            throw new Error();
        }

        return sourcePath;
    }
}
