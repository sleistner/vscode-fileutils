import { Uri } from 'vscode';
import { MoveFileController } from '../controller';

export const controller = new MoveFileController();

export function moveFile(uri?: Uri) {

    return controller.showDialog({ prompt: 'New Location', showFullPath: true, uri })
        .then((fileItem) => controller.move(fileItem))
        .then((fileItem) => controller.openFileInEditor(fileItem));
}
