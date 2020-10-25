import { workspace } from "vscode";

export function getConfiguration<T>(key: string): T | undefined {
    return workspace.getConfiguration("fileutils", null).get(key);
}
