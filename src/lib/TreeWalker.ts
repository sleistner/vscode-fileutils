import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import { workspace } from 'vscode';
import { getConfiguration } from '../lib/config';

export class TreeWalker {

    public async directories(sourcePath: string): Promise<string[]> {
        const ignore = this.configIgnore();
        const files = glob.sync('**', { cwd: sourcePath, ignore });
        return files
            .filter((file) => fs.statSync(path.join(sourcePath, file)).isDirectory())
            .map((file) => path.sep + file);
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
