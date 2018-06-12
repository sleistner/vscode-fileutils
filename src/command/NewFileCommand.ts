import { NewFileController } from '../controller';
import { IFileController } from '../controller/';
import { INewFileDialogOptions, INewFileExecuteOptions } from '../controller/NewFileController';

export interface INewFileOptions {
    relativeToRoot?: boolean;
}

export interface INewFolderOptions {
    relativeToRoot?: boolean;
}

export const controller: IFileController = new NewFileController();

export async function newFile(options?: INewFileOptions) {
    const { relativeToRoot = false } = options || {};

    const dialogOptions: INewFileDialogOptions = { prompt: 'File Name', relativeToRoot };
    const fileItem = await controller.showDialog(dialogOptions);
    const newFileItem = await controller.execute({ fileItem });
    return controller.openFileInEditor(newFileItem);
}

export function newFileAtRoot() {
    return newFile({ relativeToRoot: true });
}

export async function newFolder(options?: INewFolderOptions) {
    const { relativeToRoot = false } = options || {};

    const dialogOptions: INewFileDialogOptions = { prompt: 'Folder Name', relativeToRoot };
    const fileItem = await controller.showDialog(dialogOptions);
    const executeOptions: INewFileExecuteOptions = { fileItem, isDir: true };
    return controller.execute(executeOptions);
}

export function newFolderAtRoot() {
    return newFolder({ relativeToRoot: true });
}
