import * as path from "path";
import { QuickPickItem, window } from "vscode";
import { Cache } from "../lib/Cache";
import { TreeWalker } from "../lib/TreeWalker";

async function waitForIOEvents(): Promise<void> {
    return new Promise((resolve) => setImmediate(resolve));
}

export class TypeAheadController {
    constructor(private cache: Cache, private relativeToRoot: boolean) {}

    public async showDialog(sourcePath: string): Promise<string> {
        const item = await this.showQuickPick(this.buildQuickPickItems(sourcePath));

        if (!item) {
            throw new Error();
        }

        const selection = item.label;
        this.cache.put("last", selection);

        return path.join(sourcePath, selection);
    }

    private async buildQuickPickItems(sourcePath: string): Promise<QuickPickItem[]> {
        const directories = await this.listDirectoriesAtSourcePath(sourcePath);
        return [
            ...this.buildQuickPickItemsHeader(),
            ...directories.map((directory) => this.buildQuickPickItem(directory)),
        ];
    }

    private async listDirectoriesAtSourcePath(sourcePath: string): Promise<string[]> {
        await waitForIOEvents();
        const treeWalker = new TreeWalker();
        return treeWalker.directories(sourcePath);
    }

    private buildQuickPickItemsHeader(): QuickPickItem[] {
        const items = [this.buildQuickPickItem("/", `- ${this.relativeToRoot ? "workspace root" : "current file"}`)];

        const lastEntry: string = this.cache.get("last");
        if (lastEntry) {
            items.push(this.buildQuickPickItem(lastEntry, "- last selection"));
        }

        return items;
    }

    private buildQuickPickItem(label: string, description?: string | undefined): QuickPickItem {
        return { description, label };
    }

    private async showQuickPick(items: Thenable<QuickPickItem[]>) {
        const hint = "larger projects may take a moment to load";
        const placeHolder = `First, select an existing path to create relative to (${hint})`;
        return window.showQuickPick<QuickPickItem>(items, { placeHolder });
    }
}
