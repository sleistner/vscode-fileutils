import { RemoveFileController } from '../controller';

export const controller = new RemoveFileController();

export async function removeFile() {
    const fileItem = await controller.showDialog();
    await controller.remove(fileItem);
    return controller.closeCurrentFileEditor();
}
