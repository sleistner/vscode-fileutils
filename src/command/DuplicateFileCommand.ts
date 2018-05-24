import { Uri } from 'vscode';
import { DuplicateFileController } from '../controller';

export const controller = new DuplicateFileController();

export function duplicateFile(uri?: Uri) {

    return controller.showDialog({ prompt: 'Duplicate As', showFullPath: true, uri })
        .then((fileItem) => controller.duplicate(fileItem))
        .then((fileItem) => controller.openFileInEditor(fileItem));
}
