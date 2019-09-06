import { TextEditor } from 'vscode';
import { FileItem } from '../FileItem';

export interface IDialogOptions {
    prompt?: string;
}

export interface IExecuteOptions {
    fileItem: FileItem;
}

export interface IGetSourcePathOptions {
    relativeToRoot?: boolean;
}

export interface IFileController {
    showDialog(options?: IDialogOptions): Promise<FileItem | undefined>;
    execute(options: IExecuteOptions): Promise<FileItem>;
    openFileInEditor(fileItem: FileItem): Promise<TextEditor | undefined>;
    closeCurrentFileEditor(): Promise<any>;
    getSourcePath(options?: IGetSourcePathOptions): Promise<string>;
}
