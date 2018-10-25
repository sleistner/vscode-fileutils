import { copy } from 'copy-paste';
import * as path from 'path';
import { promisify } from 'util';
import { BaseCopyController } from './BaseCopyController';

const copyAsync = promisify(copy);

export class CopyFileNameController extends BaseCopyController {

    public async execute(): Promise<void> {
        const sourcePath = this.sourcePath;
        if (!sourcePath) {
            throw new Error();
        }

        const fileName = path.basename(sourcePath);
        return copyAsync(fileName)
        .catch(() => {
            // Can happen on unsupported platforms (e.g Linux machine without the xclip package installed)
        });
    }
}
