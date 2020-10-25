import { Uri } from "vscode";
import { FileController } from "../controller";
import { Command } from "./Command";

export abstract class BaseCommand<T extends FileController> implements Command {
    constructor(protected controller: T) {}

    public abstract async execute(uri?: Uri): Promise<void>;
}
