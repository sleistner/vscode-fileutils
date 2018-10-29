import * as vscode from 'vscode';
import {
    CopyFileNameCommand,
    DuplicateFileCommand,
    ICommand,
    MoveFileCommand,
    NewFileAtRootCommand,
    NewFileCommand,
    NewFolderAtRootCommand,
    NewFolderCommand,
    RemoveFileCommand,
    RenameFileCommand
} from './command';
import { Cache } from './lib/Cache';

function handleError(err) {
    if (err) {
        vscode.window.showErrorMessage(err);
    }
    return err;
}

function register(context: vscode.ExtensionContext, command: ICommand, commandName: string) {
    const proxy = (...args) => command.execute(...args).catch(handleError);
    const disposable = vscode.commands.registerCommand(`fileutils.${commandName}`, proxy);

    context.subscriptions.push(disposable);
}

export function activate(context: vscode.ExtensionContext) {
    Cache.context = context;

    register(context, new MoveFileCommand(), 'moveFile');
    register(context, new RenameFileCommand(), 'renameFile');
    register(context, new DuplicateFileCommand(), 'duplicateFile');
    register(context, new RemoveFileCommand(), 'removeFile');
    register(context, new NewFileCommand(), 'newFile');
    register(context, new NewFileAtRootCommand(), 'newFileAtRoot');
    register(context, new NewFolderCommand(), 'newFolder');
    register(context, new NewFolderAtRootCommand(), 'newFolderAtRoot');
    register(context, new CopyFileNameCommand(), 'copyFileName');
}
