import * as fs from 'fs';
import * as gitignoreToGlob from 'gitignore-to-glob';
import { sync as globSync } from 'glob';
import * as path from 'path';
import { workspace } from 'vscode';
import { getConfiguration } from '../lib/config';

export class TreeWalker {

    public async directories(sourcePath: string): Promise<string[]> {
        const ignore = [
          ...this.gitignoreGlobs(sourcePath),
          ...this.configIgnoredGlobs()
        ]
            .map(this.invertGlob);

        const results = globSync('**', { cwd: sourcePath, ignore })
            .filter((file) => fs.statSync(path.join(sourcePath, file)).isDirectory())
            .map((file) => path.sep + file);

        return results;
    }

    private gitignoreGlobs(sourcePath: string): string[] {
        const gitignoreFiles = this.walkupGitignores(sourcePath);

        return gitignoreFiles
            .map(gitignoreToGlob)
            .reduce(this.flatten, []);
    }

    private walkupGitignores(dir, found = []) {
        const gitignore = path.join(dir, '.gitignore');
        if (fs.existsSync(gitignore)) {
            found.push(gitignore);
        }

        const parentDir = path.resolve(dir, '..');
        const reachedSystemRoot = dir === parentDir;

        if (!reachedSystemRoot) {
            return this.walkupGitignores(parentDir, found);
        }
        return found;
    }

    private configIgnoredGlobs(): string[] {
        const configFilesExclude = {
            ...getConfiguration('typeahead.exclude'),
            ...workspace.getConfiguration('files.exclude', null)
        };
        const configIgnored = Object.keys(configFilesExclude)
            .filter((key) => configFilesExclude[key] === true);

        return gitignoreToGlob(configIgnored.join('\n'), { string: true });
    }

    private invertGlob(pattern) {
        return pattern.replace(/^!/, '');
    }

    private flatten(memo, item) {
        return memo.concat(item);
    }
}
