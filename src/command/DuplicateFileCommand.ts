import { Uri } from 'vscode';
import { DuplicateFileController, IFileController } from '../controller';
import { IMoveFileDialogOptions } from '../controller/MoveFileController';

export const controller: IFileController = new DuplicateFileController();

export async function duplicateFile(uri?: Uri) {
    const dialogOptions: IMoveFileDialogOptions = { prompt: 'Duplicate As', showFullPath: true, uri };
    const fileItem = await controller.showDialog(dialogOptions);
    const copiedFileItem = await controller.execute({ fileItem });
    return controller.openFileInEditor(copiedFileItem);
}
