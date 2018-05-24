import { FileItem } from '../Item';
import { MoveFileController } from './MoveFileController';

export class DuplicateFileController extends MoveFileController {

    public async duplicate(fileItem: FileItem): Promise<FileItem> {
        const writeable = await this.ensureWritableFile(fileItem);
        if (writeable) {
            return fileItem.duplicate();
        }
    }

}
