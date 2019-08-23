import * as glob from 'glob';
import * as path from 'path';
import { Uri, workspace } from 'vscode';
import { getConfiguration } from '../lib/config';

export class TreeWalker {

    public async directories(sourcePath: string): Promise<string[]> {
        return glob
            .sync('**/', { cwd: sourcePath, ignore: this.configIgnore() })
            .map((file) => path.sep + file.replace(/\/$/, ''));
    }

    private configIgnore(): string[] {
        const excludedFilesConfig = {
            ...getConfiguration('typeahead.exclude'),
            ...workspace.getConfiguration('files.exclude', null)
        };
        return Object
            .keys(excludedFilesConfig)
            .filter((key) => excludedFilesConfig[key] === true)
            .map(((pattern) => pattern.replace(/^!/, '')));
    }
}
