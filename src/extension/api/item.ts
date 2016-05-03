import * as path from 'path';
import * as fs from 'fs-extra-promise';

export class FileItem {

    sourcePath: string;
    targetPath: string;

    constructor(sourcePath: string, targetPath: string = null) {
        this.sourcePath = sourcePath;
        this.targetPath = targetPath;
    }

    get exists(): Boolean {
        return fs.existsSync(this.targetPath);
    }

    move(): Promise<string> {
        return this.moveOrDuplicate(fs.renameAsync);
    }

    duplicate(): Promise<string> {
        return this.moveOrDuplicate(fs.copyAsync);
    }

    remove(): Promise<string> {

        return new Promise<string>((resolve, reject) => {

            fs.removeAsync(this.sourcePath)
                .then(() => resolve(this.sourcePath))
                .catch(err => reject(err.message));
            
        });

    }

    create(isDir: Boolean = false): Promise<string> {

        return new Promise<string>((resolve, reject) => {

            const create = () => {

                const fn: Function = isDir ? fs.ensureDirAsync : fs.createFileAsync;

                fn(this.targetPath)
                    .then(() => resolve(this.targetPath))
                    .catch(err => reject(err.message));

            };

            fs.removeAsync(this.targetPath)
                .then(create);

        });

    }

    private moveOrDuplicate(fn: Function): Promise<string> {

        return new Promise<string>((resolve, reject) => {

            const moveOrDuplicate = () => {

                fn(this.sourcePath, this.targetPath)
                    .then(() => resolve(this.targetPath))
                    .catch(err => reject(err.message));

            };

            fs.ensureDirAsync(path.dirname(this.targetPath))
                .then(moveOrDuplicate);
        });

    }

}
