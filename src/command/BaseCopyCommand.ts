import { ICopyController } from '../controller';
import { ICommand } from './Command';

export abstract class BaseCopyCommand implements ICommand {

    constructor(protected controller: ICopyController) { }

    public abstract async execute(): Promise<void>;

}
