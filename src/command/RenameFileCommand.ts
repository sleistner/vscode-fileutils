import { MoveFileController } from '../controller';

export const controller = new MoveFileController();

export function renameFile() {

    return controller.showDialog({ prompt: 'New Name' })
        .then((fileItem) => controller.move(fileItem))
        .then((fileItem) => controller.openFileInEditor(fileItem));
}
