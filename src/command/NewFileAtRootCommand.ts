import { Uri } from 'vscode';
import { NewFileCommand } from './NewFileCommand';

export class NewFileAtRootCommand extends NewFileCommand {

    public async execute(uri?: Uri) {
        return super.execute(uri, { relativeToRoot: true });
    }

}
