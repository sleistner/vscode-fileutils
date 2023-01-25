import * as path from "path";
import { QuickPickItem, window } from "vscode";
import { Cache } from "../lib/Cache";
import { TreeWalker } from "../lib/TreeWalker";

async function waitForIOEvents(): Promise<void> {
    return new Promise((resolve) => setImmediate(resolve));
}

const ROOT_PATH = "/";

export class TypeAheadController {
    constructor(private cache: Cache, private relativeToRoot: boolean = false) {}

    public async showDialog(sourcePath: string): Promise<string> {
        const items = await this.buildQuickPickItems(sourcePath);

        const item = items.length === 1 ? items[0] : await this.showQuickPick(items);

        if (!item) {
            throw new Error();
        }

        const selection = item.label;
        this.cache.put("last", selection);

        return path.join(sourcePath, selection);
    }

    private async buildQuickPickItems(sourcePath: string): Promise<QuickPickItem[]> {
        const lastEntry: string = this.cache.get("last");
        const header = this.buildQuickPickItemsHeader(lastEntry);

        const directories = (await this.getDirectoriesAtSourcePath(sourcePath))
            .filter((directory) => directory !== lastEntry && directory !== ROOT_PATH)
            .map((directory) => this.buildQuickPickItem(directory));

        if (directories.length === 0 && header.length === 1) {
            return header;
        }

        return [...header, ...directories];
    }

    private async getDirectoriesAtSourcePath(sourcePath: string): Promise<string[]> {
        await waitForIOEvents();
        const treeWalker = new TreeWalker();
        return treeWalker.directories(sourcePath);
    }

    private buildQuickPickItemsHeader(lastEntry: string | undefined): QuickPickItem[] {
        const items = [
            this.buildQuickPickItem(ROOT_PATH, `- ${this.relativeToRoot ? "workspace root" : "current file"}`),
        ];

        if (lastEntry && lastEntry !== ROOT_PATH) {
            items.push(this.buildQuickPickItem(lastEntry, "- last selection"));
        }

        return items;
    }

    private buildQuickPickItem(label: string, description?: string | undefined): QuickPickItem {
        return { description, label };
    }

    private async showQuickPick(items: readonly QuickPickItem[]) {
        const hint = "larger projects may take a moment to load";
        const placeHolder = `First, select an existing path to create relative to (${hint})`;
        return window.showQuickPick(items, { placeHolder, ignoreFocusOut: true });
    }
}
