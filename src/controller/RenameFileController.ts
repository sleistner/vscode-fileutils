import * as path from "path";
import { DialogOptions } from "./FileController";
import { MoveFileController } from "./MoveFileController";

export class RenameFileController extends MoveFileController {
    protected async getTargetPath(sourcePath: string, options: DialogOptions): Promise<string | undefined> {
        const { prompt } = options;
        const value = path.basename(sourcePath);
        return await this.showTargetPathInputBox({ prompt, value });
    }
}
