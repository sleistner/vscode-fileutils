import { copy, paste } from 'copy-paste-win32fix';
import { promisify } from 'util';

const clipboardCopy = promisify(copy);
const clipboardPaste = promisify(paste);

const GENERIC_ERROR_MESSAGE = 'Could not perform copy file name to clipboard';

// Possible errors and their suggested solutions
const POSSIBLE_ERROR_MAP: { [errorMessage: string]: string } = {
    'spawn xclip ENOENT': 'Please install xclip package (`apt-get install xclip`)'
};

export class ClipboardUtil {
    public static async getClipboardContent(): Promise<string> {
        try {
            return clipboardPaste();
        } catch (error) {
            this.handleError(error.message);
        }
    }

    public static async setClipboardContent(content: string): Promise<void> {
        try {
            return clipboardCopy(content);
        } catch (error) {
            this.handleError(error.message);
        }
    }

    public static isClipboardRelatedError(error: Error): boolean {
        return Boolean(POSSIBLE_ERROR_MAP[error.message]);
    }

    private static handleError(errorMessage: string): void {
        // Can happen on unsupported platforms (e.g Linux machine without the xclip package installed).
        // Attempting to provide a solution according to the error received
        const errorSolution = POSSIBLE_ERROR_MAP[errorMessage];
        const errorMessageSuffix = errorSolution || errorMessage;

        throw new Error(`${GENERIC_ERROR_MESSAGE}: ${errorMessageSuffix}`);
    }
}
