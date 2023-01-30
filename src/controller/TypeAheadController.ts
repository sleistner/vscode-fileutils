import * as fs from "fs";
import * as path from "path";
import { QuickPickItem, QuickPickItemKind, window } from "vscode";
import { Cache } from "../lib/Cache";
import { getConfiguration } from "../lib/config";
import { TreeWalker } from "../lib/TreeWalker";

type QuickPickItemHeaderOptions = {
    lastEntry: string | undefined;
    sourcePath: string;
    workspaceFolderPath: string;
};

type TypeAheadControllerOptions = {
    relativeToRoot: boolean;
    showParentFolder?: boolean;
};

async function waitForIOEvents(): Promise<void> {
    return new Promise((resolve) => setImmediate(resolve));
}

const WORKSPACE_FOLDER = path.sep;
const CURRENT_FOLDER = ".";
const PARENT_PATH = "..";
const LABEL_PADDING = Math.max(CURRENT_FOLDER.length, WORKSPACE_FOLDER.length, PARENT_PATH.length);

export class TypeAheadController {
    private readonly relativeToRoot: boolean;
    private readonly showParentFolder: boolean;

    constructor(private cache: Cache, options: TypeAheadControllerOptions) {
        this.relativeToRoot = options.relativeToRoot ?? false;
        this.showParentFolder = options.showParentFolder ?? false;
    }

    public async showDialog(sourcePath: string, workspaceFolderPath: string): Promise<string> {
        const item = await this.getQuickPickItem(sourcePath, workspaceFolderPath);

        if (!item) {
            throw new Error();
        }

        const selection = item.label;

        this.addToCacheIfApplicable(selection);

        if (selection === PARENT_PATH) {
            return await this.showDialog(path.join(sourcePath, item.label), workspaceFolderPath);
        }

        if (selection === CURRENT_FOLDER) {
            return sourcePath;
        }

        if (selection === WORKSPACE_FOLDER) {
            return workspaceFolderPath;
        }

        return path.join(sourcePath, selection);
    }

    private async getQuickPickItem(
        sourcePath: string,
        workspaceFolderPath: string
    ): Promise<QuickPickItem | undefined> {
        const { header, directories } = await this.buildQuickPickItems(sourcePath, workspaceFolderPath);

        if (directories.length === 0 && header.length === 1) {
            return header[0];
        }

        return await this.showQuickPick([...header, ...directories]);
    }

    private addToCacheIfApplicable(selection: string) {
        if (selection !== WORKSPACE_FOLDER && selection !== CURRENT_FOLDER && selection !== PARENT_PATH) {
            this.cache.put("last", selection);
        }
    }

    private async buildQuickPickItems(
        sourcePath: string,
        workspaceFolderPath: string
    ): Promise<{ header: QuickPickItem[]; directories: QuickPickItem[] }> {
        const lastEntry: string = this.cache.get("last");
        const header = this.buildQuickPickItemsHeader({ lastEntry, sourcePath, workspaceFolderPath });

        const directories = (await this.getDirectoriesAtSourcePath(sourcePath))
            .filter((directory) => directory !== lastEntry && directory !== WORKSPACE_FOLDER)
            .map((directory) => this.buildQuickPickItem(directory));

        return { header, directories };
    }

    private async getDirectoriesAtSourcePath(sourcePath: string): Promise<string[]> {
        await waitForIOEvents();
        const treeWalker = new TreeWalker();
        return treeWalker.directories(sourcePath);
    }

    private buildQuickPickItemsHeader(options: QuickPickItemHeaderOptions): QuickPickItem[] {
        const { lastEntry, sourcePath, workspaceFolderPath } = options;
        const items = [];

        if (this.relativeToRoot) {
            items.push(...this.buildQuickPickItemsHeaderForRelativeRoot(sourcePath, workspaceFolderPath));
        } else {
            items.push(this.buildQuickPickItem(CURRENT_FOLDER, "current folder"));
        }

        if (
            lastEntry &&
            lastEntry !== WORKSPACE_FOLDER &&
            lastEntry !== CURRENT_FOLDER &&
            fs.existsSync(path.join(sourcePath, lastEntry))
        ) {
            items.push(this.buildQuickPickItem(lastEntry, "last selection"));
        }

        return items;
    }

    private buildQuickPickItemsHeaderForRelativeRoot(sourcePath: string, workspaceFolderPath: string): QuickPickItem[] {
        const workplaceFolderIndicator: string = getConfiguration("inputBox.pathTypeIndicator") ?? "";

        const items = [
            {
                kind: QuickPickItemKind.Separator,
                label: sourcePath.replace(workspaceFolderPath, workplaceFolderIndicator),
            },
            this.buildQuickPickItem(CURRENT_FOLDER, "current folder"),
        ];

        const parentPath = path.join(sourcePath, PARENT_PATH);

        if (this.showParentFolder && path.join(workspaceFolderPath, PARENT_PATH) !== parentPath) {
            const item = this.buildQuickPickItem(PARENT_PATH, "parent folder");
            items.push(item);
        }

        if (workspaceFolderPath !== sourcePath) {
            const item = this.buildQuickPickItem(WORKSPACE_FOLDER, "workspace root");
            items.push(item);
        }

        return items;
    }

    private buildQuickPickItem(label: string, description?: string | undefined): QuickPickItem {
        if (description) {
            const padding = LABEL_PADDING - label.length;
            return { label, description: `${"".padStart(padding)}${description}` };
        }
        return { label };
    }

    private async showQuickPick(items: readonly QuickPickItem[]) {
        const hint = "larger projects may take a moment to load";
        const placeHolder = `First, select an existing path to create relative to (${hint})`;
        return window.showQuickPick(items, { placeHolder, ignoreFocusOut: true });
    }
}
