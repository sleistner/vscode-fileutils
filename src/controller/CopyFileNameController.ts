import { ClipboardUtil } from '../ClipboardUtil';
import { FileItem } from '../Item';
import { BaseFileController } from './BaseFileController';
import { IExecuteOptions } from './FileController';

export class CopyFileNameController extends BaseFileController {
    // Not relevant to CopyFileNameController as it need no dialog
    public async showDialog(): Promise<FileItem> {
        const sourcePath = await this.getSourcePath();
        return new FileItem(sourcePath);
    }

    public async execute(options: IExecuteOptions): Promise<FileItem> {
        await ClipboardUtil.setClipboardContent(options.fileItem.name);
        return options.fileItem;
    }
}
