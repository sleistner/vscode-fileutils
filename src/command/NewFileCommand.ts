import { NewFileController } from '../controller';
import { FileController } from '../controller/';

export interface NewFileOptions {
    relativeToRoot?: boolean;
}

export interface NewFolderOptions {
    relativeToRoot?: boolean;
}

export const controller: FileController = new NewFileController();

export async function newFile(options?: NewFileOptions) {
    const { relativeToRoot = false } = options || {};

    const fileItem = await controller.showDialog({ prompt: 'File Name', relativeToRoot });
    const newFileItem = await controller.execute({ fileItem });
    return controller.openFileInEditor(newFileItem);
}

export function newFileAtRoot() {
    return newFile({ relativeToRoot: true });
}

export async function newFolder(options?: NewFolderOptions) {
    const { relativeToRoot = false } = options || {};

    const fileItem = await controller.showDialog({ prompt: 'Folder Name', relativeToRoot });
    return controller.execute({ fileItem, isDir: true });
}

export function newFolderAtRoot() {
    return newFolder({ relativeToRoot: true });
}
