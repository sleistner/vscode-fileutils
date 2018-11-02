import { TextEditor } from 'vscode';
import { FileItem } from '../Item';

export interface IDialogOptions {
    prompt: string;
}

export interface IExecuteOptions {
    fileItem: FileItem;
}

export interface IFileController {
    showDialog(options?: IDialogOptions): Promise<FileItem>;
    execute(options: IExecuteOptions): Promise<FileItem>;
    openFileInEditor(fileItem: FileItem): Promise<TextEditor>;
    closeCurrentFileEditor(): Promise<any>;
    getSourcePath(): Promise<string>;
}
