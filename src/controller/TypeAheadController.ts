import * as path from 'path';
import { QuickPickItem, window } from 'vscode';
import { Cache } from '../lib/Cache';
import { TreeWalker } from '../lib/TreeWalker';

export class TypeAheadController {

    constructor(private cache: Cache, private relativeToRoot: boolean) { }

    public async showDialog(sourcePath: string): Promise<string> {
        const items = await this.buildQuickPickItems(sourcePath);

        if (items.length < 2) {
            return sourcePath;
        }

        const item = await this.showQuickPick(items);

        if (!item) {
            throw new Error();
        }

        const selection = item.label;
        this.cache.put('last', selection);

        return path.join(sourcePath, selection);
    }

    private async buildQuickPickItems(sourcePath: string): Promise<QuickPickItem[]> {
        const directories = await this.listDirectoriesAtSourcePath(sourcePath);
        return [
            ...this.buildQuickPickItemsHeader(),
            ...directories.map((directory) => this.buildQuickPickItem(directory))
        ];
    }

    private async listDirectoriesAtSourcePath(sourcePath: string): Promise<string[]> {
        const treeWalker = new TreeWalker();
        return treeWalker.directories(sourcePath);
    }

    private buildQuickPickItemsHeader(): QuickPickItem[] {
        const items = [
            this.buildQuickPickItem('/', `- ${this.relativeToRoot ? 'workspace root' : 'current file'}`)
        ];

        const lastEntry = this.cache.get('last');
        if (lastEntry) {
            items.push(this.buildQuickPickItem(lastEntry, '- last selection'));
        }

        return items;
    }

    private buildQuickPickItem(label: string, description?: string | undefined): QuickPickItem {
        return { description, label };
    }

    private async showQuickPick(items: QuickPickItem[]) {
        const placeHolder = `
            First, select an existing path to create relative to (larger projects may take a moment to load)
        `;
        return window.showQuickPick<QuickPickItem>(items, { placeHolder });
    }
}
