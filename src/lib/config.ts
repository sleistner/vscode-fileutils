import { workspace } from 'vscode';

export function getConfiguration(key: string): any {
    return workspace.getConfiguration('fileutils', null).get(key);
}
