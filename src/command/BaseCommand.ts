import type { Uri } from "vscode";
import type { FileController } from "../controller";
import type { FileItem } from "../FileItem";
import type { Command, CommandConstructorOptions } from "./Command";

interface ExecuteControllerOptions {
    openFileInEditor?: boolean;
}

export abstract class BaseCommand<T extends FileController> implements Command {
    constructor(
        protected controller: T,
        readonly options?: CommandConstructorOptions
    ) {}

    public abstract execute(uri?: Uri): Promise<void>;

    protected async executeController(
        fileItem: FileItem | undefined,
        options?: ExecuteControllerOptions
    ): Promise<void> {
        if (fileItem) {
            const result = await this.controller.execute({ fileItem });
            if (options?.openFileInEditor) {
                await this.controller.openFileInEditor(result);
            }
        }
    }
}
