import * as vscode from 'vscode';
import * as commands from './command';
import { Cache } from './lib/Cache';

function handleError(err) {
    if (err) {
        vscode.window.showErrorMessage(err);
    }
    return err;
}

function register(context: vscode.ExtensionContext, handler: any) {
    const commandName = `fileutils.${handler.name}`;
    const fn = (...args) => handler(...args).catch(handleError);
    const disposable = vscode.commands.registerCommand(commandName, fn);

    context.subscriptions.push(disposable);
}

export function activate(context: vscode.ExtensionContext) {
    Cache.context = context;

    register(context, commands.moveFile);
    register(context, commands.renameFile);
    register(context, commands.duplicateFile);
    register(context, commands.removeFile);
    register(context, commands.newFile);
    register(context, commands.newFileAtRoot);
    register(context, commands.newFolder);
    register(context, commands.newFolderAtRoot);
}
