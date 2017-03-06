import {
    commands,
    ExtensionContext
} from 'vscode';
import * as api from './commands';

function register(context: ExtensionContext, handler: any) {

    const command = `fileutils.${handler.name}`;
    const disposable = commands.registerCommand(command, handler);

    context.subscriptions.push(disposable);
}

export function activate(context: ExtensionContext) {

    register(context, api.moveFile);
    register(context, api.renameFile);
    register(context, api.duplicateFile);
    register(context, api.removeFile);
    register(context, api.newFile);
    register(context, api.newFileAtRoot);
    register(context, api.newFolder);
    register(context, api.newFolderAtRoot);

}
