import { FileItem } from '../Item';
import { MoveFileController } from './MoveFileController';

export class DuplicateFileController extends MoveFileController {

    public async duplicate(fileItem: FileItem): Promise<FileItem> {
        await this.ensureWritableFile(fileItem);
        return fileItem.duplicate();
    }

}
