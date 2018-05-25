import { MoveFileController } from '../controller';

export const controller = new MoveFileController();

export async function renameFile() {
    const fileItem = await controller.showDialog({ prompt: 'New Name' });
    const movedFileItem = await controller.move(fileItem);
    return controller.openFileInEditor(movedFileItem);
}
