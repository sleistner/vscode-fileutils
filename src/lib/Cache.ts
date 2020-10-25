import * as vscode from "vscode";

export class Cache {
    private cache: { [key: string]: unknown };

    constructor(private storage: vscode.Memento, private namespace: string) {
        this.cache = storage.get(this.namespace, {});
    }

    public put(key: string, value: unknown): void {
        this.cache[key] = value;
        this.storage.update(this.namespace, this.cache);
    }

    public get<T>(key: string, defaultValue?: unknown): T {
        return (key in this.cache ? this.cache[key] : defaultValue) as T;
    }
}
