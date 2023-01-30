import glob from "fast-glob";
import { workspace } from "vscode";

interface ExtendedProcess {
    noAsar: boolean;
}

export class TreeWalker {
    public async directories(cwd: string): Promise<string[]> {
        try {
            this.ensureFailSafeFileLookup();
            const files = await glob("**", {
                cwd,
                onlyDirectories: true,
                ignore: this.getExcludePatterns(),
            });
            return files.map((file) => file).sort();
        } catch (err) {
            const details = (err as Error).message;
            throw new Error(`Unable to list subdirectories for directory "${cwd}". Details: (${details})`);
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
