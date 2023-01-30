import path from "path";
import {
    commands,
    env,
    ExtensionContext,
    InputBoxOptions,
    TextEditor,
    Uri,
    window,
    workspace,
    WorkspaceFolder,
} from "vscode";
import { FileItem } from "../FileItem";
import { Cache } from "../lib/Cache";
import { getConfiguration } from "../lib/config";
import { DialogOptions, ExecuteOptions, FileController, SourcePathOptions } from "./FileController";
import { TypeAheadController } from "./TypeAheadController";

enum InputBoxPathType {
    Root = "root",
    Workspace = "workspace",
}

type TargetPathInputBoxOptions = InputBoxOptions & Required<Pick<InputBoxOptions, "value">>;

export interface TargetPathInputBoxValueOptions extends DialogOptions {
    workspaceFolderPath?: string;
    pathType: InputBoxPathType;
}

export abstract class BaseFileController implements FileController {
    constructor(protected context: ExtensionContext) {}

    public abstract showDialog(options?: DialogOptions): Promise<FileItem | FileItem[] | undefined>;

    public abstract execute(options: ExecuteOptions): Promise<FileItem>;

    private get pathTypeIndicator(): string {
        return getConfiguration("inputBox.pathTypeIndicator") ?? "";
    }

    public async openFileInEditor(fileItem: FileItem): Promise<TextEditor | undefined> {
        if (fileItem.isDir) {
            return;
        }

        const textDocument = await workspace.openTextDocument(fileItem.path);
        if (!textDocument) {
            throw new Error("Could not open file!");
        }

        const editor = await window.showTextDocument(textDocument);
        if (!editor) {
            throw new Error("Could not show document!");
        }

        return editor;
    }

    public async closeCurrentFileEditor(): Promise<unknown> {
        return commands.executeCommand("workbench.action.closeActiveEditor");
    }

    protected async getTargetPath(sourcePath: string, options: DialogOptions): Promise<string | undefined> {
        const { prompt } = options;

        const pathType = this.getInputBoxPathType();
        const workspaceFolderPath = await this.getWorkspaceFolderPath();
        const value = await this.getTargetPathInputBoxValue(sourcePath, {
            ...options,
            workspaceFolderPath,
            pathType,
        });

        const targetPath = await this.showTargetPathInputBox({
            prompt,
            value,
        });

        const shouldRestoreAbsolutePath = targetPath && workspaceFolderPath && pathType === InputBoxPathType.Workspace;

        if (shouldRestoreAbsolutePath) {
            return path.join(
                workspaceFolderPath,
                targetPath.replace(new RegExp(`^(${this.pathTypeIndicator}|${workspaceFolderPath})`, "g"), "")
            );
        }

        return targetPath;
    }

    protected async showTargetPathInputBox(options: TargetPathInputBoxOptions): Promise<string | undefined> {
        const { prompt, value } = options;
        const valueSelection = this.getFilenameSelection(value);

        return await window.showInputBox({
            prompt,
            value,
            valueSelection,
            ignoreFocusOut: true,
        });
    }

    private getInputBoxPathType(): InputBoxPathType {
        const pathType: InputBoxPathType | undefined = getConfiguration("inputBox.pathType");

        if (pathType && Object.values(InputBoxPathType).includes(pathType)) {
            return pathType;
        }
        return InputBoxPathType.Root;
    }

    protected async getTargetPathInputBoxValue(
        sourcePath: string,
        options: TargetPathInputBoxValueOptions
    ): Promise<string> {
        const { workspaceFolderPath, pathType } = options;

        if (pathType === InputBoxPathType.Workspace && workspaceFolderPath) {
            return sourcePath.replace(workspaceFolderPath, this.pathTypeIndicator);
        }
        return sourcePath;
    }

    protected getFilenameSelection(value: string): [number, number] {
        return [value.length, value.length];
    }

    public async getSourcePath({ ignoreIfNotExists, uri }: SourcePathOptions = {}): Promise<string> {
        if (uri?.fsPath) {
            return uri.fsPath;
        }
        // Attempting to get the fileName from the activeTextEditor.
        // Works for text files only.
        const activeEditor = window.activeTextEditor;
        if (activeEditor && activeEditor.document && activeEditor.document.fileName) {
            return activeEditor.document.fileName;
        }

        // No activeTextEditor means that we don't have an active file or
        // the active file is a non-text file (e.g. binary files such as images).
        // Since there is no actual API to differentiate between the scenarios, we try to retrieve
        // the path for a non-textual file before throwing an error.
        const sourcePath = await this.getSourcePathForNonTextFile();
        if (!sourcePath && ignoreIfNotExists !== true) {
            throw new Error();
        }

        return sourcePath;
    }

    protected getCache(namespace: string): Cache {
        return new Cache(this.context.globalState, namespace);
    }

    protected async ensureWritableFile(fileItem: FileItem): Promise<FileItem> {
        if (!fileItem.exists) {
            return fileItem;
        }

        if (fileItem.targetPath === undefined) {
            throw new Error("Missing target path");
        }

        const message = `File '${fileItem.targetPath.path}' already exists.`;
        const action = "Overwrite";
        const overwrite = await window.showInformationMessage(message, { modal: true }, action);
        if (overwrite) {
            return fileItem;
        }
        throw new Error();
    }

    private async getSourcePathForNonTextFile(): Promise<string> {
        // Since there is no API to get details of non-textual files, the following workaround is performed:
        // 1. Saving the original clipboard data to a local variable.
        const originalClipboardData = await env.clipboard.readText();

        // 2. Populating the clipboard with an empty string
        await env.clipboard.writeText("");

        // 3. Calling the copyPathOfActiveFile that populates the clipboard with the source path of the active file.
        // If there is no active file - the clipboard will not be populated and it will stay with the empty string.
        await commands.executeCommand("workbench.action.files.copyPathOfActiveFile");

        // 4. Get the clipboard data after the API call
        const postAPICallClipboardData = await env.clipboard.readText();

        // 5. Return the saved original clipboard data to the clipboard so this method
        // will not interfere with the clipboard's content.
        await env.clipboard.writeText(originalClipboardData);

        // 6. Return the clipboard data from the API call (which could be an empty string if it failed).
        return postAPICallClipboardData;
    }

    protected async getWorkspaceFolderPath(relativeToRoot?: boolean): Promise<string | undefined>;
    protected async getWorkspaceFolderPath(): Promise<string | undefined> {
        const workspaceFolder = await this.selectWorkspaceFolder();
        return workspaceFolder?.uri.fsPath;
    }

    protected async selectWorkspaceFolder(): Promise<WorkspaceFolder | undefined> {
        if (workspace.workspaceFolders && workspace.workspaceFolders.length === 1) {
            return workspace.workspaceFolders[0];
        }

        const sourcePath = await this.getSourcePath({ ignoreIfNotExists: true });
        const uri = Uri.file(sourcePath);
        return workspace.getWorkspaceFolder(uri) || window.showWorkspaceFolderPick();
    }

    protected get isMultiRootWorkspace(): boolean {
        return workspace.workspaceFolders !== undefined && workspace.workspaceFolders.length > 1;
    }

    protected async getFileSourcePathAtRoot(
        rootPath: string,
        workspaceFolderPath: string,
        options: SourcePathOptions
    ): Promise<string> {
        const { relativeToRoot = false, typeahead, showParentFolder } = options;
        let sourcePath = rootPath;

        if (typeahead) {
            const cache = this.getCache(`workspace:${sourcePath}`);
            const typeAheadController = new TypeAheadController(cache, {
                relativeToRoot,
                showParentFolder,
            });
            sourcePath = await typeAheadController.showDialog(sourcePath, workspaceFolderPath);
        }

        if (!sourcePath) {
            throw new Error();
        }

        return sourcePath;
    }
}
