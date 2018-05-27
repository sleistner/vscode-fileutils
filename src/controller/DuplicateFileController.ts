import { FileItem } from '../Item';
import { IExecuteOptions } from './AbstractFileController';
import { MoveFileController } from './MoveFileController';

export class DuplicateFileController extends MoveFileController {

    public async execute(options: IExecuteOptions): Promise<FileItem> {
        const { fileItem } = options;
        await this.ensureWritableFile(fileItem);
        return fileItem.duplicate();
    }

}
