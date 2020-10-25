import * as path from "path";
import { RelativePattern, Uri, workspace } from "vscode";

interface ExtendedProcess {
    noAsar: boolean;
}

export class TreeWalker {
    public async directories(sourcePath: string): Promise<string[]> {
        try {
            this.ensureFailSafeFileLookup();
            const pattern = new RelativePattern(sourcePath, "**");
            const files = await workspace.findFiles(pattern, undefined, Number.MAX_VALUE);
            const directories = files.reduce(this.directoryReducer(sourcePath), new Set<string>());
            return this.toSortedArray(directories);
        } catch (err) {
            throw new Error(`Unable to list subdirectories for directory "${sourcePath}". Details: (${err.message})`);
        }
    }

    private ensureFailSafeFileLookup() {
        ((process as unknown) as ExtendedProcess).noAsar = true;
    }

    private directoryReducer(sourcePath: string) {
        return (accumulator: Set<string>, file: Uri) => {
            const directory = path.dirname(file.fsPath).replace(sourcePath, "");
            if (directory) {
                accumulator.add(directory);
            }
            return accumulator;
        };
    }

    private toSortedArray(directories: Set<string>): string[] {
        return Array.from(directories).sort();
    }
}
