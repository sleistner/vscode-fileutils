import * as fs from 'fs-extra';
import * as path from 'path';

import trash from 'trash';

export class FileItem {

    constructor(private SourcePath: string, private TargetPath?: string, private IsDir: boolean = false) {
    }

    get name(): string {
        return path.basename(this.SourcePath);
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
        this.ensureDir();
        fs.renameSync(this.path, this.targetPath);

        this.SourcePath = this.targetPath;
        return this;
    }

    public async duplicate(): Promise<FileItem> {
        this.ensureDir();
        fs.copySync(this.path, this.targetPath);

        return new FileItem(this.targetPath);
    }

    public async remove(useTrash = false): Promise<FileItem> {
        if (useTrash) {
            await trash(this.path);
        } else {
            fs.removeSync(this.path);
        }

        return this;
    }

    public async create(mkDir?: boolean): Promise<FileItem> {
        fs.removeSync(this.targetPath);

        if (mkDir === true || this.isDir) {
            fs.ensureDirSync(this.targetPath);
        } else {
            fs.createFileSync(this.targetPath);
        }

        return new FileItem(this.targetPath);
    }

    private ensureDir() {
        return fs.ensureDirSync(path.dirname(this.targetPath));
    }
}
