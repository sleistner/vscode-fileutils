import retry from "bluebird-retry";
import { TextDecoder } from "util";
import { commands, ExtensionContext, Uri, window, workspace } from "vscode";

const textDecoder = new TextDecoder("utf-8");

export async function readFile(file: Uri): Promise<string> {
    return textDecoder.decode(await workspace.fs.readFile(file));
}

export function createExtensionContext(): ExtensionContext {
    const context = {
        globalState: {
            get() {
                return {};
            },
            async update(): Promise<void> {
                return;
            },
        },
    };
    return (context as unknown) as ExtensionContext;
}

export async function openDocument(document: Uri): Promise<void> {
    const tryOpenDocument = async () => {
        const textDocument = await workspace.openTextDocument(document);
        await window.showTextDocument(textDocument);
    };
    await retry(() => tryOpenDocument(), { max_tries: 4, interval: 500 });
}

export async function closeAllEditors(): Promise<void> {
    await commands.executeCommand("workbench.action.closeAllEditors");
}
