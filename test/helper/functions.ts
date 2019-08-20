import * as retry from 'bluebird-retry';
import { TextDecoder } from 'util';
import { commands, ExtensionContext, Uri, window, workspace } from 'vscode';

const textDecoder = new TextDecoder('utf-8');

export async function readFile(file: Uri): Promise<string> {
    return textDecoder.decode(await workspace.fs.readFile(file));
}

export function createTestSubject(Command: any, Controller: any) {
    const context = {
        globalState: {
            get<T>(key: string, defaultValue: T) {
                return {};
            },
            update<T>(key: string, value: any) {
                return {};
            }
        }
    };
    const controller = new Controller(context as ExtensionContext);
    return new Command(controller);
}

export async function openDocument(document: Uri) {
    const tryOpenDocument = async () => {
        const textDocument = await workspace.openTextDocument(document);
        await window.showTextDocument(textDocument);
    };
    await retry(() => tryOpenDocument(), { max_tries: 4, interval: 500 });
}

export async function closeAllEditors() {
    await commands.executeCommand('workbench.action.closeAllEditors');
}
