import * as fs from 'fs-extra-promise';
import * as path from 'path';

export class FileItem {

    private SourcePath: string;
    private TargetPath: string;

    constructor(sourcePath: string, targetPath: string = null) {
        this.SourcePath = sourcePath;
        this.TargetPath = targetPath;
    }

    get sourcePath(): string {
        return this.SourcePath;
    }

    get targetPath(): string {
        return this.TargetPath;
    }

    get exists(): boolean {
        return fs.existsSync(this.targetPath);
    }

    public move(): Promise<string> {
        return this.moveOrDuplicate(fs.renameAsync);
    }

    public duplicate(): Promise<string> {
        return this.moveOrDuplicate(fs.copyAsync);
    }

    public remove(): Promise<string> {

        const executor = (resolve, reject) => {

            fs.removeAsync(this.sourcePath)
                .then(() => resolve(this.sourcePath))
                .catch((err) => reject(err.message));
        };

        return new Promise<string>(executor);
    }

    public create(isDir: boolean = false): Promise<string> {

        const fn = isDir ? fs.ensureDirAsync : fs.createFileAsync;

        const executor = (resolve, reject) => {

            fs.removeAsync(this.targetPath)
                .then(() => fn(this.targetPath))
                .then(() => resolve(this.targetPath))
                .catch((err) => reject(err.message));
        };

        return new Promise<string>(executor);
    }

    private moveOrDuplicate(fn): Promise<string> {

        const executor = (resolve, reject) => {

            fs.ensureDirAsync(path.dirname(this.targetPath))
                .then(() => fn(this.sourcePath, this.targetPath))
                .then(() => resolve(this.targetPath))
                .catch((err) => reject(err.message));
        };

        return new Promise<string>(executor);
    }

}
