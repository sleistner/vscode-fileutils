import * as fs from 'fs-extra';
import * as path from 'path';

import trash = require('trash');

export class FileItem {

    constructor(private SourcePath: string, private TargetPath?: string, private IsDir: boolean = false) {
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

    get isDir(): boolean {
        return this.IsDir;
    }

    public async move(): Promise<FileItem> {
        await this.ensureDir();
        await fs.rename(this.path, this.targetPath);

        this.SourcePath = this.targetPath;
        return this;
    }

    public async duplicate(): Promise<FileItem> {
        await this.ensureDir();
        await fs.copy(this.path, this.targetPath);

        return new FileItem(this.targetPath);
    }

    public async remove(useTrash = false): Promise<FileItem> {
        await useTrash ? trash([this.path]) : fs.remove(this.path);

        return this;
    }

    public async create(mkDir?: boolean): Promise<FileItem> {
        const fn = mkDir === true || this.isDir ? fs.ensureDir : fs.createFile;
        await fs.remove(this.targetPath);
        await fn(this.targetPath);

        return new FileItem(this.targetPath);
    }

    private async ensureDir(): Promise<any> {
        return fs.ensureDir(path.dirname(this.targetPath));
    }
}
