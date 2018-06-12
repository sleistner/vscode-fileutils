import { Uri } from 'vscode';
import { DuplicateFileController, FileController } from '../controller';

export const controller: FileController = new DuplicateFileController();

export async function duplicateFile(uri?: Uri) {
    const fileItem = await controller.showDialog({ prompt: 'Duplicate As', showFullPath: true, uri });
    const copiedFileItem = await controller.execute({ fileItem });
    return controller.openFileInEditor(copiedFileItem);
}
