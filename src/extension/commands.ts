import {
    Uri,
    window
} from 'vscode';
import { FileController } from './api/controller';

function handleError(err) {
    if (err) {
        window.showErrorMessage(err);
    }
    return err;
}

export interface INewFileOptions {
    relativeToRoot?: boolean;
}

export interface INewFolderOptions {
    relativeToRoot?: boolean;
}

export const controller = new FileController();

export function moveFile(uri?: Uri) {

    return controller.showMoveFileDialog({ prompt: 'New Location', showFullPath: true, uri })
        .then((fileItem) => controller.move(fileItem))
        .then((fileItem) => controller.openFileInEditor(fileItem))
        .catch(handleError);
}

export function renameFile() {

    return controller.showMoveFileDialog({ prompt: 'New Name' })
        .then((fileItem) => controller.move(fileItem))
        .then((fileItem) => controller.openFileInEditor(fileItem))
        .catch(handleError);
}

export function duplicateFile(uri?: Uri) {

    return controller.showMoveFileDialog({ prompt: 'Duplicate As', showFullPath: true, uri })
        .then((fileItem) => controller.duplicate(fileItem))
        .then((fileItem) => controller.openFileInEditor(fileItem))
        .catch(handleError);
}

export function removeFile() {

    return controller.showRemoveFileDialog()
        .then((fileItem) => controller.remove(fileItem))
        .then(() => controller.closeCurrentFileEditor())
        .catch(handleError);
}

export function newFile(options?: INewFileOptions) {

    const { relativeToRoot = false } = options || {};

    return controller.showNewFileDialog({ prompt: 'File Name', relativeToRoot })
        .then((fileItem) => controller.create({ fileItem }))
        .then((fileItem) => controller.openFileInEditor(fileItem))
        .catch(handleError);
}

export function newFileAtRoot() {
    return newFile({ relativeToRoot: true });
}

export function newFolder(options?: INewFolderOptions) {

    const { relativeToRoot = false } = options || {};

    return controller.showNewFileDialog({ prompt: 'Folder Name', relativeToRoot })
        .then((fileItem) => controller.create({ fileItem, isDir: true }))
        .catch(handleError);
}

export function newFolderAtRoot() {
    return newFolder({ relativeToRoot: true });
}
