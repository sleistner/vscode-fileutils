import * as retry from 'bluebird-retry';

import {
    Uri,
    window,
    workspace
} from 'vscode';

export async function openTextDocument(file) {
    const uri = Uri.file(file);
    const open = async () => {
        return workspace.openTextDocument(uri)
            .then((textDocument) => window.showTextDocument(textDocument));
    };

    return retry(open, { max_tries: 4, interval: 500 });
}
