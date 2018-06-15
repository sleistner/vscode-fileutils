import * as path from 'path';
import { extensions, QuickPickItem, window } from 'vscode';
import { Cache } from '../lib/Cache';
import { TreeWalker } from '../lib/TreeWalker';

export class TypeAheadController {

    public async showDialog(sourcePath: string): Promise<string> {
        const cache = new Cache(`workspace:${sourcePath}`);
        const choices = await this.buildChoices(sourcePath, cache);

        if (choices.length < 2) {
            return sourcePath;
        }

        const item: QuickPickItem = await this.showQuickPick(choices);

        if (!item) {
            throw new Error();
        }

        const selection = item.label;
        cache.put('last', selection);

        return path.join(sourcePath, selection);
    }

    private async buildChoices(sourcePath: string, cache: Cache): Promise<QuickPickItem[]> {
        const treeWalker = new TreeWalker();

        return treeWalker.directories(sourcePath)
            .then(this.toQuickPickItems)
            .then(this.prependChoice('/', '- workspace root'))
            .then(this.prependChoice(cache.get('last'), '- last selection'));
    }

    private prependChoice(label: string, description: string): (choices: QuickPickItem[]) => QuickPickItem[] {
        return (choices) => {
            if (label) {
                const choice = { description, label };
                choices.unshift(choice);
            }
            return choices;
        };
    }

    private async toQuickPickItems(choices: string[]): Promise<QuickPickItem[]> {
        return choices.map((choice) => ({ label: choice, description: null }));
    }

    private async showQuickPick(choices: QuickPickItem[]) {
        const placeHolder = `
            First, select an existing path to create relative to (larger projects may take a moment to load)
        `;
        return window.showQuickPick<QuickPickItem>(choices, { placeHolder });
    }
}
