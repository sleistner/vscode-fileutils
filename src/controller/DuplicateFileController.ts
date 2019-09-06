import { FileItem } from '../FileItem';
import { IExecuteOptions } from './IFileController';
import { MoveFileController } from './MoveFileController';

export class DuplicateFileController extends MoveFileController {

    public async execute(options: IExecuteOptions): Promise<FileItem> {
        const { fileItem } = options;
        await this.ensureWritableFile(fileItem);
        return fileItem.duplicate();
    }

}
