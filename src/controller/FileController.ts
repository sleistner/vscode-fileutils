import { TextEditor, Uri } from "vscode";
import { FileItem } from "../FileItem";

export interface DialogOptions {
    prompt?: string;
    uri?: Uri;
    typeahead?: boolean;
}

export interface ExecuteOptions {
    fileItem: FileItem;
}

export interface SourcePathOptions {
    relativeToRoot?: boolean;
    ignoreIfNotExists?: boolean;
    uri?: Uri;
    typeahead?: boolean;
}

export interface FileController {
    showDialog(options?: DialogOptions): Promise<FileItem | FileItem[] | undefined>;
    execute(options: ExecuteOptions): Promise<FileItem>;
    openFileInEditor(fileItem: FileItem): Promise<TextEditor | undefined>;
    closeCurrentFileEditor(): Promise<unknown>;
    getSourcePath(options?: SourcePathOptions): Promise<string>;
}
