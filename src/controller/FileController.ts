import { TextEditor } from 'vscode';
import { FileItem } from '../Item';

export interface DialogOptions {
    prompt: string;
}

export interface ExecuteOptions {
    fileItem: FileItem;
}

export interface FileController {
    showDialog<T extends DialogOptions>(options?: T): Promise<FileItem>;
    execute<T extends ExecuteOptions>(options: T): Promise<FileItem>;
    openFileInEditor(fileItem: FileItem): Promise<TextEditor>;
    closeCurrentFileEditor(): Promise<any>;
}
