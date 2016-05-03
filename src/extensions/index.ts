/// <reference path="../../typings/tsd.d.ts" />

import { ExtensionContext, commands, window } from 'vscode';
import { rename, move, duplicate, remove } from './commands';

function register(context: ExtensionContext, name: string, controller) {

    const disposable = commands.registerCommand(`extension.${name}File`, controller);
    context.subscriptions.push(disposable);
}


export function activate(context: ExtensionContext) {
    
    register(context, 'move', move);
    register(context, 'rename', rename);
    register(context, 'duplicate', duplicate);
    register(context, 'remove', remove);

}