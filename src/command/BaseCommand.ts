import { Uri } from 'vscode';
import { IFileController } from '../controller';
import { ICommand } from './Command';

export abstract class BaseCommand implements ICommand {

    constructor(protected controller: IFileController) { }

    public abstract async execute(uri?: Uri): Promise<any>;

}
