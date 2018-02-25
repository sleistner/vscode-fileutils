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

    public move(): Promise<FileItem> {
        return this.ensureDir()
            .then(() => fs.rename(this.path, this.targetPath))
            .then(() => {
                this.SourcePath = this.targetPath;
                return this;
            });
    }

    public duplicate(): Promise<FileItem> {
        return this.ensureDir()
            .then(() => fs.copy(this.path, this.targetPath))
            .then(() => new FileItem(this.targetPath));
    }

    public remove(useTrash = false): Promise<FileItem> {
        const action = useTrash ? trash([this.path]) : fs.remove(this.path);
        return Promise.resolve(action)
            .then(() => this);
    }

    public create(isDir: boolean = false): Promise<FileItem> {

        const fn = isDir ? fs.ensureDir : fs.createFile;

        return Promise.resolve(fs.remove(this.targetPath))
            .then(() => fn(this.targetPath))
            .then(() => new FileItem(this.targetPath));
    }

    private ensureDir(): Promise<any> {
        return Promise.resolve(fs.ensureDir(path.dirname(this.targetPath)));
    }

}
