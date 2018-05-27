import { RemoveFileController } from '../controller';

export const controller = new RemoveFileController();

export async function removeFile() {
    const fileItem = await controller.showDialog();
    await controller.execute({ fileItem });
    return controller.closeCurrentFileEditor();
}
