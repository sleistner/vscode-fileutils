import { commands, window } from 'vscode';
import { FileController } from './api/controller';
import { FileItem } from './api/item';

function handleError(err) {
    if (err) {
        window.showErrorMessage(err);
    }
}

const controller = new FileController();

export function moveFile() {

    controller.showMoveFileDialog({ prompt: 'New Location', showFullPath: true })
        .then((fileItem: FileItem) => controller.move(fileItem))
        .then((newFile) => controller.openFileInEditor(newFile))
        .catch(handleError);
}

export function renameFile() {

    controller.showMoveFileDialog({ prompt: 'New Name' })
        .then((fileItem: FileItem) => controller.move(fileItem))
        .then((newFile) => controller.openFileInEditor(newFile))
        .catch(handleError);
}

export function duplicateFile() {

    controller.showMoveFileDialog({ prompt: 'Duplicate As', showFullPath: true })
        .then((fileItem: FileItem) => controller.duplicate(fileItem))
        .then((newFile) => controller.openFileInEditor(newFile))
        .catch(handleError);
}

export function removeFile() {

    controller.remove()
        .then(() => controller.closeCurrentFileEditor())
        .catch(handleError);
}

export function newFile({root = false} = {}) {

    controller.showNewFileDialog({ prompt: 'File Name', root })
        .then((fileItem: FileItem) => controller.create(fileItem))
        .then((newFile) => controller.openFileInEditor(newFile))
        .catch(handleError);
}

export function newFileAtRoot() {

    newFile({ root: true });
}

export function newFolder({root = false} = {}) {

    controller.showNewFileDialog({ prompt: 'Folder Name', root })
        .then((fileItem: FileItem) => controller.create(fileItem, true))
        .catch(handleError);
}

export function newFolderAtRoot() {

    newFolder({ root: true });
}
