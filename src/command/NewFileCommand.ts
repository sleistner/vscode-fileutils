import { NewFileController } from '../controller';

export interface INewFileOptions {
    relativeToRoot?: boolean;
}

export interface INewFolderOptions {
    relativeToRoot?: boolean;
}

export const controller = new NewFileController();

export async function newFile(options?: INewFileOptions) {
    const { relativeToRoot = false } = options || {};

    const fileItem = await controller.showDialog({ prompt: 'File Name', relativeToRoot });
    const newFileItem = await controller.create({ fileItem });
    return controller.openFileInEditor(newFileItem);
}

export function newFileAtRoot() {
    return newFile({ relativeToRoot: true });
}

export async function newFolder(options?: INewFolderOptions) {
    const { relativeToRoot = false } = options || {};

    const fileItem = await controller.showDialog({ prompt: 'Folder Name', relativeToRoot });
    return controller.create({ fileItem, isDir: true });
}

export function newFolderAtRoot() {
    return newFolder({ relativeToRoot: true });
}
