import { copy } from 'copy-paste-win32fix';
import { promisify } from 'util';
import { FileItem } from '../Item';
import { BaseFileController } from './BaseFileController';
import { IExecuteOptions } from './FileController';

const copyAsync = promisify(copy);

const GENERIC_ERROR_MESSAGE = 'Could not perform copy file name to clipboard';

export class CopyFileNameController extends BaseFileController {
    // Possible errors and their suggested solutions
    private readonly possibleErrorsMap: { [errorMessage: string]: string} = {
        'spawn xclip ENOENT': 'Please install xclip package (`apt-get install xclip`)'
    };

    // Not relevant to CopyFileNameController as it need no dialog
    public async showDialog(): Promise<FileItem> {
        return new FileItem(this.sourcePath);
    }

    public async execute(options: IExecuteOptions): Promise<FileItem> {
        return copyAsync(options.fileItem.name)
        .catch((error: Error) => {
            this.handleError(error.message);
        });
    }

    private handleError(errorMessage: string): void {
        // Can happen on unsupported platforms (e.g Linux machine without the xclip package installed).
        // Attempting to provide a solution according to the error received
        const errorSolution = this.possibleErrorsMap[errorMessage];
        const errorMessageSuffix = errorSolution || errorMessage;

        throw new Error(`${GENERIC_ERROR_MESSAGE}: ${errorMessageSuffix}`);
    }
}
