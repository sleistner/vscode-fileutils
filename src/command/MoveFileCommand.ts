import { Uri } from 'vscode';
import { MoveFileController } from '../controller';

export const controller = new MoveFileController();

export async function moveFile(uri?: Uri) {
    const fileItem = await controller.showDialog({ prompt: 'New Location', showFullPath: true, uri });
    await controller.execute({ fileItem });
    return controller.openFileInEditor(fileItem);
}
