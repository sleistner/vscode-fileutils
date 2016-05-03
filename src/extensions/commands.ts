/// <reference path="../../typings/tsd.d.ts" />

import { commands, window } from 'vscode';
import { FileController } from './api/controller';
import { FileItem } from './api/item';

function handleError(err) {
    if (err) {
        window.showErrorMessage(err);
    }
}

const controller = new FileController();

export function move(): Promise<any> {

    return controller.showFileDialog({ prompt: 'New Location', showFullPath: true })
        .then((fileItem: FileItem) => controller.move(fileItem))
        .then((newFile) => controller.openFileInEditor(newFile))
        .catch(handleError);
}

export function rename(): Promise<any> {

    return controller.showFileDialog({ prompt: 'New Name' })
        .then((fileItem: FileItem) => controller.move(fileItem))
        .then((newFile) => controller.openFileInEditor(newFile))
        .catch(handleError);
}

export function duplicate(): Promise<any> {

    return controller.showFileDialog({ prompt: 'Duplicate As', showFullPath: true })
        .then((fileItem: FileItem) => controller.duplicate(fileItem))
        .then((newFile) => controller.openFileInEditor(newFile))
        .catch(handleError);
}

export function remove(): Promise<any> {

    return controller.remove()
        .then(() => controller.closeCurrentFileEditor())
        .catch(handleError);
}