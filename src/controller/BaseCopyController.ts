import { Util } from '../Util';
import { ICopyController } from './FileController';

export abstract class BaseCopyController implements ICopyController {

    public abstract async execute(): Promise<void>;

    protected get sourcePath(): string {
        return Util.getSourcePath();
    }
}
