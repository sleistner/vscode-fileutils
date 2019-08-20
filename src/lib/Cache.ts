import * as vscode from 'vscode';

export class Cache {
    private cache: { [key: string]: any };

    constructor(private storage: vscode.Memento, private namespace: string) {
        this.cache = storage.get(this.namespace, {});
    }

    public put(key: string, value: any) {
        this.cache[key] = value;
        this.storage.update(this.namespace, this.cache);
    }

    public get(key: string, defaultValue?: any) {
        return key in this.cache ? this.cache[key] : defaultValue;
    }
}
