import * as path from "path";
import type { DialogOptions } from "./FileController";
import { MoveFileController } from "./MoveFileController";

export class RenameFileController extends MoveFileController {
    protected async getTargetPath(sourcePath: string, options: DialogOptions): Promise<string | undefined> {
        const { prompt } = options;
        const value = path.basename(sourcePath);
        const targetPath = await this.showTargetPathInputBox({ prompt, value });

        if (targetPath) {
            const basePath = path.dirname(sourcePath);
            return path.join(basePath, targetPath.replace(basePath, ""));
        }
    }
}
