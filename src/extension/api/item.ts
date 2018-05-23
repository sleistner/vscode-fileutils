import * as fs from 'fs-extra';
import * as path from 'path';
import { workspace } from 'vscode';

// tslint:disable-next-line
const trash = require('trash');

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

    public async create(isDir: boolean = false): Promise<FileItem> {
        const fn = isDir ? fs.ensureDir : fs.createFile;
        await fs.remove(this.targetPath);
        await fn(this.targetPath);

        return new FileItem(this.targetPath);
    }

    private async ensureDir(): Promise<any> {
        return fs.ensureDir(path.dirname(this.targetPath));
    }

}
