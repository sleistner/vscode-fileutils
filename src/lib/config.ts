import { workspace } from "vscode";

export function getConfiguration<T>(key: string, defaultValue?: T): T | undefined {
    return workspace.getConfiguration("fileutils", null).get(key) ?? defaultValue;
}
