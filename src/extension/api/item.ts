import * as fs from 'fs-extra-promise';
import * as path from 'path';

export class FileItem {

    private SourcePath: string;
    private TargetPath: string;

    constructor(sourcePath: string, targetPath?: string) {
        this.SourcePath = sourcePath;
        this.TargetPath = targetPath;
    }

    get path(): string {
        return this.SourcePath;
    }

    get targetPath(): string {
        return this.TargetPath;
    }

    get exists(): boolean {
        return fs.existsSync(this.targetPath);
    }

    public move(): Promise<FileItem> {
        return this.ensureDir()
            .then(() => fs.renameAsync(this.path, this.targetPath))
            .then(() => {
                this.SourcePath = this.targetPath;
                return this;
            });
    }

    public duplicate(): Promise<FileItem> {
        return this.ensureDir()
            .then(() => fs.copyAsync(this.path, this.targetPath))
            .then(() => new FileItem(this.targetPath));
    }

    public remove(): Promise<FileItem> {
        return Promise.resolve(fs.removeAsync(this.path))
            .then(() => this);
    }

    public create(isDir: boolean = false): Promise<FileItem> {

        const fn = isDir ? fs.ensureDirAsync : fs.createFileAsync;

        return Promise.resolve(fs.removeAsync(this.targetPath))
            .then(() => fn(this.targetPath))
            .then(() => new FileItem(this.targetPath));
    }

    private ensureDir(): Promise<any> {
        return Promise.resolve(fs.ensureDirAsync(path.dirname(this.targetPath)));
    }

}
