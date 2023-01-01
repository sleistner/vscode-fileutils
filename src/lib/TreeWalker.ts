import glob from "fast-glob";
import * as path from "path";
import { workspace } from "vscode";

interface ExtendedProcess {
    noAsar: boolean;
}

export class TreeWalker {
    public async directories(sourcePath: string): Promise<string[]> {
        try {
            this.ensureFailSafeFileLookup();
            const files = await glob("**", {
                cwd: sourcePath,
                onlyDirectories: true,
                ignore: this.getExcludePatterns(),
            });
            return files.map((file) => path.join(path.sep, file)).sort();
        } catch (err) {
            const details = (err as Error).message;
            throw new Error(`Unable to list subdirectories for directory "${sourcePath}". Details: (${details})`);
        }
    }

    private getExcludePatterns(): string[] {
        const exclude = new Set([
            ...Object.keys(workspace.getConfiguration("search.exclude")),
            ...Object.keys(workspace.getConfiguration("files.exclude")),
        ]);
        return Array.from(exclude);
    }

    private ensureFailSafeFileLookup() {
        (process as unknown as ExtendedProcess).noAsar = true;
    }
}
