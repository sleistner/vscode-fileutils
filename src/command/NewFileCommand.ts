import { NewFileController } from '../controller';

export interface INewFileOptions {
    relativeToRoot?: boolean;
}

export interface INewFolderOptions {
    relativeToRoot?: boolean;
}

export const controller = new NewFileController();

export function newFile(options?: INewFileOptions) {
    const { relativeToRoot = false } = options || {};

    return controller.showDialog({ prompt: 'File Name', relativeToRoot })
        .then((fileItem) => controller.create({ fileItem }))
        .then((fileItem) => controller.openFileInEditor(fileItem));
}

export function newFileAtRoot() {
    return newFile({ relativeToRoot: true });
}

export function newFolder(options?: INewFolderOptions) {
    const { relativeToRoot = false } = options || {};

    return controller.showDialog({ prompt: 'Folder Name', relativeToRoot })
        .then((fileItem) => controller.create({ fileItem, isDir: true }));
}

export function newFolderAtRoot() {
    return newFolder({ relativeToRoot: true });
}
