import { RemoveFileController } from '../controller';

export const controller = new RemoveFileController();

export function removeFile() {

    return controller.showDialog()
        .then((fileItem) => controller.remove(fileItem))
        .then(() => controller.closeCurrentFileEditor());
}
