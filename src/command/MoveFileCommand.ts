import { Uri } from 'vscode';
import { IFileController, MoveFileController } from '../controller';
import { IMoveFileDialogOptions } from '../controller/MoveFileController';

export const controller: IFileController = new MoveFileController();

export async function moveFile(uri?: Uri) {
    const dialogOptions: IMoveFileDialogOptions = { prompt: 'New Location', showFullPath: true, uri };
    const fileItem = await controller.showDialog(dialogOptions);
    await controller.execute({ fileItem });
    return controller.openFileInEditor(fileItem);
}
