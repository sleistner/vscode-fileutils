import { Uri } from "vscode";
import { FileController } from "../controller";
import { Command, CommandConstructorOptions } from "./Command";

export abstract class BaseCommand<T extends FileController> implements Command {
    constructor(protected controller: T, readonly options?: CommandConstructorOptions) {}

    public abstract async execute(uri?: Uri): Promise<void>;
}
