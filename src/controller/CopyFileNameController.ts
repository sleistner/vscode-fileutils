import { copy } from 'copy-paste-win32fix';
import * as path from 'path';
import { promisify } from 'util';
import { window } from 'vscode';
import { BaseCopyController } from './BaseCopyController';

const copyAsync = promisify(copy);

const GENERIC_ERROR_MESSAGE = 'Could not perform copy file name to clipboard';

export class CopyFileNameController extends BaseCopyController {
    // Possible errors and their suggested solutions
    private readonly possibleErrorsMap: { [errorMessage: string]: string} = {
        'spawn xclip ENOENT': 'Please install xclip package (`apt-get install xclip`)'
    };

    public async execute(): Promise<void> {
        const sourcePath = this.sourcePath;
        if (!sourcePath) {
            throw new Error();
        }

        const fileName = path.basename(sourcePath);
        return copyAsync(fileName)
        .catch((error: Error) => {
            this.handleError(error.message);
        });
    }

    private handleError(errorMessage: string): void {
        // Can happen on unsupported platforms (e.g Linux machine without the xclip package installed).
        // Attempting to provide a solution according to the error received
        const errorSolution = this.possibleErrorsMap[errorMessage];
        const warningMessageSuffix = errorSolution || errorMessage;

        window.showWarningMessage(`${GENERIC_ERROR_MESSAGE}: ${warningMessageSuffix}`);
    }
}
