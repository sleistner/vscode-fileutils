import { Uri } from 'vscode';
import { NewFolderCommand } from './NewFolderCommand';

export class NewFolderAtRootCommand extends NewFolderCommand {

    public async execute(uri?: Uri) {
        return super.execute(uri, { relativeToRoot: true });
    }

}
