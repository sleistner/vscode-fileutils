import { Uri } from 'vscode';

export interface ICommand {
    execute(uri?: Uri);
}
