import * as fs from 'fs';
import { sync as globSync } from 'glob';
import * as path from 'path';
import { workspace } from 'vscode';
import { getConfiguration } from '../lib/config';

export class TreeWalker {

    public async directories(sourcePath: string): Promise<string[]> {
        const ignore = this.configIgnoredGlobs()
            .map(this.invertGlob);

        const results = globSync('**', { cwd: sourcePath, ignore })
            .filter((file) => fs.statSync(path.join(sourcePath, file)).isDirectory())
            .map((file) => path.sep + file);

        return results;
    }

    private configIgnoredGlobs(): string[] {
        const configFilesExclude = {
            ...getConfiguration('typeahead.exclude'),
            ...workspace.getConfiguration('files.exclude', null)
        };
        return Object.keys(configFilesExclude)
            .filter((key) => configFilesExclude[key] === true);
    }

    private invertGlob(pattern: string) {
        return pattern.replace(/^!/, '');
    }
}
