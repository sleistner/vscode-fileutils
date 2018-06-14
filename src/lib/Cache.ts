import * as vscode from 'vscode';
import * as VSCodeCache from 'vscode-cache';

export class Cache extends VSCodeCache {
    [x: string]: any;

    private static Context: vscode.ExtensionContext;

    constructor(namespace: string) {
        super(Cache.Context, namespace);
    }

    public static set context(context: vscode.ExtensionContext) {
        Cache.Context = context;
    }
}
