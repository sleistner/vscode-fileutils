import * as vscode from 'vscode';
import * as commands from './commands';

function register(context: vscode.ExtensionContext, name: string) {

    const controller = commands[name];
    const disposable = vscode.commands.registerCommand(`extension.${name}`, controller);
    
    context.subscriptions.push(disposable);
}


export function activate(context: vscode.ExtensionContext) {
    
    register(context, 'moveFile');
    register(context, 'renameFile');
    register(context, 'duplicateFile');
    register(context, 'removeFile');
    register(context, 'newFile');
    register(context, 'newFileAtRoot');
    register(context, 'newFolder');
    register(context, 'newFolderAtRoot');

}