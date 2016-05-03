/// <reference path="../../../typings/tsd.d.ts" />

import * as path from 'path';
import * as fs from 'fs-extra';

export class FileItem {

    sourcePath: string;
    targetPath: string;

    constructor(sourcePath: string, targetPath: string = null) {
        this.sourcePath = sourcePath;
        this.targetPath = targetPath && path.resolve(path.dirname(sourcePath), targetPath);
    }

    get exists(): Boolean {
        return fs.existsSync(this.targetPath);
    }

    move(): Promise<string> {
        return this.moveOrDuplicate(fs.rename);
    }

    duplicate(): Promise<string> {
        return this.moveOrDuplicate(fs.copy);
    }

    remove(): Promise<string> {

        return new Promise((resolve, reject) => {

            fs.remove(this.sourcePath, (err) => {
                
                if (err) {
                    return reject(err.message);
                }

                resolve(this.sourcePath);
            });
        });

    }

    private moveOrDuplicate(fn: Function): Promise<string> {

        return new Promise((resolve, reject) => {

            fs.ensureDirSync(path.dirname(this.targetPath));

            fn(this.sourcePath, this.targetPath, (err) => {

                if (err) {
                    return reject(err.message);
                }

                resolve(this.targetPath);
            });
        });

    }

}
